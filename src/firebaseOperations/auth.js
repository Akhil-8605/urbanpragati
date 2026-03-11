import { auth, db } from '../firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    updateDoc,
    query,
    collection,
    where,
    getDocs,
} from 'firebase/firestore';

// ─── REGISTER ───────────────────────────────────────────────────────────────
export const registerUser = async (email, password, role, extraData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const collectionName = role === 'worker' ? 'workers' : role === 'admin' ? 'admins' : 'citizens';

    const baseData = {
        uid: user.uid,
        email: user.email,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...extraData,
    };

    // Citizens get reward points
    if (role === 'citizen') {
        baseData.rewardPoints = 0;
        baseData.totalComplaints = 0;
        baseData.resolvedComplaints = 0;
    }

    // Workers get status
    if (role === 'worker') {
        baseData.isVerified = false;
        baseData.tasksCompleted = 0;
        baseData.department = extraData.department || '';
    }

    // Admins get department
    if (role === 'admin') {
        baseData.department = extraData.department || '';
        baseData.isVerified = false;
        baseData.complaintsHandled = 0;
    }

    await setDoc(doc(db, collectionName, user.uid), baseData);
    return { user, userData: baseData };
};

// ─── LOGIN ───────────────────────────────────────────────────────────────────
export const loginUser = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Determine role by checking each collection
    const citizenSnap = await getDoc(doc(db, 'citizens', user.uid));
    if (citizenSnap.exists()) {
        return { user, userData: citizenSnap.data(), role: 'citizen' };
    }

    const workerSnap = await getDoc(doc(db, 'workers', user.uid));
    if (workerSnap.exists()) {
        return { user, userData: workerSnap.data(), role: 'worker' };
    }

    const adminSnap = await getDoc(doc(db, 'admins', user.uid));
    if (adminSnap.exists()) {
        return { user, userData: adminSnap.data(), role: 'admin' };
    }

    throw new Error('User record not found in any role collection.');
};

// ─── DETECT ADMIN BY EMAIL PATTERN ───────────────────────────────────────────
export const isAdminEmail = (email) => {
    // Pattern: urbanpragati.[department]@gmail.com
    const adminEmailPattern = /^urbanpragati\.[a-z-]+@gmail\.com$/i;
    return adminEmailPattern.test(email);
};

// ─── GET ADMIN DEPARTMENT FROM EMAIL ──────────────────────────────────────────
export const getAdminDepartmentFromEmail = (email) => {
    const match = email.match(/^urbanpragati\.([a-z-]+)@gmail\.com$/i);
    if (match) {
        const dept = match[1].replace(/-/g, ' ').toLowerCase();
        return dept.charAt(0).toUpperCase() + dept.slice(1);
    }
    return '';
};

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
export const logoutUser = async () => {
    await signOut(auth);
    localStorage.clear();
};

// ─── GET USER PROFILE ────────────────────────────────────────────────────────
export const getUserProfile = async (uid, role) => {
    const collectionName = role === 'worker' ? 'workers' : role === 'admin' ? 'admins' : 'citizens';
    const snap = await getDoc(doc(db, collectionName, uid));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    return null;
};

// ─── UPDATE CITIZEN POINTS ───────────────────────────────────────────────────
export const addCitizenPoints = async (uid, pointsToAdd) => {
    const ref = doc(db, 'citizens', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const current = snap.data().rewardPoints || 0;
    await updateDoc(ref, {
        rewardPoints: current + pointsToAdd,
        updatedAt: serverTimestamp(),
    });
};

// ─── LISTEN AUTH STATE ───────────────────────────────────────────────────────
export const listenAuthState = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// ─── SYNC USER TO LOCALSTORAGE ───────────────────────────────────────────────
export const syncUserToLocalStorage = async (firebaseUser) => {
    if (!firebaseUser) {
        localStorage.clear();
        return null;
    }

    const token = await firebaseUser.getIdToken();
    localStorage.setItem('userToken', token);

    // Check each role
    for (const [role, col] of [['citizen', 'citizens'], ['worker', 'workers'], ['admin', 'admins']]) {
        const snap = await getDoc(doc(db, col, firebaseUser.uid));
        if (snap.exists()) {
            const userData = { ...snap.data(), uid: firebaseUser.uid };
            localStorage.setItem('userRole', role);
            localStorage.setItem('userData', JSON.stringify(userData));
            return { role, userData };
        }
    }
    return null;
};
