import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

const REQUESTS_KEY = 'medguard_requests';
const GUARDS_KEY = 'medguard_guards';
const FEEDBACK_KEY = 'medguard_feedback';

// Sample guards data
const DEFAULT_GUARDS = [
  { id: 'g1', name: 'Rajesh Kumar', phone: '+91 98765 00001', status: 'available' },
  { id: 'g2', name: 'Suresh Patel', phone: '+91 98765 00002', status: 'available' },
  { id: 'g3', name: 'Mohan Singh', phone: '+91 98765 00003', status: 'available' },
  { id: 'g4', name: 'Anil Sharma', phone: '+91 98765 00004', status: 'available' },
  { id: 'g5', name: 'Vikram Rao', phone: '+91 98765 00005', status: 'available' },
];

// ---- DEMO DATA ----
const today = new Date().toISOString().split('T')[0];
const DEMO_REQUESTS = [
  {
    id: 'REQ-DEMO001', studentId: 'demo-s1', studentName: 'Ananya Verma', studentEmail: 'ananya@hostel.edu',
    hostelBlock: 'Block A', roomNumber: '102', contactNumber: '+91 98765 11111',
    reason: 'Fever / Cold / Flu', description: 'High fever since last night, temperature above 102°F. Need urgent medical attention.',
    urgency: 'urgent', preferredDate: today, preferredTime: '10:00', hospitalName: 'City General Hospital',
    status: 'approved', assignedGuard: 'g1', createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(), approvedBy: 'Dr. Mehra (Warden)',
    approvedAt: new Date(Date.now() - 3000000).toISOString(), rejectionReason: null,
    trackingStatus: 'at_hospital', escalated: false, escalatedAt: null, escalatedTo: null,
    parentNotified: false, completedAt: null,
  },
  {
    id: 'REQ-DEMO002', studentId: 'demo-s2', studentName: 'Rohan Gupta', studentEmail: 'rohan@hostel.edu',
    hostelBlock: 'Block B', roomNumber: '305', contactNumber: '+91 98765 22222',
    reason: 'Injury / Accident', description: 'Sprained ankle while playing football. Swelling is increasing.',
    urgency: 'emergency', preferredDate: today, preferredTime: '14:30', hospitalName: 'Apollo Clinic',
    status: 'approved', assignedGuard: 'g2', createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(), approvedBy: 'Auto-approved (Emergency)',
    approvedAt: new Date(Date.now() - 7000000).toISOString(), rejectionReason: null,
    trackingStatus: 'returning', escalated: true, escalatedAt: new Date(Date.now() - 6800000).toISOString(),
    escalatedTo: 'Proctor', parentNotified: true, completedAt: null,
  },
  {
    id: 'REQ-DEMO003', studentId: 'demo-s3', studentName: 'Priya Nair', studentEmail: 'priya@hostel.edu',
    hostelBlock: 'Block C', roomNumber: '210', contactNumber: '+91 98765 33333',
    reason: 'Eye / Vision Issue', description: 'Blurred vision and headache. Need eye checkup.',
    urgency: 'normal', preferredDate: today, preferredTime: '11:00', hospitalName: 'Sankara Eye Hospital',
    status: 'approved', assignedGuard: 'g3', createdAt: new Date(Date.now() - 5400000).toISOString(),
    updatedAt: new Date(Date.now() - 2700000).toISOString(), approvedBy: 'Dr. Mehra (Warden)',
    approvedAt: new Date(Date.now() - 5000000).toISOString(), rejectionReason: null,
    trackingStatus: 'departed', escalated: false, escalatedAt: null, escalatedTo: null,
    parentNotified: false, completedAt: null,
  },
  {
    id: 'REQ-DEMO004', studentId: 'demo-s4', studentName: 'Karthik Rajan', studentEmail: 'karthik@hostel.edu',
    hostelBlock: 'Block A', roomNumber: '415', contactNumber: '+91 98765 44444',
    reason: 'Dental Issue', description: 'Severe toothache. Might need a root canal.',
    urgency: 'urgent', preferredDate: today, preferredTime: '09:30', hospitalName: 'Smile Dental Clinic',
    status: 'approved', assignedGuard: 'g4', createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(), approvedBy: 'Dr. Mehra (Warden)',
    approvedAt: new Date(Date.now() - 1500000).toISOString(), rejectionReason: null,
    trackingStatus: 'preparing', escalated: false, escalatedAt: null, escalatedTo: null,
    parentNotified: false, completedAt: null,
  },
  {
    id: 'REQ-DEMO005', studentId: 'demo-s5', studentName: 'Sneha Iyer', studentEmail: 'sneha@hostel.edu',
    hostelBlock: 'Block B', roomNumber: '118', contactNumber: '+91 98765 55555',
    reason: 'Lab Tests / Reports', description: 'Blood test and urine test for routine health checkup.',
    urgency: 'normal', preferredDate: today, preferredTime: '08:00', hospitalName: 'City General Hospital',
    status: 'pending', assignedGuard: null, createdAt: new Date(Date.now() - 900000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(), approvedBy: null,
    approvedAt: null, rejectionReason: null,
    trackingStatus: null, escalated: false, escalatedAt: null, escalatedTo: null,
    parentNotified: false, completedAt: null,
  },
  {
    id: 'REQ-DEMO006', studentId: 'demo-s6', studentName: 'Amit Desai', studentEmail: 'amit@hostel.edu',
    hostelBlock: 'Block C', roomNumber: '301', contactNumber: '+91 98765 66666',
    reason: 'Mental Health / Counselling', description: 'Feeling very anxious. Need to talk to a counsellor.',
    urgency: 'urgent', preferredDate: today, preferredTime: '15:00', hospitalName: 'Wellness Center',
    status: 'pending', assignedGuard: null, createdAt: new Date(Date.now() - 2400000).toISOString(),
    updatedAt: new Date(Date.now() - 2400000).toISOString(), approvedBy: null,
    approvedAt: null, rejectionReason: null,
    trackingStatus: null, escalated: true, escalatedAt: new Date(Date.now() - 600000).toISOString(),
    escalatedTo: 'Proctor', parentNotified: true, completedAt: null,
  },
  {
    id: 'REQ-DEMO007', studentId: 'demo-s7', studentName: 'Divya Sharma', studentEmail: 'divya@hostel.edu',
    hostelBlock: 'Block A', roomNumber: '208', contactNumber: '+91 98765 77777',
    reason: 'General Checkup', description: 'Completed routine checkup. All reports normal.',
    urgency: 'normal', preferredDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], preferredTime: '10:00',
    hospitalName: 'City General Hospital',
    status: 'completed', assignedGuard: 'g5', createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 72000000).toISOString(), approvedBy: 'Dr. Mehra (Warden)',
    approvedAt: new Date(Date.now() - 85000000).toISOString(), rejectionReason: null,
    trackingStatus: 'completed', escalated: false, escalatedAt: null, escalatedTo: null,
    parentNotified: false, completedAt: new Date(Date.now() - 72000000).toISOString(),
  },
];

