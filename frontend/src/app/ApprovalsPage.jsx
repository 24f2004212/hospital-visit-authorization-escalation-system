import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiUser, FiShield } from 'react-icons/fi';

export default function ApprovalsPage() {
  const { user } = useAuth();
  const { pendingRequests, requests, availableGuards, approveRequest, rejectRequest, escalateRequest } = useData();
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approvingId, setApprovingId] = useState(null);
  const [selectedGuard, setSelectedGuard] = useState('');
  const [tab, setTab] = useState('pending');

  const filteredRequests = tab === 'pending'
    ? pendingRequests
    : tab === 'approved'
    ? requests.filter(r => r.status === 'approved')
    : requests.filter(r => r.status === 'rejected');

  const urgencyColors = { normal: 'var(--primary-400)', urgent: 'var(--warning-500)', emergency: 'var(--error-500)' };

  const handleApprove = (reqId) => {
    if (!selectedGuard) return;
    approveRequest(reqId, selectedGuard, user?.fullName);
    setApprovingId(null);
    setSelectedGuard('');
  };

  const handleReject = (reqId) => {
    if (!rejectReason.trim()) return;
    rejectRequest(reqId, rejectReason, user?.fullName);
    setRejectingId(null);
    setRejectReason('');
  };

  const handleEscalate = (reqId) => {
    escalateRequest(reqId);
  };

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
          <h1 className="page-title">✅ Request Approvals</h1>
          <p className="page-subtitle">Review, approve, or reject student hospital visit requests.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: 'pending', label: 'Pending', count: pendingRequests.length },
          { key: 'approved', label: 'Approved', count: requests.filter(r => r.status === 'approved').length },
          { key: 'rejected', label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length },
        ].map(t => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? 'tab-btn-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label} <span className="tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Requests */}
      {filteredRequests.length === 0 ? (
        <div className="section-card glass-card">
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>No {tab} requests</p>
          </div>
        </div>
      ) : (
        <div className="requests-list">
          {filteredRequests.map((req, i) => (
            <div className="request-card glass-card" key={req.id} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="request-card-top">
                <div className="request-card-id">
                  <span className="mono-text">{req.id}</span>
                  <span className="urgency-badge" style={{ color: urgencyColors[req.urgency], borderColor: urgencyColors[req.urgency] }}>
                    {req.urgency === 'emergency' && '🚨 '}{req.urgency}
                  </span>
                  <span className="time-badge">{timeSince(req.createdAt)}</span>
                </div>
              </div>

              <div className="request-card-body">
                {/* Student Info */}
                <div className="student-info-row">
                  <div className="student-avatar-sm"><FiUser /></div>
                  <div>
                    <strong>{req.studentName}</strong>
                    <div className="student-detail">
                      {req.hostelBlock} - Room {req.roomNumber} · 📞 {req.contactNumber} · ✉️ {req.studentEmail}
                    </div>
                  </div>
                </div>

                <h3>{req.reason}</h3>
                <p className="request-desc">{req.description}</p>

                <div className="request-card-meta">
                  {req.hospitalName && <span>🏥 {req.hospitalName}</span>}
                  <span>📅 {new Date(req.preferredDate).toLocaleDateString()} at {req.preferredTime}</span>
                </div>

                {req.escalated && (
                  <div className="request-card-escalation">
                    <FiAlertTriangle style={{ color: 'var(--warning-500)' }} />
                    <span>⚠️ Escalated to {req.escalatedTo} · Parent notified</span>
                  </div>
                )}

                {/* Approval Actions */}
                {tab === 'pending' && (
                  <div className="approval-actions">
                    {approvingId === req.id ? (
                      <div className="approval-form">
                        <label className="form-label">Assign a Guard:</label>
                        <select className="form-select" value={selectedGuard} onChange={e => setSelectedGuard(e.target.value)} style={{ paddingLeft: '1rem' }}>
                          <option value="">Select guard...</option>
                          {availableGuards.map(g => (
                            <option key={g.id} value={g.id}>{g.name} — {g.phone}</option>
                          ))}
                        </select>
                        <div className="approval-form-btns">
                          <button className="btn-approve" onClick={() => handleApprove(req.id)} disabled={!selectedGuard}>
                            <FiCheckCircle /> Confirm Approval
                          </button>
                          <button className="btn-cancel" onClick={() => { setApprovingId(null); setSelectedGuard(''); }}>Cancel</button>
                        </div>
                      </div>
                    ) : rejectingId === req.id ? (
                      <div className="approval-form">
                        <label className="form-label">Reason for Rejection:</label>
                        <textarea
                          className="form-textarea"
                          placeholder="Provide reason for rejection..."
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          rows={2}
                        />
                        <div className="approval-form-btns">
                          <button className="btn-reject-confirm" onClick={() => handleReject(req.id)} disabled={!rejectReason.trim()}>
                            <FiXCircle /> Confirm Rejection
                          </button>
                          <button className="btn-cancel" onClick={() => { setRejectingId(null); setRejectReason(''); }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="action-btns">
                        <button className="btn-approve" onClick={() => setApprovingId(req.id)}>
                          <FiCheckCircle /> Approve
                        </button>
                        <button className="btn-reject" onClick={() => setRejectingId(req.id)}>
                          <FiXCircle /> Reject
                        </button>
                        <button className="btn-escalate" onClick={() => handleEscalate(req.id)}>
                          <FiAlertTriangle /> Escalate
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Approved Info */}
                {tab === 'approved' && (
                  <div className="request-card-approval">
                    <FiCheckCircle style={{ color: 'var(--success-500)' }} />
                    <div>Approved by <strong>{req.approvedBy}</strong> on {new Date(req.approvedAt).toLocaleString()}</div>
                  </div>
                )}

                {/* Rejected Info */}
                {tab === 'rejected' && (
                  <div className="request-card-rejection">
                    <FiXCircle style={{ color: 'var(--error-500)' }} />
                    <div><strong>Reason:</strong> {req.rejectionReason}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
