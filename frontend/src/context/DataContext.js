'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

// Seed demo data
function generateSeedData() {
  const now = Date.now();
  const hour = 3600000;
  const day = 86400000;

  const requests = [
    { id: 'REQ-001', studentId: 'STU001', studentName: 'Rahul Sharma', studentEmail: 'rahul@hostel.edu', hostelBlock: 'Block A', roomNumber: '204', contactNumber: '+91 98765 43210', reason: 'Fever / Cold / Flu', description: 'Having high fever since last night, need to visit hospital for checkup and medicines.', urgency: 'urgent', preferredDate: new Date(now + day).toISOString().split('T')[0], preferredTime: '10:00', hospitalName: 'City General Hospital', status: 'approved', createdAt: new Date(now - 2 * hour).toISOString(), approvedBy: 'Dr. Meera Reddy', approvedAt: new Date(now - hour).toISOString(), assignedGuard: 'GRD001', trackingStatus: 'at_hospital', escalated: false, parentNotified: false },
    { id: 'REQ-002', studentId: 'STU002', studentName: 'Priya Patel', studentEmail: 'priya@hostel.edu', hostelBlock: 'Block B', roomNumber: '112', contactNumber: '+91 87654 32109', reason: 'Dental Issue', description: 'Severe toothache, need dental consultation urgently.', urgency: 'normal', preferredDate: new Date(now + day).toISOString().split('T')[0], preferredTime: '14:00', hospitalName: 'Smile Dental Clinic', status: 'pending', createdAt: new Date(now - 30 * 60000).toISOString(), escalated: false, parentNotified: false },
    { id: 'REQ-003', studentId: 'STU003', studentName: 'Amit Kumar', studentEmail: 'amit@hostel.edu', hostelBlock: 'Block A', roomNumber: '307', contactNumber: '+91 76543 21098', reason: 'Injury / Accident', description: 'Twisted ankle while playing football, difficulty walking. Need X-ray.', urgency: 'emergency', preferredDate: new Date(now).toISOString().split('T')[0], preferredTime: '09:00', hospitalName: 'Apollo Hospital', status: 'approved', createdAt: new Date(now - 3 * hour).toISOString(), approvedBy: 'System (Auto)', approvedAt: new Date(now - 3 * hour).toISOString(), assignedGuard: 'GRD002', trackingStatus: 'returning', escalated: true, escalatedTo: 'Proctor', escalatedAt: new Date(now - 2.5 * hour).toISOString(), parentNotified: true },
    { id: 'REQ-004', studentId: 'STU001', studentName: 'Rahul Sharma', studentEmail: 'rahul@hostel.edu', hostelBlock: 'Block A', roomNumber: '204', contactNumber: '+91 98765 43210', reason: 'General Checkup', description: 'Routine health checkup and blood test as prescribed by doctor.', urgency: 'normal', preferredDate: new Date(now - 3 * day).toISOString().split('T')[0], preferredTime: '11:00', hospitalName: 'City General Hospital', status: 'completed', createdAt: new Date(now - 4 * day).toISOString(), approvedBy: 'Dr. Meera Reddy', approvedAt: new Date(now - 3.5 * day).toISOString(), assignedGuard: 'GRD001', trackingStatus: 'completed', completedAt: new Date(now - 3 * day).toISOString(), escalated: false, parentNotified: false, feedbackGiven: true },
    { id: 'REQ-005', studentId: 'STU002', studentName: 'Priya Patel', studentEmail: 'priya@hostel.edu', hostelBlock: 'Block B', roomNumber: '112', contactNumber: '+91 87654 32109', reason: 'Eye / Vision Issue', description: 'Blurry vision and headaches, need eye checkup.', urgency: 'normal', preferredDate: new Date(now - 2 * day).toISOString().split('T')[0], preferredTime: '15:00', hospitalName: 'Vision Care Center', status: 'completed', createdAt: new Date(now - 3 * day).toISOString(), approvedBy: 'Dr. Meera Reddy', approvedAt: new Date(now - 2.5 * day).toISOString(), assignedGuard: 'GRD002', trackingStatus: 'completed', completedAt: new Date(now - 2 * day).toISOString(), escalated: false, parentNotified: false, feedbackGiven: true },
    { id: 'REQ-006', studentId: 'STU003', studentName: 'Amit Kumar', studentEmail: 'amit@hostel.edu', hostelBlock: 'Block A', roomNumber: '307', contactNumber: '+91 76543 21098', reason: 'Follow-up Visit', description: 'Follow-up visit for previous ankle injury. Doctor wants to check recovery.', urgency: 'normal', preferredDate: new Date(now + 2 * day).toISOString().split('T')[0], preferredTime: '10:30', hospitalName: 'Apollo Hospital', status: 'pending', createdAt: new Date(now - 15 * 60000).toISOString(), escalated: false, parentNotified: false },
    { id: 'REQ-007', studentId: 'STU001', studentName: 'Rahul Sharma', studentEmail: 'rahul@hostel.edu', hostelBlock: 'Block A', roomNumber: '204', contactNumber: '+91 98765 43210', reason: 'Stomach / Digestion', description: 'Severe stomach pain and vomiting since morning.', urgency: 'urgent', preferredDate: new Date(now).toISOString().split('T')[0], preferredTime: '08:00', hospitalName: '', status: 'rejected', createdAt: new Date(now - 5 * day).toISOString(), rejectedBy: 'Dr. Meera Reddy', rejectionReason: 'Please visit the hostel medical room first for initial assessment.', escalated: false, parentNotified: false },
    { id: 'REQ-008', studentId: 'STU002', studentName: 'Priya Patel', studentEmail: 'priya@hostel.edu', hostelBlock: 'Block B', roomNumber: '112', contactNumber: '+91 87654 32109', reason: 'Mental Health / Counselling', description: 'Feeling very anxious and stressed. Would like to see a counselor.', urgency: 'normal', preferredDate: new Date(now + day).toISOString().split('T')[0], preferredTime: '16:00', hospitalName: 'Mind Wellness Center', status: 'pending', createdAt: new Date(now - 45 * 60000).toISOString(), escalated: true, escalatedTo: 'Proctor', escalatedAt: new Date(now - 15 * 60000).toISOString(), parentNotified: true },
    { id: 'REQ-009', studentId: 'STU003', studentName: 'Amit Kumar', studentEmail: 'amit@hostel.edu', hostelBlock: 'Block A', roomNumber: '307', contactNumber: '+91 76543 21098', reason: 'Lab Tests / Reports', description: 'Need to collect blood test reports from the hospital.', urgency: 'normal', preferredDate: new Date(now - day).toISOString().split('T')[0], preferredTime: '12:00', hospitalName: 'City General Hospital', status: 'completed', createdAt: new Date(now - 2 * day).toISOString(), approvedBy: 'Dr. Meera Reddy', approvedAt: new Date(now - 1.5 * day).toISOString(), assignedGuard: 'GRD001', trackingStatus: 'completed', completedAt: new Date(now - day).toISOString(), escalated: false, parentNotified: false, feedbackGiven: false },
    { id: 'REQ-010', studentId: 'STU001', studentName: 'Rahul Sharma', studentEmail: 'rahul@hostel.edu', hostelBlock: 'Block A', roomNumber: '204', contactNumber: '+91 98765 43210', reason: 'Skin Problem', description: 'Rash developing on arms, possibly allergic reaction.', urgency: 'normal', preferredDate: new Date(now + day).toISOString().split('T')[0], preferredTime: '11:30', hospitalName: 'Derma Care Clinic', status: 'approved', createdAt: new Date(now - 4 * hour).toISOString(), approvedBy: 'Dr. Meera Reddy', approvedAt: new Date(now - 3 * hour).toISOString(), assignedGuard: 'GRD002', trackingStatus: 'preparing', escalated: false, parentNotified: false },
    { id: 'REQ-011', studentId: 'STU002', studentName: 'Priya Patel', studentEmail: 'priya@hostel.edu', hostelBlock: 'Block B', roomNumber: '112', contactNumber: '+91 87654 32109', reason: 'Fever / Cold / Flu', description: 'Running nose and mild fever for two days.', urgency: 'normal', preferredDate: new Date(now - 4 * day).toISOString().split('T')[0], preferredTime: '09:30', hospitalName: 'City General Hospital', status: 'completed', createdAt: new Date(now - 5 * day).toISOString(), approvedBy: 'Dr. Meera Reddy', approvedAt: new Date(now - 4.5 * day).toISOString(), assignedGuard: 'GRD001', trackingStatus: 'completed', completedAt: new Date(now - 4 * day).toISOString(), escalated: false, parentNotified: false, feedbackGiven: true },
    { id: 'REQ-012', studentId: 'STU003', studentName: 'Amit Kumar', studentEmail: 'amit@hostel.edu', hostelBlock: 'Block A', roomNumber: '307', contactNumber: '+91 76543 21098', reason: 'General Checkup', description: 'Annual health check required by the sports department.', urgency: 'normal', preferredDate: new Date(now + 3 * day).toISOString().split('T')[0], preferredTime: '10:00', hospitalName: 'Sports Medicine Center', status: 'pending', createdAt: new Date(now - 20 * 60000).toISOString(), escalated: false, parentNotified: false },
  ];

  const guards = [
    { id: 'GRD001', name: 'Rajesh Singh', phone: '+91 88776 65544', status: 'on_duty' },
    { id: 'GRD002', name: 'Vikram Yadav', phone: '+91 88665 54433', status: 'on_duty' },
    { id: 'GRD003', name: 'Sunil Verma', phone: '+91 88554 43322', status: 'available' },
    { id: 'GRD004', name: 'Manoj Tiwari', phone: '+91 88443 32211', status: 'available' },
  ];

  const feedback = [
    { id: 'FB001', requestId: 'REQ-004', studentId: 'STU001', studentName: 'Rahul Sharma', rating: 5, hospitalExperience: 'The hospital staff was very helpful and quick. Got treated within 30 minutes.', guardBehavior: 'Rajesh was very supportive and helped me throughout the visit.', suggestions: 'Everything was great. Maybe have a faster approval process.', createdAt: new Date(now - 3 * day).toISOString() },
    { id: 'FB002', requestId: 'REQ-005', studentId: 'STU002', studentName: 'Priya Patel', rating: 4, hospitalExperience: 'Good experience overall. Waited a bit but the doctor was thorough.', guardBehavior: 'Guard was professional and on time.', suggestions: 'Would be nice to have online appointment booking integrated.', createdAt: new Date(now - 2 * day).toISOString() },
    { id: 'FB003', requestId: 'REQ-011', studentId: 'STU002', studentName: 'Priya Patel', rating: 3, hospitalExperience: 'The waiting time was too long. Spent 2 hours at the hospital.', guardBehavior: '', suggestions: 'Please tie up with hospitals for priority service for hostel students.', createdAt: new Date(now - 4 * day).toISOString() },
  ];

  return { requests, guards, feedback };
}

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState(() => generateSeedData());
  const { requests, guards, feedback } = data;

  const myRequests = requests.filter(r => r.studentId === user?.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const pendingRequests = requests.filter(r => r.status === 'pending').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const activeVisits = requests.filter(r => r.status === 'approved' && r.trackingStatus && r.trackingStatus !== 'completed');

  const availableGuards = guards.filter(g => g.status === 'available');

  const stats = {
    totalRequests: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    completed: requests.filter(r => r.status === 'completed').length,
    escalated: requests.filter(r => r.escalated).length,
    emergencyCount: requests.filter(r => r.urgency === 'emergency').length,
    activeVisits: activeVisits.length,
    guardsAvailable: guards.filter(g => g.status === 'available').length,
    guardsTotal: guards.length,
    avgRating: feedback.length > 0 ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1) : 'N/A',
  };

  const submitRequest = useCallback((formData) => {
    const id = `REQ-${String(requests.length + 1).padStart(3, '0')}`;
    const isEmergency = formData.urgency === 'emergency';
    const newReq = {
      id,
      studentId: user?.id,
      studentName: user?.fullName,
      studentEmail: user?.email,
      hostelBlock: user?.hostelBlock,
      roomNumber: user?.roomNumber,
      contactNumber: user?.contactNumber,
      ...formData,
      status: isEmergency ? 'approved' : 'pending',
      createdAt: new Date().toISOString(),
      ...(isEmergency ? {
        approvedBy: 'System (Auto)',
        approvedAt: new Date().toISOString(),
        assignedGuard: guards.find(g => g.status === 'available')?.id || 'GRD001',
        trackingStatus: 'preparing',
        escalated: true,
        escalatedTo: 'Proctor',
        escalatedAt: new Date().toISOString(),
        parentNotified: true,
      } : {
        escalated: false,
        parentNotified: false,
      }),
    };
    setData(prev => ({ ...prev, requests: [newReq, ...prev.requests] }));
    return newReq;
  }, [user, requests.length, guards]);

  const approveRequest = useCallback((reqId, guardId, approverName) => {
    setData(prev => ({
      ...prev,
      requests: prev.requests.map(r =>
        r.id === reqId ? {
          ...r,
          status: 'approved',
          approvedBy: approverName,
          approvedAt: new Date().toISOString(),
          assignedGuard: guardId,
          trackingStatus: 'preparing',
        } : r
      ),
      guards: prev.guards.map(g =>
        g.id === guardId ? { ...g, status: 'on_duty' } : g
      ),
    }));
  }, []);

  const rejectRequest = useCallback((reqId, reason, rejectorName) => {
    setData(prev => ({
      ...prev,
      requests: prev.requests.map(r =>
        r.id === reqId ? {
          ...r,
          status: 'rejected',
          rejectionReason: reason,
          rejectedBy: rejectorName,
        } : r
      ),
    }));
  }, []);

  const escalateRequest = useCallback((reqId) => {
    setData(prev => ({
      ...prev,
      requests: prev.requests.map(r =>
        r.id === reqId ? {
          ...r,
          escalated: true,
          escalatedTo: 'Proctor',
          escalatedAt: new Date().toISOString(),
          parentNotified: true,
        } : r
      ),
    }));
  }, []);

  const updateTrackingStatus = useCallback((reqId, newStatus) => {
    setData(prev => ({
      ...prev,
      requests: prev.requests.map(r => {
        if (r.id !== reqId) return r;
        const updated = { ...r, trackingStatus: newStatus };
        if (newStatus === 'completed') {
          updated.status = 'completed';
          updated.completedAt = new Date().toISOString();
        }
        return updated;
      }),
      guards: newStatus === 'completed'
        ? prev.guards.map(g => {
            const req = prev.requests.find(r => r.id === reqId);
            return g.id === req?.assignedGuard ? { ...g, status: 'available' } : g;
          })
        : prev.guards,
    }));
  }, []);

  const submitFeedback = useCallback((fb) => {
    const newFb = {
      id: `FB${String(feedback.length + 1).padStart(3, '0')}`,
      studentId: user?.id,
      studentName: user?.fullName,
      ...fb,
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      feedback: [newFb, ...prev.feedback],
      requests: prev.requests.map(r =>
        r.id === fb.requestId ? { ...r, feedbackGiven: true } : r
      ),
    }));
  }, [user, feedback.length]);

  return (
    <DataContext.Provider value={{
      requests, myRequests, pendingRequests, activeVisits, guards,
      availableGuards, stats, feedback,
      submitRequest, approveRequest, rejectRequest,
      escalateRequest, updateTrackingStatus, submitFeedback,
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
