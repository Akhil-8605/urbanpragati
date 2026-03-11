import React, { useState, useEffect, useRef } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import CitizenNavbar from '../components/CitizenNavbar';
import CitizenFooter from '../components/CitizenFooter';
import ServiceCard from '../components/ServiceCard';
import { listenComplaintsByUser, getTopCitizens } from '../../firebaseOperations/db';
import { getUserProfile } from '../../firebaseOperations/auth';
import './CitizenDashboard.css';

const SERVICES_TEMPLATE = [
    { icon: '💧', id: 'Water', title: 'Water Services', description: 'Report leaks, request new connections, and track water quality issues.', to: '/citizen/water', color: '#3B82F6' },
    { icon: '⚡', id: 'Electricity', title: 'Electricity', description: 'Report power outages, faulty meters, and streetlight issues instantly.', to: '/citizen/electricity', color: '#F59E0B' },
    { icon: '🗑️', id: 'Sanitation', title: 'Sanitation', description: 'Garbage collection requests, overflowing bins, and cleanliness grievances.', to: '/citizen/sanitation', color: '#10B981' },
    { icon: '🏠', id: 'Property Tax', title: 'Property Tax', description: 'Pay property tax online, download receipts, and check assessment history.', to: '/citizen/property-tax', color: '#8B5CF6' },
    { icon: '🛣️', id: 'Road Repair', title: 'Road Repair', description: 'Report potholes, broken footpaths, and damaged road markings near you.', to: '/citizen/road-repair', color: '#EF4444' },
    { icon: '🏗️', id: 'Development', title: 'Development', description: 'Vote on proposed city projects, parks, libraries, and public infrastructure.', to: '/citizen/development', color: '#FF6F00' },
    { icon: '💬', id: 'Feedback', title: 'Feedback', description: 'Share your thoughts on city services and rate your recent experiences.', to: '/citizen/feedback', color: '#06B6D4' },
    { icon: '🏆', id: 'Best Citizen', title: 'Best Citizen', description: 'Top contributors who make their city better. Monthly leaderboard updated live.', to: '/citizen/best-citizen', color: '#FFD700' },
];

const STATUS_COLORS = {
    Pending: { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
    Assigned: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
    Approved: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
    Resolved: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
    Done: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
    Rejected: { bg: '#FFF1F0', text: '#CF1322', border: '#FFCCC7' },
};

function StatusChip({ status }) {
    const s = STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
    return (
        <span
            className="cdash-status-chip"
            style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
        >
            {status}
        </span>
    );
}

function timeAgo(seconds) {
    if (!seconds) return '';
    const diff = Math.floor(Date.now() / 1000 - seconds);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function buildChartData(complaints) {
    const map = {};
    complaints.forEach(c => {
        const dept = c.department || c.category || 'Other';
        if (!map[dept]) map[dept] = { name: dept, Pending: 0, Resolved: 0 };
        const isDone = ['Resolved', 'Done', 'Approved'].includes(c.status);
        if (isDone) map[dept].Resolved += 1;
        else map[dept].Pending += 1;
    });
    return Object.values(map);
}

function buildTimelineData(complaints) {
    const map = {};
    [...complaints]
        .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
        .forEach(c => {
            let label = 'N/A';
            if (c.createdAt?.seconds) {
                const d = new Date(c.createdAt.seconds * 1000);
                label = `${d.getDate()}/${d.getMonth() + 1}`;
            }
            map[label] = { date: label, count: (map[label]?.count || 0) + 1 };
        });
    return Object.values(map);
}

function buildNotifications(complaints, rewardPoints) {
    const notifs = [];

    // Points notification
    if (rewardPoints > 0) {
        notifs.push({
            id: 'pts',
            title: 'Reward Points Earned',
            desc: `You have ${rewardPoints} Pragati Points. Keep reporting to climb the leaderboard!`,
            time: 'Live',
            type: 'points',
        });
    }

    // Last 5 complaint updates
    [...complaints]
        .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0))
        .slice(0, 5)
        .forEach(c => {
            const isDone = ['Resolved', 'Done', 'Approved'].includes(c.status);
            notifs.push({
                id: c.id,
                title: isDone ? 'Complaint Resolved' : c.status === 'Assigned' ? 'Worker Assigned' : 'Complaint Logged',
                desc: `Your ${c.department || 'service'} complaint "${c.issueType || c.category || ''}" is ${c.status}.`,
                time: timeAgo(c.updatedAt?.seconds || c.createdAt?.seconds),
                type: isDone ? 'success' : c.status === 'Assigned' ? 'info' : 'default',
            });
        });

    return notifs;
}

