import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { FiMapPin, FiUser, FiClock } from 'react-icons/fi';

export default function TrackingPage() {
  const { user } = useAuth();
  const { requests, activeVisits, guards, updateTrackingStatus, myRequests } = useData();
  const isAdmin = ['admin', 'warden', 'proctor', 'guard'].includes(user?.role);

  const trackingSteps = ['preparing', 'departed', 'at_hospital', 'completed'];
  const stepLabels = {
    preparing: '🎒 Preparing',
    departed: '🚶 Departed',
    at_hospital: '🏥 At Hospital',
    completed: '✅ Completed',
  };

  const visitsToShow = isAdmin
    ? requests.filter(r => r.status === 'approved' && r.trackingStatus && r.trackingStatus !== 'completed')
    : myRequests.filter(r => r.status === 'approved' && r.trackingStatus && r.trackingStatus !== 'completed');

  const completedVisits = isAdmin
    ? requests.filter(r => r.status === 'completed').slice(0, 5)
    : myRequests.filter(r => r.status === 'completed').slice(0, 5);

  const getGuardName = (guardId) => {
    const g = guards.find(guard => guard.id === guardId);
    return g ? g.name : 'Not assigned';
  };

  const getNextStatus = (current) => {
    if (current === 'preparing') return 'at_hospital'; // Proceed to departure sets status to at_hospital immediately
    if (current === 'departed') return 'at_hospital';
    if (current === 'at_hospital') return 'completed';
    return null;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">📍 {isAdmin ? 'Live Visit Tracking' : 'My Visit Tracking'}</h1>
          <p className="page-subtitle">
            {isAdmin ? 'Monitor all active hospital visits and guard assignments in real time.' : 'Track the status of your active hospital visits.'}
          </p>
        </div>
        <div className="live-indicator">
          <span className="live-dot"></span> Live
        </div>
      </div>

      {/* Active Visits */}
      {visitsToShow.length === 0 ? (
        <div className="section-card glass-card">
          <div className="empty-state">
            <div className="empty-state-icon">🏥</div>
            <h3>No active visits</h3>
            <p>{isAdmin ? 'All students are currently in the hostel.' : 'You have no ongoing hospital visits.'}</p>
          </div>
        </div>
      ) : (
        <div className="tracking-grid">
          {visitsToShow.map((visit, i) => (
            <div className="tracking-card glass-card" key={visit.id} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="tracking-card-header">
                <div>
                  <span className="mono-text">{visit.id}</span>
                  <span className="urgency-badge" style={{
                    color: visit.urgency === 'emergency' ? 'var(--error-500)' : visit.urgency === 'urgent' ? 'var(--warning-500)' : 'var(--primary-400)',
                    borderColor: visit.urgency === 'emergency' ? 'var(--error-500)' : visit.urgency === 'urgent' ? 'var(--warning-500)' : 'var(--primary-400)',
                  }}>
                    {visit.urgency === 'emergency' && '🚨 '}{visit.urgency}
                  </span>
                </div>
                <span className="tracking-status" data-status={visit.trackingStatus}>
                  {stepLabels[visit.trackingStatus]}
                </span>
              </div>

              {/* Student Info */}
              {isAdmin && (
                <div className="tracking-card-student">
                  <FiUser size={14} />
                  <strong>{visit.studentName}</strong>
                  <span>· {visit.hostelBlock} Room {visit.roomNumber}</span>
                </div>
              )}

              <div className="tracking-card-detail">
                <span>🏥 {visit.hospitalName || 'Hospital visit'}</span>
                <span>📅 {new Date(visit.preferredDate).toLocaleDateString()} at {visit.preferredTime}</span>
                <span>💂 Guard: <strong>{getGuardName(visit.assignedGuard)}</strong></span>
              </div>

              {/* Progress Bar */}
              <div className="tracking-progress-bar">
                {trackingSteps.map((step, idx) => {
                  const currentIdx = trackingSteps.indexOf(visit.trackingStatus);
                  const isCompleted = idx < currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <div key={step} className={`progress-step ${isCompleted ? 'step-completed' : ''} ${isCurrent ? 'step-current' : ''}`}>
                      <div className="progress-step-dot">
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span className="progress-step-label">{step.replace('_', ' ')}</span>
                      {idx < trackingSteps.length - 1 && (
                        <div className={`progress-step-line ${isCompleted ? 'line-completed' : ''}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Update Button (Admin/Guard only) */}
              {isAdmin && getNextStatus(visit.trackingStatus) && (
                <button
                  className="btn-update-status"
                  onClick={() => updateTrackingStatus(visit.id, getNextStatus(visit.trackingStatus))}
                >
                  {visit.trackingStatus === 'preparing' ? 'Proceed to departure' : `Update to: ${stepLabels[getNextStatus(visit.trackingStatus)]}`}
                </button>
              )}

              {visit.escalated && (
                <div className="request-card-escalation" style={{ marginTop: '0.75rem' }}>
                  ⚠️ Escalated — Parent notified
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Completed Visits */}
      {completedVisits.length > 0 && (
        <div className="section-card glass-card" style={{ marginTop: '2rem' }}>
          <div className="section-card-header">
            <h2>✅ Recently Completed</h2>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  {isAdmin && <th>Student</th>}
                  <th>Reason</th>
                  <th>Hospital</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {completedVisits.map(v => (
                  <tr key={v.id}>
                    <td><span className="mono-text">{v.id}</span></td>
                    {isAdmin && <td>{v.studentName}</td>}
                    <td>{v.reason}</td>
                    <td>{v.hospitalName || '—'}</td>
                    <td className="mono-text">{v.completedAt ? new Date(v.completedAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
