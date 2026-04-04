import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '@/utils/api';
import { FiCheckCircle, FiXCircle, FiUserCheck, FiClock, FiMail, FiPhone, FiShield, FiPlus, FiTrash2 } from 'react-icons/fi';

export default function StaffApprovalsPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [pendingStaff, setPendingStaff] = useState([]);
  const [guards, setGuards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const defaultTab = location.pathname.includes('manage-guards') ? 'guards' : (user?.role === 'admin' ? 'pending' : 'guards');
  const [tab, setTab] = useState(defaultTab);

  // Guard creation form
  const [showGuardForm, setShowGuardForm] = useState(false);
  const [guardName, setGuardName] = useState('');
  const [guardPhone, setGuardPhone] = useState('');
  const [guardError, setGuardError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const promises = [api.get('/requests/guards')];
      // Only admin can fetch pending staff
      if (user?.role === 'admin') {
        promises.unshift(api.get('/auth/pending-staff'));
      }
      const results = await Promise.all(promises);
      if (user?.role === 'admin') {
        setPendingStaff(results[0].data || []);
        setGuards(results[1].data || []);
      } else {
        setGuards(results[0].data || []);
      }
    } catch (err) {
      console.error('Failed to fetch staff data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.patch(`/auth/approve-staff/${id}`);
      setPendingStaff(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await api.patch(`/auth/reject-staff/${id}`);
      setPendingStaff(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateGuard = async (e) => {
    e.preventDefault();
    setGuardError('');
    if (!guardName.trim()) { setGuardError('Please enter a guard name'); return; }
    if (!guardPhone.trim()) { setGuardError('Please enter a phone number'); return; }

    setActionLoading('create-guard');
    try {
      const res = await api.post('/requests/guards', { name: guardName, phone: guardPhone });
      setGuards(prev => [...prev, res.data]);
      setGuardName('');
      setGuardPhone('');
      setShowGuardForm(false);
    } catch (err) {
      setGuardError(err.response?.data?.message || 'Failed to create guard');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveGuard = async (id) => {
    setActionLoading(id);
    try {
      await api.patch(`/requests/guards/${id}/remove`);
      setGuards(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error('Failed to remove guard:', err);
      alert(err.response?.data?.message || 'Cannot remove guard. They may be assigned to an active visit.');
    } finally {
      setActionLoading(null);
    }
  };

  const timeSince = (dateStr) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  const roleBadgeColor = {
    warden: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    proctor: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  };

  const isAdminUser = user?.role === 'admin';

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 Staff & Guard Management</h1>
          <p className="page-subtitle">
            {isAdminUser
              ? 'Review pending staff registrations and manage guard assignments.'
              : 'Manage guard entries for visit assignments.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {isAdminUser && (
          <button
            className={`tab-btn ${tab === 'pending' ? 'tab-btn-active' : ''}`}
            onClick={() => setTab('pending')}
          >
            <FiUserCheck size={14} style={{ marginRight: 4 }} />
            Pending Staff <span className="tab-count">{pendingStaff.length}</span>
          </button>
        )}
        <button
          className={`tab-btn ${tab === 'guards' ? 'tab-btn-active' : ''}`}
          onClick={() => setTab('guards')}
        >
          <FiShield size={14} style={{ marginRight: 4 }} />
          Guards <span className="tab-count">{guards.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="section-card glass-card">
          <div className="empty-state">
            <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }}></div>
            <p>Loading...</p>
          </div>
        </div>
      ) : (
        <>
          {/* ─── Pending Staff Tab ─── */}
          {tab === 'pending' && isAdminUser && (
            <>
              {pendingStaff.length === 0 ? (
                <div className="section-card glass-card">
                  <div className="empty-state">
                    <div className="empty-state-icon">✅</div>
                    <p>No pending staff registrations</p>
                    <small style={{ color: 'var(--neutral-500)' }}>All registrations have been reviewed.</small>
                  </div>
                </div>
              ) : (
                <div className="requests-list">
                  {pendingStaff.map((staff, i) => (
                    <div className="request-card glass-card" key={staff.id} style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="request-card-body">
                        <div className="student-info-row">
                          <div className="student-avatar-sm" style={{
                            background: roleBadgeColor[staff.role]?.bg || 'rgba(0,180,204,0.1)',
                            color: roleBadgeColor[staff.role]?.color || 'var(--primary-400)',
                          }}>
                            <FiShield />
                          </div>
                          <div>
                            <strong>{staff.name}</strong>
                            <div className="student-detail">
                              <span className="urgency-badge" style={{
                                color: roleBadgeColor[staff.role]?.color || 'var(--primary-400)',
                                borderColor: roleBadgeColor[staff.role]?.color || 'var(--primary-400)',
                                textTransform: 'capitalize',
                              }}>
                                {staff.role}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="request-card-meta" style={{ marginTop: '0.75rem' }}>
                          <span><FiMail size={13} style={{ marginRight: 4 }} />{staff.email}</span>
                          {staff.phoneNumber && <span><FiPhone size={13} style={{ marginRight: 4 }} />{staff.phoneNumber}</span>}
                          <span><FiClock size={13} style={{ marginRight: 4 }} />Registered {timeSince(staff.createdAt)}</span>
                        </div>

                        <div className="action-btns" style={{ marginTop: '1rem' }}>
                          <button
                            className="btn-approve"
                            onClick={() => handleApprove(staff.id)}
                            disabled={actionLoading === staff.id}
                          >
                            {actionLoading === staff.id
                              ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></span>
                              : <FiCheckCircle />}
                            Approve
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleReject(staff.id)}
                            disabled={actionLoading === staff.id}
                          >
                            <FiXCircle /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ─── Guards Tab ─── */}
          {tab === 'guards' && (
            <>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn-primary"
                  style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                  onClick={() => setShowGuardForm(!showGuardForm)}
                >
                  <FiPlus /> Add Guard
                </button>
              </div>

              {/* Add Guard Form */}
              {showGuardForm && (
                <div className="section-card glass-card" style={{ marginBottom: '1rem' }}>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--neutral-200)' }}>Add New Guard</h3>
                  <form onSubmit={handleCreateGuard} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Guard Name</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Full name of the guard"
                          value={guardName}
                          onChange={(e) => setGuardName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Phone Number</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="+91 9876543210"
                          value={guardPhone}
                          onChange={(e) => setGuardPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    {guardError && <div className="form-error" style={{ margin: 0 }}>{guardError}</div>}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        type="submit"
                        className="btn-approve"
                        disabled={actionLoading === 'create-guard'}
                      >
                        {actionLoading === 'create-guard'
                          ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></span>
                          : <FiCheckCircle />}
                        Create Guard
                      </button>
                      <button type="button" className="btn-cancel" onClick={() => { setShowGuardForm(false); setGuardError(''); }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {guards.length === 0 ? (
                <div className="section-card glass-card">
                  <div className="empty-state">
                    <div className="empty-state-icon">🛡️</div>
                    <p>No guards available</p>
                    <small style={{ color: 'var(--neutral-500)' }}>Add guards using the button above.</small>
                  </div>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guards.map(g => (
                        <tr key={g.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'rgba(0,180,204,0.1)', color: 'var(--primary-400)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.85rem',
                              }}>
                                <FiShield />
                              </div>
                              <strong>{g.name}</strong>
                            </div>
                          </td>
                          <td>{g.phone || '—'}</td>
                          <td>
                            <span className="status-badge" style={{
                              color: g.status === 'available' ? 'var(--success-500)' : 'var(--warning-500)',
                              borderColor: g.status === 'available' ? 'var(--success-500)' : 'var(--warning-500)',
                            }}>
                              {g.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-reject"
                              style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
                              onClick={() => handleRemoveGuard(g.id)}
                              disabled={actionLoading === g.id || g.status === 'assigned'}
                              title={g.status === 'assigned' ? 'Cannot remove assigned guard' : 'Remove guard'}
                            >
                              <FiTrash2 size={13} /> Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
