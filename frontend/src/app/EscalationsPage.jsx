import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { FiAlertTriangle, FiUser, FiClock, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

export default function EscalationsPage() {
  const { user } = useAuth();
  const { requests, approveRequest, availableGuards } = useData();
  const escalatedRequests = requests.filter(r => r.escalated);
  const pendingEscalated = escalatedRequests.filter(r => r.status === 'pending');
  const resolvedEscalated = escalatedRequests.filter(r => r.status !== 'pending');

  const timeSince = (dateStr) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">🚨 Escalations</h1>
          <p className="page-subtitle">
            Requests escalated due to delayed approvals or emergency situations. 
            Parents and proctors have been automatically notified.
          </p>
        </div>
        {pendingEscalated.length > 0 && (
          <div className="alert-counter">
            <FiAlertTriangle /> {pendingEscalated.length} Pending
          </div>
        )}
      </div>

      {/* Escalation Flow Info */}
      <div className="section-card glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.75rem', color: 'var(--neutral-200)' }}>⚡ Auto-Escalation Flow</h3>
        <div className="escalation-flow">
          <div className="flow-step">
            <div className="flow-step-icon" style={{ background: 'rgba(0,180,204,0.15)', color: 'var(--primary-400)' }}>📝</div>
            <span>Request Submitted</span>
          </div>
          <FiArrowRight className="flow-arrow" />
          <div className="flow-step">
            <div className="flow-step-icon" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning-500)' }}>⏰</div>
            <span>30min / 10min Wait</span>
          </div>
          <FiArrowRight className="flow-arrow" />
          <div className="flow-step">
            <div className="flow-step-icon" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--error-500)' }}>🚨</div>
            <span>Escalate to Proctor</span>
          </div>
          <FiArrowRight className="flow-arrow" />
          <div className="flow-step">
            <div className="flow-step-icon" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>📱</div>
            <span>Notify Parents</span>
          </div>
        </div>
      </div>

      {/* Pending Escalations */}
      {pendingEscalated.length > 0 && (
        <>
          <h2 className="section-title">⚠️ Requires Immediate Attention</h2>
          <div className="requests-list">
            {pendingEscalated.map((req, i) => (
              <div className="request-card glass-card escalation-card" key={req.id} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="request-card-top">
                  <div className="request-card-id">
                    <span className="mono-text">{req.id}</span>
                    <span className="urgency-badge" style={{ color: 'var(--error-500)', borderColor: 'var(--error-500)' }}>
                      🚨 {req.urgency}
                    </span>
                    <span className="time-badge">Escalated {timeSince(req.escalatedAt)}</span>
                  </div>
                </div>
                <div className="request-card-body">
                  <div className="student-info-row">
                    <div className="student-avatar-sm"><FiUser /></div>
                    <div>
                      <strong>{req.studentName}</strong>
                      <div className="student-detail">
                        {req.hostelBlock} - Room {req.roomNumber} · 📞 {req.contactNumber}
                      </div>
                    </div>
                  </div>
                  <h3>{req.reason}</h3>
                  <p className="request-desc">{req.description}</p>
                  <div className="request-card-meta">
                    <span>🏥 {req.hospitalName || 'Hospital visit'}</span>
                    <span>📅 {new Date(req.preferredDate).toLocaleDateString()} at {req.preferredTime}</span>
                  </div>
                  <div className="escalation-notifications">
                    <span className="notif-badge notif-parent">📱 Parent Notified</span>
                    <span className="notif-badge notif-proctor">👤 Escalated to {req.escalatedTo}</span>
                  </div>
                  <div className="action-btns" style={{ marginTop: '1rem' }}>
                    <button className="btn-approve" onClick={() => {
                      const guard = availableGuards[0];
                      if (guard) approveRequest(req.id, guard.id, user?.fullName);
                    }} disabled={availableGuards.length === 0}>
                      <FiCheckCircle /> Quick Approve {availableGuards.length === 0 && '(No guards available)'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Resolved Escalations */}
      {resolvedEscalated.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: '2rem' }}>✅ Resolved Escalations</h2>
          <div className="section-card glass-card">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student</th>
                    <th>Reason</th>
                    <th>Escalated To</th>
                    <th>Resolution</th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedEscalated.map(r => (
                    <tr key={r.id}>
                      <td><span className="mono-text">{r.id}</span></td>
                      <td>{r.studentName}</td>
                      <td>{r.reason}</td>
                      <td>{r.escalatedTo}</td>
                      <td>
                        <span className="status-badge" style={{
                          color: r.status === 'approved' ? 'var(--success-500)' : 'var(--error-500)',
                          borderColor: r.status === 'approved' ? 'var(--success-500)' : 'var(--error-500)',
                        }}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {escalatedRequests.length === 0 && (
        <div className="section-card glass-card">
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <h3>No escalations</h3>
            <p>All requests have been processed on time. Great job!</p>
          </div>
        </div>
      )}
    </div>
  );
}
