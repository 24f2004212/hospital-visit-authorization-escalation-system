import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiXCircle, FiAlertTriangle, FiPlusCircle } from 'react-icons/fi';

export default function MyRequestsPage() {
  const { myRequests, updateTrackingStatus } = useData();

  const statusIcon = {
    pending: <FiClock />,
    approved: <FiCheckCircle />,
    rejected: <FiXCircle />,
    completed: <FiCheckCircle />,
  };
  const statusColors = {
    pending: 'var(--warning-500)',
    approved: 'var(--success-500)',
    rejected: 'var(--error-500)',
    completed: '#a855f7',
  };
  const urgencyColors = {
    normal: 'var(--primary-400)',
    urgent: 'var(--warning-500)',
    emergency: 'var(--error-500)',
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 My Requests</h1>
          <p className="page-subtitle">View and track all your hospital visit requests.</p>
        </div>
        <Link to="/new-request" className="btn-primary" style={{ width: 'auto', marginTop: 0, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
          <FiPlusCircle /> New Request
        </Link>
      </div>

      {myRequests.length === 0 ? (
        <div className="section-card glass-card">
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No requests yet</h3>
            <p>Submit your first hospital visit request to get started.</p>
            <Link to="/new-request" className="btn-outline" style={{ marginTop: '1rem' }}>
              <FiPlusCircle /> Create Request
            </Link>
          </div>
        </div>
      ) : (
        <div className="requests-list">
          {myRequests.map((req, i) => (
            <div className="request-card glass-card" key={req.id} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="request-card-top">
                <div className="request-card-id">
                  <span className="mono-text">{req.id}</span>
                  <span className="urgency-badge" style={{ color: urgencyColors[req.urgency], borderColor: urgencyColors[req.urgency] }}>
                    {req.urgency === 'emergency' && '🚨 '}{req.urgency}
                  </span>
                </div>
                <span className="status-badge-lg" style={{ color: statusColors[req.status], borderColor: statusColors[req.status] }}>
                  {statusIcon[req.status]} {req.status}
                </span>
              </div>

              <div className="request-card-body">
                <h3>{req.reason}</h3>
                <p className="request-desc">{req.description}</p>

                <div className="request-card-meta">
                  {req.hospitalName && (
                    <span title="Hospital Name">🏥 {req.hospitalName}</span>
                  )}
                  <span title="Preferred Date">📅 {req.preferredDate} at {req.preferredTime}</span>
                  <span title="Submission Time">🕐 Submitted {new Date(req.createdAt).toLocaleString()}</span>
                </div>

                <div className="request-contacts" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
                  <div title="Parent Email">👨‍👩‍👧 {req.parentEmail}</div>
                  <div title="Parent Phone">📞 {req.parentPhone}</div>
                  <div title="Proctor Email" style={{ gridColumn: 'span 2' }}>🎓 Proctor: {req.proctorEmail}</div>
                </div>

                {req.status === 'approved' && (
                  <div className="request-card-approval">
                    <FiCheckCircle style={{ color: 'var(--success-500)' }} />
                    <div>
                      <strong>Approved by {req.approvedBy}</strong>
                      {req.assignedGuard && <span> · Guard assigned</span>}
                    </div>
                  </div>
                )}

                {req.status === 'rejected' && (
                  <div className="request-card-rejection">
                    <FiXCircle style={{ color: 'var(--error-500)' }} />
                    <div>
                      <strong>Rejected:</strong> {req.rejectionReason || 'No reason provided'}
                    </div>
                  </div>
                )}

                {req.escalated && (
                  <div className="request-card-escalation">
                    <FiAlertTriangle style={{ color: 'var(--warning-500)' }} />
                    <span>Escalated to {req.escalatedTo} · Parent notified</span>
                  </div>
                )}

                {req.trackingStatus && req.trackingStatus !== 'completed' && (
                  <div className="tracking-progress">
                    <span className="tracking-label">Visit Status:</span>
                    <div className="tracking-steps">
                      {['preparing', 'departed', 'at_hospital', 'completed'].map((step, idx) => {
                        const steps = ['preparing', 'departed', 'at_hospital', 'completed'];
                        const currentIdx = steps.indexOf(req.trackingStatus);
                        const isActive = idx <= currentIdx;
                        return (
                          <div key={step} className={`tracking-step ${isActive ? 'tracking-step-active' : ''}`}>
                            <div className="tracking-step-dot" />
                            <span>{step.replace('_', ' ')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {req.trackingStatus === 'at_hospital' && (
                  <button
                    className="btn-primary"
                    style={{ marginTop: '1rem', width: '100%', padding: '0.6rem', fontSize: '0.9rem' }}
                    onClick={() => updateTrackingStatus(req.id, 'completed')}
                  >
                    Complete Visit
                  </button>
                )}

                {req.status === 'completed' && !req.feedbackGiven && (
                  <Link to="/feedback" className="btn-outline" style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    ⭐ Give Feedback
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