export default function CitizenDashboard() {
    const [userData, setUserData] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [topCitizens, setTopCitizens] = useState([]);
    const [loading, setLoading] = useState(true);
    const unsubRef = useRef(null);

    useEffect(() => {
        const stored = localStorage.getItem('userData');
        if (!stored) { setLoading(false); return; }

        const storedUser = JSON.parse(stored);
        setUserData(storedUser);

        // Fetch fresh profile + top citizens in parallel
        Promise.all([
            getUserProfile(storedUser.uid, 'citizen').catch(() => null),
            getTopCitizens().catch(() => []),
        ]).then(([profile, leaders]) => {
            if (profile) {
                const merged = { ...storedUser, ...profile };
                setUserData(merged);
                localStorage.setItem('userData', JSON.stringify(merged));
            }
            setTopCitizens(leaders.slice(0, 5));
        });

        // Real-time listener for complaints
        unsubRef.current = listenComplaintsByUser(storedUser.uid, (data) => {
            setComplaints(data);
            setLoading(false);
        });

        return () => { if (unsubRef.current) unsubRef.current(); };
    }, []);

    const userPoints = userData?.rewardPoints || 0;
    const roleText = userPoints >= 500 ? 'Elite Citizen' : userPoints >= 200 ? 'Proactive Citizen' : 'Active Citizen';
    const rankColor = userPoints >= 500 ? '#FFD700' : userPoints >= 200 ? '#10B981' : '#3B82F6';
    const nextLevel = userPoints >= 500 ? 1000 : userPoints >= 200 ? 500 : 200;
    const progress = Math.min(100, Math.round((userPoints / nextLevel) * 100));

    const pendingComplaints = complaints.filter(c => !['Resolved', 'Done', 'Approved'].includes(c.status));
    const resolvedComplaints = complaints.filter(c => ['Resolved', 'Done', 'Approved'].includes(c.status));
    const chartData = buildChartData(complaints);
    const timelineData = buildTimelineData(complaints);
    const notifications = buildNotifications(complaints, userPoints);

    // Services with live complaint stats
    const services = SERVICES_TEMPLATE.map(s => {
        if (['Property Tax', 'Development', 'Best Citizen', 'Feedback'].includes(s.id)) return s;
        const dept = complaints.filter(c => c.department === s.id || c.category === s.id);
        const open = dept.filter(c => !['Resolved', 'Done', 'Approved'].includes(c.status)).length;
        const done = dept.filter(c => ['Resolved', 'Done', 'Approved'].includes(c.status)).length;
        return { ...s, stats: [{ value: String(open), label: 'Open' }, { value: String(done), label: 'Resolved' }] };
    });

    // Current user rank in leaderboard
    const myRank = userData?.uid
        ? topCitizens.findIndex(c => c.uid === userData.uid) + 1
        : 0;

    return (
        <div className="cdash-gamified-page">
            <CitizenNavbar />

            <main className="cdash-main-content">
                {/* ── HERO / GAMIFICATION ─────────────────────────────── */}
                <section className="cdash-hero-gamify">
                    <div className="cdash-hero-content">
                        <div className="cdash-welcome">
                            <h1>
                                Welcome back,{' '}
                                <span className="cdash-highlight">
                                    {userData?.displayName || userData?.name || 'Citizen'}
                                </span>
                            </h1>
                            <p>Track your impact, manage requests, and earn points for keeping the city clean.</p>

                            <div className="cdash-quick-stats">
                                <div className="cdash-qs-item">
                                    <span className="cdash-qs-num" style={{ color: '#F59E0B' }}>{complaints.length}</span>
                                    <span className="cdash-qs-label">Total Filed</span>
                                </div>
                                <div className="cdash-qs-sep" aria-hidden="true" />
                                <div className="cdash-qs-item">
                                    <span className="cdash-qs-num" style={{ color: '#EF4444' }}>{pendingComplaints.length}</span>
                                    <span className="cdash-qs-label">Pending</span>
                                </div>
                                <div className="cdash-qs-sep" aria-hidden="true" />
                                <div className="cdash-qs-item">
                                    <span className="cdash-qs-num" style={{ color: '#10B981' }}>{resolvedComplaints.length}</span>
                                    <span className="cdash-qs-label">Resolved</span>
                                </div>
                            </div>
                        </div>

                        <div className="cdash-level-card">
                            <div
                                className="cdash-level-badge"
                                style={{ background: `${rankColor}20`, color: rankColor, border: `1px solid ${rankColor}50` }}
                            >
                                {roleText}
                            </div>
                            <div className="cdash-points-display">
                                <div className="cdash-points-number" style={{ color: rankColor }}>{userPoints.toLocaleString()}</div>
                                <div className="cdash-points-label">Pragati Points</div>
                            </div>
                            <div className="cdash-progress-container">
                                <div className="cdash-progress-info">
                                    <span>Level Progress</span>
                                    <span>{userPoints} / {nextLevel}</span>
                                </div>
                                <div className="cdash-progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
                                    <div className="cdash-progress-fill" style={{ width: `${progress}%`, background: rankColor }} />
                                </div>
                            </div>
                            {myRank > 0 && (
                                <p className="cdash-rank-note" style={{ color: rankColor }}>
                                    Leaderboard Rank: #{myRank}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                <div className="cdash-grid-layout">
                    {/* ── LEFT: CHARTS ───────────────────────────────── */}
                    <div className="cdash-left-col">
                        {/* Issue Distribution */}
                        <div className="cdash-glass-panel">
                            <div className="cdash-panel-header">
                                <h3>Issue Distribution</h3>
                                <p className="cdash-panel-subtitle">Complaints by Category &amp; Status</p>
                            </div>
                            <div className="cdash-chart-container">
                                {loading || chartData.length === 0 ? (
                                    <div className="cdash-empty-state">
                                        {loading ? 'Loading...' : 'Submit complaints to see issue distribution.'}
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} allowDecimals={false} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                contentStyle={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(17,24,39,0.95)', color: '#fff' }}
                                                itemStyle={{ color: '#E5E7EB' }}
                                            />
                                            <Legend iconType="circle" wrapperStyle={{ paddingTop: 10, color: '#9CA3AF', fontSize: 12 }} />
                                            <Bar dataKey="Pending" fill="#F59E0B" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={1200} />
                                            <Bar dataKey="Resolved" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={1400} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Activity Timeline */}
                        <div className="cdash-glass-panel">
                            <div className="cdash-panel-header">
                                <h3>Activity Timeline</h3>
                                <p className="cdash-panel-subtitle">Your submissions over time</p>
                            </div>
                            <div className="cdash-chart-container cdash-chart-small">
                                {loading || timelineData.length === 0 ? (
                                    <div className="cdash-empty-state">
                                        {loading ? 'Loading...' : 'No timeline data yet.'}
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.07)" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} allowDecimals={false} />
                                            <Tooltip contentStyle={{ borderRadius: 8, border: 'none', background: 'rgba(0,0,0,0.8)', color: '#fff' }} />
                                            <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#areaGrad)" animationDuration={1800} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Active Complaints list */}
                        <div className="cdash-glass-panel">
                            <div className="cdash-panel-header">
                                <h3>Active Complaints</h3>
                                <p className="cdash-panel-subtitle">Issues that are still in progress</p>
                            </div>
                            <div className="cdash-complaints-list">
                                {loading ? (
                                    <p className="cdash-empty-state">Loading...</p>
                                ) : pendingComplaints.length === 0 ? (
                                    <div className="cdash-all-clear">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28" aria-hidden="true">
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>All complaints resolved. Great work!</span>
                                    </div>
                                ) : (
                                    pendingComplaints.slice(0, 6).map(c => (
                                        <div className="cdash-complaint-row" key={c.id}>
                                            <div className="cdash-complaint-dot" style={{ background: STATUS_COLORS[c.status]?.text || '#6B7280' }} aria-hidden="true" />
                                            <div className="cdash-complaint-info">
                                                <span className="cdash-complaint-title">{c.issueType || c.department || 'Complaint'}</span>
                                                <span className="cdash-complaint-meta">{c.address || 'No address'} · {timeAgo(c.createdAt?.seconds)}</span>
                                            </div>
                                            <StatusChip status={c.status} />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: NOTIFICATIONS + LEADERBOARD ──────────── */}
                    <div className="cdash-right-col">
                        {/* Notifications */}
                        <div className="cdash-glass-panel cdash-notifications-panel">
                            <div className="cdash-panel-header">
                                <h3>Notifications</h3>
                                <div className="cdash-pulse-indicator" aria-hidden="true" />
                            </div>
                            <div className="cdash-notifs-list">
                                {loading ? (
                                    <p className="cdash-notif-loading">Loading...</p>
                                ) : notifications.length === 0 ? (
                                    <div className="cdash-empty-state">No recent notifications.</div>
                                ) : (
                                    notifications.map((n, i) => (
                                        <div key={n.id} className={`cdash-notif-card cdash-notif-${n.type}`} style={{ animationDelay: `${i * 0.08}s` }}>
                                            <div className="cdash-notif-icon" aria-hidden="true">
                                                {n.type === 'points' && <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}
                                                {n.type === 'success' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><path d="M20 6L9 17l-5-5" /></svg>}
                                                {n.type === 'info' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>}
                                                {n.type === 'default' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M15 17H9a6 6 0 01-6-6V9a9 9 0 0118 0v2a6 6 0 01-6 6zM9 17v1a3 3 0 006 0v-1" /></svg>}
                                            </div>
                                            <div className="cdash-notif-body">
                                                <h4>{n.title}</h4>
                                                <p>{n.desc}</p>
                                                <span className="cdash-notif-time">{n.time}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Leaderboard preview */}
                        <div className="cdash-glass-panel">
                            <div className="cdash-panel-header">
                                <h3>Leaderboard</h3>
                                <a href="/citizen/best-citizen" className="cdash-panel-link">View all</a>
                            </div>
                            {topCitizens.length === 0 ? (
                                <div className="cdash-empty-state" style={{ padding: '20px 0' }}>No leaderboard data yet.</div>
                            ) : (
                                <div className="cdash-leader-list">
                                    {topCitizens.map((c, i) => (
                                        <div key={c.uid || i} className={`cdash-leader-row ${c.uid === userData?.uid ? 'cdash-leader-row--me' : ''}`}>
                                            <span className="cdash-leader-rank" style={{ color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#9CA3AF' }}>
                                                #{i + 1}
                                            </span>
                                            <div className="cdash-leader-avatar" aria-hidden="true">
                                                {(c.displayName || c.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="cdash-leader-name">
                                                {c.displayName || c.name || 'Citizen'}
                                                {c.uid === userData?.uid && <span className="cdash-leader-you">You</span>}
                                            </span>
                                            <span className="cdash-leader-pts" style={{ color: '#FF6F00' }}>
                                                {(c.rewardPoints || 0).toLocaleString()} pts
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── SERVICES HUB ──────────────────────────────────────── */}
                <section className="cdash-services-section">
                    <div className="cdash-section-header">
                        <h2>City Services Hub</h2>
                        <p>Select a department to report issues or access services</p>
                        <div className="cdash-accent-line" aria-hidden="true" />
                    </div>
                    <div className="cdash-services-grid">
                        {services.map((s, i) => <ServiceCard key={i} {...s} />)}
                    </div>
                </section>
            </main>

            <CitizenFooter />
        </div>
    );
}
