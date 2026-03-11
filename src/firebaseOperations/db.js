import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
export const createComplaint = async (complaintData) => {
  try {
    const dataWithTimestamp = {
      ...complaintData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: complaintData.status || "Pending",
    };
    const docRef = await addDoc(
      collection(db, "complaints"),
      dataWithTimestamp,
    );
    return { id: docRef.id, ...dataWithTimestamp };
  } catch (error) {
    throw error;
  }
};
export const getComplaintsByDepartment = async (department) => {
  try {
    const q = query(
      collection(db, "complaints"),
      where("department", "==", department),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};
export const getComplaintsByUser = async (userId) => {
  try {
    const q = query(
      collection(db, "complaints"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};
export const updateComplaintStatus = async (complaintId, status) => {
  try {
    const complaintRef = doc(db, "complaints", complaintId);
    await updateDoc(complaintRef, {
      status: status,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    throw error;
  }
};
export const getAllComplaints = async () => {
  try {
    const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};
export const assignComplaintToWorker = async (complaintId, workerId) => {
  try {
    const complaintRef = doc(db, "complaints", complaintId);
    await updateDoc(complaintRef, {
      workerId: workerId,
      status: "Assigned",
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    throw error;
  }
};
export const approveComplaint = async (complaintId) => {
  try {
    const complaintRef = doc(db, "complaints", complaintId);
    await updateDoc(complaintRef, {
      status: "Approved",
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    throw error;
  }
};
export const createServiceRequest = async (serviceData) => {
  try {
    const dataWithTimestamp = {
      ...serviceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: serviceData.status || "Pending",
    };
    const docRef = await addDoc(collection(db, "services"), dataWithTimestamp);
    return { id: docRef.id, ...dataWithTimestamp };
  } catch (error) {
    throw error;
  }
};
export const getServiceRequestsByDepartment = async (department) => {
  try {
    const q = query(
      collection(db, "services"),
      where("department", "==", department),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};
export const getServiceRequestsByUser = async (userId) => {
  try {
    const q = query(
      collection(db, "services"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};
export const updateServiceRequestStatus = async (serviceId, status) => {
  try {
    const serviceRef = doc(db, "services", serviceId);
    await updateDoc(serviceRef, {
      status: status,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    throw error;
  }
};
export const getAllFeedbacks = async () => {
  try {
    const q = query(collection(db, "feedbacks"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};
export const getTopCitizens = async () => {
  try {
    const q = query(collection(db, "citizens"), orderBy("points", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

export const getWorkersByDepartment = async (department) => {
  try {
    const q = query(collection(db, "workers"), where("department", "==", department));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

export const createNewDevelopment = async (devData) => {
  try {
    const dataWithTimestamp = {
      ...devData,
      createdAt: serverTimestamp(),
      interested_citizens: [],
      not_interested_citizens: [],
    };
    const docRef = await addDoc(collection(db, "new_developments"), dataWithTimestamp);
    return { id: docRef.id, ...dataWithTimestamp };
  } catch (error) {
    throw error;
  }
};

export const getAllDevelopments = async () => {
  try {
    const q = query(collection(db, "new_developments"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

export const voteDevelopment = async (devId, userId, voteType) => {
  try {
    const devRef = doc(db, "new_developments", devId);
    if (voteType === "interest") {
      await updateDoc(devRef, {
        interested_citizens: arrayUnion(userId),
        not_interested_citizens: arrayRemove(userId),
      });
    } else {
      await updateDoc(devRef, {
        not_interested_citizens: arrayUnion(userId),
        interested_citizens: arrayRemove(userId),
      });
    }
    return true;
  } catch (error) {
    throw error;
  }
};

// ─── CITIZEN PROPOSALS ───────────────────────────────────────────────────────
export const submitCitizenProposal = async (proposalData) => {
  try {
    const data = {
      ...proposalData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: "pending_approval",
      votes_interested: [],
      votes_not_interested: [],
    };
    const ref = await addDoc(collection(db, "citizen_proposals"), data);
    return { id: ref.id, ...data };
  } catch (error) {
    throw error;
  }
};

export const getApprovedCitizenProposals = async () => {
  try {
    const q = query(
      collection(db, "citizen_proposals"),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    throw error;
  }
};

export const getAllCitizenProposals = async () => {
  try {
    const q = query(collection(db, "citizen_proposals"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    throw error;
  }
};

export const approveCitizenProposal = async (proposalId) => {
  try {
    await updateDoc(doc(db, "citizen_proposals", proposalId), {
      status: "approved",
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    throw error;
  }
};

export const rejectCitizenProposal = async (proposalId, reason = "") => {
  try {
    await updateDoc(doc(db, "citizen_proposals", proposalId), {
      status: "rejected",
      rejectionReason: reason,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// ─── FEEDBACKS ────────────────────────────────────────────────────────────────
export const submitFeedback = async (feedbackData) => {
  try {
    const data = {
      ...feedbackData,
      createdAt: serverTimestamp(),
      helpful: 0,
    };
    const ref = await addDoc(collection(db, "feedbacks"), data);
    return { id: ref.id, ...data };
  } catch (error) {
    throw error;
  }
};

export const getFeedbacksByUser = async (userId) => {
  try {
    const q = query(
      collection(db, "feedbacks"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    throw error;
  }
};

// ─── REAL-TIME HELPERS ─────────────────────────────────────────────────────
export const listenComplaintsByUser = (userId, callback) => {
  const q = query(
    collection(db, "complaints"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const listenAllDevelopments = (callback) => {
  const q = query(collection(db, "new_developments"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const listenApprovedCitizenProposals = (callback) => {
  const q = query(
    collection(db, "citizen_proposals"),
    where("status", "==", "approved"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── PROPERTY TAX ─────────────────────────────────────────────────────────────
export const getPropertyTaxRecords = async (searchQuery = "") => {
  try {
    const q = query(collection(db, "property_tax"), orderBy("ownerName", "asc"));
    const snap = await getDocs(q);
    let records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      records = records.filter(
        (r) =>
          r.ownerName?.toLowerCase().includes(lower) ||
          r.propertyId?.toLowerCase().includes(lower) ||
          r.address?.toLowerCase().includes(lower)
      );
    }
    return records;
  } catch (error) {
    throw error;
  }
};

export const getPropertyTaxByUser = async (userId) => {
  try {
    const q = query(collection(db, "property_tax"), where("userId", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    throw error;
  }
};

export const recordPropertyTaxPayment = async (recordId, paymentData) => {
  try {
    const ref = doc(db, "property_tax", recordId);
    await updateDoc(ref, {
      status: "Paid",
      paidAt: serverTimestamp(),
      paymentHistory: arrayUnion({
        ...paymentData,
        paidAt: new Date().toISOString(),
      }),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export const addNotificationToUser = async (userId, notification) => {
  try {
    const ref = doc(db, "citizens", userId);
    await updateDoc(ref, {
      notifications: arrayUnion({
        ...notification,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        read: false,
      }),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    throw error;
  }
};

export const updateComplaintStatusWithNotification = async (
  complaintId,
  status,
  citizenId,
  notificationMessage
) => {
  try {
    const complaintRef = doc(db, "complaints", complaintId);
    await updateDoc(complaintRef, {
      status,
      updatedAt: serverTimestamp(),
    });
    if (citizenId && notificationMessage) {
      await addNotificationToUser(citizenId, {
        type: status === "Resolved" ? "success" : status === "Rejected" ? "error" : "info",
        message: notificationMessage,
        complaintId,
      });
    }
    return true;
  } catch (error) {
    throw error;
  }
};
export const resolveComplaintWithProof = async (complaintId, citizenId, proofUrl, resolutionMessage) => {
  try {
    const complaintRef = doc(db, "complaints", complaintId);
    await updateDoc(complaintRef, {
      status: "Resolved",
      resolutionImage: proofUrl || null,
      resolvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    if (citizenId && resolutionMessage) {
      await addNotificationToUser(citizenId, {
        type: "success",
        message: resolutionMessage,
        complaintId,
        proofUrl: proofUrl || null,
      });
    }
    return true;
  } catch (error) {
    throw error;
  }
};

export const assignComplaintToWorkerWithNotification = async (
  complaintId,
  workerId,
  workerName,
  citizenId
) => {
  try {
    const complaintRef = doc(db, "complaints", complaintId);
    await updateDoc(complaintRef, {
      workerId,
      workerName,
      status: "Assigned",
      updatedAt: serverTimestamp(),
    });
    if (citizenId) {
      await addNotificationToUser(citizenId, {
        type: "info",
        message: `Your complaint has been assigned to worker ${workerName}. Work will begin soon.`,
        complaintId,
      });
    }
    return true;
  } catch (error) {
    throw error;
  }
};

export const rejectComplaint = async (complaintId, reason, citizenId) => {
  try {
    await updateComplaintStatusWithNotification(
      complaintId,
      "Rejected",
      citizenId,
      `Your complaint has been reviewed and rejected. Reason: ${reason || "Does not meet criteria."}`
    );
    return true;
  } catch (error) {
    throw error;
  }
};

// ─── WORKER QUOTATION ─────────────────────────────────────────────────────────
export const submitWorkerQuotation = async (complaintId, quotationData) => {
  try {
    const ref = doc(db, "complaints", complaintId);
    await updateDoc(ref, {
      quotation: {
        ...quotationData,
        submittedAt: new Date().toISOString(),
        paymentStatus: "Pending",
      },
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    throw error;
  }
};

export const recordWorkerPayment = async (complaintId, paymentData) => {
  try {
    const ref = doc(db, "complaints", complaintId);
    await updateDoc(ref, {
      "quotation.paymentStatus": "Paid",
      "quotation.paymentData": paymentData,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// ─── DEPT-FILTERED FEEDBACK ───────────────────────────────────────────────────
export const getFeedbacksByDepartment = async (department) => {
  try {
    let q;
    if (!department || department === "All") {
      q = query(collection(db, "feedbacks"), orderBy("createdAt", "desc"));
    } else {
      q = query(
        collection(db, "feedbacks"),
        where("department", "in", [department, "General", ""]),
        orderBy("createdAt", "desc")
      );
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    // fallback: get all
    const snap = await getDocs(query(collection(db, "feedbacks"), orderBy("createdAt", "desc")));
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (!department || department === "All") return all;
    return all.filter(
      (f) => !f.department || f.department === "" || f.department === "General" || f.department === department
    );
  }
};

// ─── REAL-TIME DEPT COMPLAINTS ────────────────────────────────────────────────
export const listenComplaintsByDepartment = (department, callback) => {
  const q = query(
    collection(db, "complaints"),
    where("department", "==", department),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

// ─── WORKER TASKS (assigned to specific worker) ───────────────────────────────
export const listenTasksByWorker = (workerId, callback) => {
  const q = query(
    collection(db, "complaints"),
    where("workerId", "==", workerId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};
