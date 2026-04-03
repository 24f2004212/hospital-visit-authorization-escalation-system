'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '@/utils/api';

const DataContext = createContext(null);
const APPROVAL_ESCALATION_MINUTES = 30;
const APPROVAL_ESCALATION_MS = APPROVAL_ESCALATION_MINUTES * 60 * 1000;

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [guards, setGuards] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch all data when user is logged in
  const fetchData = useCallback(async () => {
    if (!user) {
      setRequests([]);
      setGuards([]);
      setFeedback([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    try {
      const [reqRes, guardsRes, fbRes] = await Promise.all([
        api.get('/requests'),
        api.get('/requests/guards'),
        api.get('/requests/feedback'),
      ]);
      setRequests(reqRes.data || []);
      setGuards(guardsRes.data || []);
      setFeedback(fbRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      // If API isn't reachable, keep empty arrays
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const autoEscalateOverduePendingRequests = useCallback(async () => {
    if (!user || dataLoading) return;

    const now = Date.now();
    const overduePendingRequests = requests.filter((request) => {
      if (request.status !== 'pending' || request.escalated) return false;

      const createdAtMs = Date.parse(request.createdAt);
      if (Number.isNaN(createdAtMs)) return false;

      return now - createdAtMs >= APPROVAL_ESCALATION_MS;
    });

    if (overduePendingRequests.length === 0) return;

    const updatedById = new Map();
    await Promise.all(
      overduePendingRequests.map(async (request) => {
        try {
          const res = await api.patch(`/requests/${request.id}/escalate`);
          updatedById.set(request.id, res.data);
        } catch (err) {
          console.error(`Failed to auto-escalate request ${request.id}:`, err);
        }
      }),
    );

    if (updatedById.size > 0) {
      setRequests((prev) => prev.map((request) => updatedById.get(request.id) ?? request));
    }
  }, [dataLoading, requests, user]);

  useEffect(() => {
    autoEscalateOverduePendingRequests();
    const timer = setInterval(() => {
      autoEscalateOverduePendingRequests();
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, [autoEscalateOverduePendingRequests]);

  // ---- Request Actions ----
  const submitRequest = useCallback(async (data) => {
    try {
      const res = await api.post('/requests', data);
      const newReq = res.data;
      setRequests(prev => [newReq, ...prev]);
      return newReq;
    } catch (err) {
      console.error('Failed to submit request:', err);
      throw err;
    }
  }, []);

  const approveRequest = useCallback(async (reqId, guardId, approverName) => {
    try {
      const res = await api.patch(`/requests/${reqId}/approve`, { guardId });
      const updated = res.data;
      setRequests(prev => prev.map(r => r.id === reqId ? updated : r));
      // Refresh guard list
      const guardsRes = await api.get('/requests/guards');
      setGuards(guardsRes.data || []);
    } catch (err) {
      console.error('Failed to approve request:', err);
      throw err;
    }
  }, []);

  const rejectRequest = useCallback(async (reqId, reason, rejecterName) => {
    try {
      const res = await api.patch(`/requests/${reqId}/reject`, { reason });
      const updated = res.data;
      setRequests(prev => prev.map(r => r.id === reqId ? updated : r));
    } catch (err) {
      console.error('Failed to reject request:', err);
      throw err;
    }
  }, []);

  const escalateRequest = useCallback(async (reqId) => {
    try {
      const res = await api.patch(`/requests/${reqId}/escalate`);
      const updated = res.data;
      setRequests(prev => prev.map(r => r.id === reqId ? updated : r));
    } catch (err) {
      console.error('Failed to escalate request:', err);
      throw err;
    }
  }, []);

  const updateTrackingStatus = useCallback(async (reqId, newStatus) => {
    try {
      const res = await api.patch(`/requests/${reqId}/tracking`, { trackingStatus: newStatus });
      const updated = res.data;
      setRequests(prev => prev.map(r => r.id === reqId ? updated : r));
      // Refresh guards if completed
      if (newStatus === 'completed') {
        const guardsRes = await api.get('/requests/guards');
        setGuards(guardsRes.data || []);
      }
    } catch (err) {
      console.error('Failed to update tracking:', err);
      throw err;
    }
  }, []);

  // ---- Feedback Actions ----
  const submitFeedback = useCallback(async (data) => {
    try {
      const res = await api.post('/requests/feedback', data);
      const fb = res.data;
      setFeedback(prev => [fb, ...prev]);
      return fb;
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      throw err;
    }
  }, []);

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
      guards, availableGuards, feedback, stats, dataLoading,
      submitRequest, approveRequest, rejectRequest, escalateRequest,
      updateTrackingStatus, submitFeedback, refreshData: fetchData,
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
