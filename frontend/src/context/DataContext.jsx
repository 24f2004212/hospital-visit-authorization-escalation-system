import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  apiGetRequests, apiSubmitRequest, apiApproveRequest, 
  apiUpdateTrackingStatus, apiEscalateRequest, 
  apiGetFeedback, apiSubmitFeedback, apiGetGuards 
} from '../services/api';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [guards, setGuards] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [reqs, grds, fbs] = await Promise.all([
        apiGetRequests(),
        apiGetGuards(),
        apiGetFeedback()
      ]);
      setRequests(reqs || []);
      setGuards(grds || []);
      setFeedback(fbs || []);
    } catch (e) {
      console.error('API fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 10 seconds for real-time updates 
    const timer = setInterval(fetchData, 10000);
    return () => clearInterval(timer);
  }, []);

  const submitRequest = useCallback(async (data) => {
    const newReq = await apiSubmitRequest({ ...data, studentId: user?.id });
    fetchData(); // Refresh immediately
    return newReq;
  }, [user]);

  const approveRequest = useCallback(async (reqId, guardId, approverName) => {
    await apiApproveRequest(reqId, { guardId, wardenId: user?.id });
    fetchData();
  }, [user]);

  const rejectRequest = useCallback(async (reqId, reason, rejecterName) => {
    await apiUpdateTrackingStatus(reqId, 'REJECTED');
    fetchData();
  }, []);

  const escalateRequest = useCallback(async (reqId) => {
    await apiEscalateRequest(reqId);
    fetchData();
  }, []);

  const updateTrackingStatus = useCallback(async (reqId, newStatus) => {
    await apiUpdateTrackingStatus(reqId, newStatus);
    fetchData();
  }, []);

  const submitFeedback = useCallback(async (data) => {
    const fb = await apiSubmitFeedback({ ...data, studentId: user?.id });
    fetchData();
    return fb;
  }, [user]);

  const myRequests = requests.filter(r => r.studentId === user?.id);
  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const activeVisits = requests.filter(r => r.status === 'APPROVED' || r.status === 'ACTIVE' || r.status === 'ESCALATED');
  const completedRequests = requests.filter(r => r.status === 'COMPLETED');

  const stats = {
    totalRequests: requests.length,
    pending: pendingRequests.length,
    approved: requests.filter(r => r.status === 'APPROVED').length,
    completed: completedRequests.length,
    activeVisits: activeVisits.length,
    escalated: requests.filter(r => r.status === 'ESCALATED').length,
    avgRating: feedback.length > 0
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
      : 'N/A',
    emergencyCount: requests.filter(r => r.urgency === 'EMERGENCY').length,
    guardsAvailable: guards.length,
    guardsTotal: guards.length,
  };

  return (
    <DataContext.Provider value={{
      requests, myRequests, pendingRequests, activeVisits, completedRequests,
      guards, availableGuards: guards, feedback, stats,
      submitRequest, approveRequest, rejectRequest, escalateRequest,
      updateTrackingStatus, submitFeedback, loading
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
