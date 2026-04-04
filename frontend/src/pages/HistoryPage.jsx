import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { FiCalendar, FiFilter, FiSearch, FiUser, FiShield, FiClock, FiCheckCircle } from 'react-icons/fi';

const HOSTEL_BLOCKS = ['All Blocks', 'MH-1', 'MH-2', 'MH-3', 'MH-4', 'MH-5', 'MH-6', 'LH-1', 'LH-2', 'LH-3', 'LH-4'];

export default function HistoryPage() {
  const { user } = useAuth();
  const { allRequests } = useData();
  const isAdmin = user?.role === 'admin';

  const [selectedBlock, setSelectedBlock] = useState('All Blocks');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter to only non-pending/non-rejected requests (approved, active, completed, escalated)
  const historyRequests = useMemo(() => {
    return (allRequests || []).filter(r =>
      ['approved', 'active', 'completed', 'escalated'].includes(r.status)
    );
  }, [allRequests]);

  // Apply block + search filters
  const filteredRequests = useMemo(() => {
    let filtered = historyRequests;

    if (selectedBlock !== 'All Blocks') {
      filtered = filtered.filter(r => r.hostelBlock === selectedBlock);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.studentName?.toLowerCase().includes(q) ||
        r.reason?.toLowerCase().includes(q) ||
        r.hospitalName?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [historyRequests, selectedBlock, searchQuery]);

  // Group by date (day-wise)
  const groupedByDate = useMemo(() => {
    const groups = {};
    filteredRequests.forEach(req => {
      const dateKey = req.approvedAt
        ? new Date(req.approvedAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : new Date(req.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(req);
    });
    // Sort keys descending (most recent first)
    const sortedKeys = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));
    return sortedKeys.map(key => ({ date: key, requests: groups[key] }));
  }, [filteredRequests]);

  const statusConfig = {
    approved: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: <FiCheckCircle />, label: 'Approved' },
    active: { color: '#00b4cc', bg: 'rgba(0,180,204,0.1)', icon: <FiClock />, label: 'Active' },
    completed: { color: '#a855f7', bg: 'rgba(168,85,247,0.1)', icon: <FiCheckCircle />, label: 'Completed' },
    escalated: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <FiShield />, label: 'Escalated' },
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            📜 {isAdmin ? 'Admin Visit History' : 'Warden Visit History'}
          </h1>
          <p className="page-subtitle">
            {isAdmin
              ? 'Complete history of all approved visits across all wardens and blocks.'
              : 'History of visits you have approved, organized by day and block.'}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <FiFilter /> <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Filters</span>
        </div>
        <select
          value={selectedBlock}
          onChange={e => setSelectedBlock(e.target.value)}
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {HOSTEL_BLOCKS.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search by student, reason, or hospital..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '8px',
              padding: '0.5rem 1rem 0.5rem 2.2rem',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          {filteredRequests.length} record{filteredRequests.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Day-wise Groups */}
      {groupedByDate.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>No visit history found for the selected filters.</p>
        </div>
      ) : (
        groupedByDate.map(group => (
          <div key={group.date} style={{ marginBottom: '1.5rem' }}>
            {/* Date Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid var(--border-primary)',
            }}>
              <FiCalendar style={{ color: 'var(--primary-400)', fontSize: '1.1rem' }} />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {group.date}
              </h2>
              <span style={{
                fontSize: '0.75rem',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-tertiary)',
                padding: '2px 10px',
                borderRadius: '12px',
                fontWeight: 600,
              }}>
                {group.requests.length} visit{group.requests.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Table */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Block</th>
                      <th>Reason</th>
                      <th>Hospital</th>
                      <th>Status</th>
                      {isAdmin && <th>Approved By</th>}
                      <th>Guard</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.requests.map(req => {
                      const sc = statusConfig[req.status] || statusConfig.approved;
                      return (
                        <tr key={req.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                                flexShrink: 0,
                              }}>
                                {req.studentName?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{req.studentName}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{req.roomNumber || '—'}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: req.hostelBlock ? 'rgba(0,180,204,0.1)' : 'transparent',
                              color: req.hostelBlock ? 'var(--primary-400)' : 'var(--text-tertiary)',
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}>
                              {req.hostelBlock || '—'}
                            </span>
                          </td>
                          <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {req.reason}
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {req.hospitalName || '—'}
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              fontSize: '0.75rem', fontWeight: 600,
                              color: sc.color, background: sc.bg,
                              padding: '3px 10px', borderRadius: '10px',
                            }}>
                              {sc.icon} {sc.label}
                            </span>
                          </td>
                          {isAdmin && (
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <FiUser style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }} />
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                  {req.wardenName || req.approvedBy || '—'}
                                </span>
                              </div>
                            </td>
                          )}
                          <td>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {req.guardName || '—'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                            {req.approvedAt
                              ? new Date(req.approvedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                              : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