const DEMO_GUARDS_STATE = [
  { id: 'g1', name: 'Rajesh Kumar', phone: '+91 98765 00001', status: 'assigned' },
  { id: 'g2', name: 'Suresh Patel', phone: '+91 98765 00002', status: 'assigned' },
  { id: 'g3', name: 'Mohan Singh', phone: '+91 98765 00003', status: 'assigned' },
  { id: 'g4', name: 'Anil Sharma', phone: '+91 98765 00004', status: 'assigned' },
  { id: 'g5', name: 'Vikram Rao', phone: '+91 98765 00005', status: 'available' },
];

const DEMO_FEEDBACK = [
  {
    id: 'FB-DEMO01', requestId: 'REQ-DEMO007', studentId: 'demo-s7', studentName: 'Divya Sharma',
    rating: 5, hospitalExperience: 'Very smooth process. Doctor was very attentive and thorough.',
    guardBehavior: 'Rajesh was very helpful and supportive throughout the visit.',
    suggestions: 'Maybe add a pharmacy pickup option on the way back.',
    createdAt: new Date(Date.now() - 70000000).toISOString(),
  },
  {
    id: 'FB-DEMO02', requestId: 'REQ-PREV01', studentId: 'demo-s1', studentName: 'Ananya Verma',
    rating: 4, hospitalExperience: 'Good experience overall. Waited 20 minutes but treatment was quick.',
    guardBehavior: 'Guard was punctual and waited patiently during the consultation.',
    suggestions: 'A way to share location with parents in real-time would be great.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'FB-DEMO03', requestId: 'REQ-PREV02', studentId: 'demo-s3', studentName: 'Priya Nair',
    rating: 3, hospitalExperience: 'Hospital was crowded. Had to wait a long time for the eye checkup.',
    guardBehavior: 'Guard was cooperative but seemed unfamiliar with the hospital layout.',
    suggestions: 'Would help if guards know the hospital beforehand.',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

const DEMO_SEEDED_KEY = 'medguard_demo_seeded_v2';

function getStored(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}
function setStored(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [guards, setGuards] = useState([]);
  const [feedback, setFeedback] = useState([]);

  // Load data on mount — seed demo data if storage is empty
  useEffect(() => {
    const storedRequests = getStored(REQUESTS_KEY, null);
    if (!storedRequests || storedRequests.length === 0) {
      // No data present: seed demo data
      setStored(REQUESTS_KEY, DEMO_REQUESTS);
      setStored(GUARDS_KEY, DEMO_GUARDS_STATE);
      setStored(FEEDBACK_KEY, DEMO_FEEDBACK);
      setRequests(DEMO_REQUESTS);
      setGuards(DEMO_GUARDS_STATE);
      setFeedback(DEMO_FEEDBACK);
    } else {
      setRequests(storedRequests);
      setGuards(getStored(GUARDS_KEY, DEMO_GUARDS_STATE));
      setFeedback(getStored(FEEDBACK_KEY, DEMO_FEEDBACK));
    }
  }, []);

  // Persist
  useEffect(() => { if (requests.length >= 0) setStored(REQUESTS_KEY, requests); }, [requests]);
  useEffect(() => { if (guards.length > 0) setStored(GUARDS_KEY, guards); }, [guards]);
  useEffect(() => { if (feedback.length >= 0) setStored(FEEDBACK_KEY, feedback); }, [feedback]);

  // ---- Request Actions ----
  const submitRequest = useCallback((data) => {
    const newReq = {
      id: 'REQ-' + Date.now().toString(36).toUpperCase(),
      studentId: user?.id,
      studentName: user?.fullName,
      studentEmail: user?.email,
      hostelBlock: user?.hostelBlock,
      roomNumber: user?.roomNumber,
      contactNumber: user?.contactNumber,
      reason: data.reason,
      description: data.description,
      urgency: data.urgency, // 'normal', 'urgent', 'emergency'
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      hospitalName: data.hospitalName || '',
      status: data.urgency === 'emergency' ? 'approved' : 'pending',
      assignedGuard: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvedBy: data.urgency === 'emergency' ? 'Auto-approved (Emergency)' : null,
      approvedAt: data.urgency === 'emergency' ? new Date().toISOString() : null,
      rejectionReason: null,
      trackingStatus: data.urgency === 'emergency' ? 'preparing' : null,
      escalated: false,
      escalatedAt: null,
      escalatedTo: null,
      parentNotified: data.urgency === 'emergency',
      completedAt: null,
    };
    setRequests(prev => [newReq, ...prev]);
    return newReq;
  }, [user]);

  const approveRequest = useCallback((reqId, guardId, approverName) => {
    setRequests(prev => prev.map(r => {
      if (r.id !== reqId) return r;
      return {
        ...r,
        status: 'approved',
        assignedGuard: guardId,
        approvedBy: approverName || 'Warden',
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        trackingStatus: 'preparing',
      };
    }));
    if (guardId) {
      setGuards(prev => prev.map(g =>
        g.id === guardId ? { ...g, status: 'assigned' } : g
      ));
    }
  }, []);

  const rejectRequest = useCallback((reqId, reason, rejecterName) => {
    setRequests(prev => prev.map(r => {
      if (r.id !== reqId) return r;
      return {
        ...r,
        status: 'rejected',
        rejectionReason: reason,
        approvedBy: rejecterName || 'Warden',
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const escalateRequest = useCallback((reqId) => {
    setRequests(prev => prev.map(r => {
      if (r.id !== reqId) return r;
      return {
        ...r,
        escalated: true,
        escalatedAt: new Date().toISOString(),
        escalatedTo: 'Proctor',
        parentNotified: true,
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const updateTrackingStatus = useCallback((reqId, newStatus) => {
    setRequests(prev => prev.map(r => {
      if (r.id !== reqId) return r;
      const updates = {
        ...r,
        trackingStatus: newStatus,
        updatedAt: new Date().toISOString(),
      };
      if (newStatus === 'completed') {
        updates.completedAt = new Date().toISOString();
        updates.status = 'completed';
        // Free up the guard
        if (r.assignedGuard) {
          setGuards(prev => prev.map(g =>
            g.id === r.assignedGuard ? { ...g, status: 'available' } : g
          ));
        }
      }
      return updates;
    }));
  }, []);

  // ---- Feedback Actions ----
  const submitFeedback = useCallback((data) => {
    const fb = {
      id: 'FB-' + Date.now().toString(36).toUpperCase(),
      requestId: data.requestId,
      studentId: user?.id,
      studentName: user?.fullName,
      rating: data.rating,
      hospitalExperience: data.hospitalExperience,
      guardBehavior: data.guardBehavior,
      suggestions: data.suggestions,
      createdAt: new Date().toISOString(),
    };
    setFeedback(prev => [fb, ...prev]);
    return fb;
  }, [user]);

  // ---- Computed Data ----
  const myRequests = requests.filter(r => r.studentId === user?.id);
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const activeVisits = requests.filter(r =>
    r.status === 'approved' && r.trackingStatus && r.trackingStatus !== 'completed'
  );
  const completedRequests = requests.filter(r => r.status === 'completed');
  const availableGuards = guards.filter(g => g.status === 'available');

  // Stats
  const stats = {
    totalRequests: requests.length,
    pending: pendingRequests.length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    completed: completedRequests.length,
    activeVisits: activeVisits.length,
    escalated: requests.filter(r => r.escalated).length,
    avgRating: feedback.length > 0
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
      : 'N/A',
    totalFeedback: feedback.length,
    emergencyCount: requests.filter(r => r.urgency === 'emergency').length,
    guardsAvailable: availableGuards.length,
    guardsTotal: guards.length,
  };

  return (
    <DataContext.Provider value={{
      requests, myRequests, pendingRequests, activeVisits, completedRequests,
      guards, availableGuards, feedback, stats,
      submitRequest, approveRequest, rejectRequest, escalateRequest,
      updateTrackingStatus, submitFeedback,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
