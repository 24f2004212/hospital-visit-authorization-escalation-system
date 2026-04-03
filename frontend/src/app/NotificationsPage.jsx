import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { FiBell, FiCheck, FiAlertTriangle, FiCheckCircle, FiMapPin, FiXCircle, FiClock, FiFilter } from 'react-icons/fi';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { requests, myRequests, feedback } = useData();
  const isAdmin = ['admin', 'warden', 'proctor', 'guard'].includes(user?.role);
  const [filter, setFilter] = useState('all');
  const [readIds, setReadIds] = useState(new Set());

  // Generate notifications from request/feedback data
  const notifications = useMemo(() => {
    const notifs = [];
    const sourceRequests = isAdmin ? requests : myRequests;

    sourceRequests.forEach(req => {
      // Request created
      notifs.push({
        id: `${req.id}-created`,
        type: 'request',
        icon: '📝',
        title: isAdmin ? `New request from ${req.studentName}` : 'Request submitted',
        desc: `${req.reason} — ${req.hospitalName || 'Hospital visit'}`,
        urgency: req.urgency,
        time: req.createdAt,
        color: 'var(--primary-400)',
        bg: 'rgba(0,212,170,0.08)',
      });

      // Approved
      if (req.status === 'approved' || req.status === 'completed') {
        notifs.push({
          id: `${req.id}-approved`,
          type: 'approval',
          icon: '✅',
          title: isAdmin ? `Approved: ${req.studentName}` : 'Request approved!',
          desc: `Approved by ${req.approvedBy}. Guard assigned: ${req.assignedGuard || 'Pending'}`,
          urgency: req.urgency,
          time: req.approvedAt || req.updatedAt,
          color: 'var(--success-500)',
          bg: 'rgba(34,197,94,0.08)',
        });
      }

      // Rejected
      if (req.status === 'rejected') {
        notifs.push({
          id: `${req.id}-rejected`,
          type: 'rejection',
          icon: '❌',
          title: isAdmin ? `Rejected: ${req.studentName}` : 'Request rejected',
          desc: req.rejectionReason || 'No reason provided',
          urgency: req.urgency,
          time: req.updatedAt,
          color: 'var(--error-500)',
          bg: 'rgba(239,68,68,0.08)',
        });
      }

      // Escalated
      if (req.escalated) {
        notifs.push({
          id: `${req.id}-escalated`,
          type: 'escalation',
          icon: '🚨',
          title: isAdmin ? `Escalation: ${req.studentName}` : 'Request escalated!',
          desc: `Escalated to ${req.escalatedTo}. ${req.parentNotified ? 'Parent has been notified.' : ''}`,
          urgency: 'emergency',
          time: req.escalatedAt,
          color: 'var(--error-500)',
          bg: 'rgba(239,68,68,0.08)',
        });
      }

      // Parent notified
      if (req.parentNotified) {
        notifs.push({
          id: `${req.id}-parent`,
          type: 'parent',
          icon: '📱',
          title: isAdmin ? `Parent notified: ${req.studentName}` : 'Parent has been notified',
          desc: `SMS and email alert sent to parent/guardian for ${req.urgency} request.`,
          urgency: req.urgency,
          time: req.escalatedAt || req.approvedAt || req.updatedAt,
          color: '#a855f7',
          bg: 'rgba(168,85,247,0.08)',
        });
      }

      // Tracking updates
      if (req.trackingStatus && req.trackingStatus !== 'completed') {
        const trackingLabels = {
          preparing: '🎒 Student is preparing for departure',
          departed: '🚶 Student has departed from hostel',
          at_hospital: '🏥 Student has arrived at hospital',
          returning: '🔙 Student is returning to hostel',
        };
        notifs.push({
          id: `${req.id}-tracking`,
          type: 'tracking',
          icon: '📍',
          title: isAdmin ? `Tracking: ${req.studentName}` : 'Visit status updated',
          desc: trackingLabels[req.trackingStatus] || req.trackingStatus,
          urgency: 'normal',
          time: req.updatedAt,
          color: 'var(--accent-400)',
          bg: 'rgba(59,158,255,0.08)',
        });
      }

      // Completed
      if (req.status === 'completed' && req.completedAt) {
        notifs.push({
          id: `${req.id}-completed`,
          type: 'completed',
          icon: '🏁',
          title: isAdmin ? `Visit completed: ${req.studentName}` : 'Visit completed!',
          desc: `${req.reason} at ${req.hospitalName || 'hospital'}. Student returned safely.`,
          urgency: 'normal',
          time: req.completedAt,
          color: '#a855f7',
          bg: 'rgba(168,85,247,0.08)',
        });
      }
    });

    // Feedback notifications
    const sourceFeedback = isAdmin ? feedback : feedback.filter(f => f.studentId === user?.id);
    sourceFeedback.forEach(fb => {
      notifs.push({
        id: `${fb.id}-feedback`,
        type: 'feedback',
        icon: '⭐',
        title: isAdmin ? `Feedback from ${fb.studentName}` : 'Feedback submitted',
        desc: `Rating: ${'⭐'.repeat(fb.rating)} — "${fb.hospitalExperience?.slice(0, 60)}${fb.hospitalExperience?.length > 60 ? '...' : ''}"`,
        urgency: 'normal',
        time: fb.createdAt,
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.08)',
      });
    });

    // Sort by time descending
    return notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [requests, myRequests, feedback, isAdmin, user]);

  const filteredNotifs = filter === 'all'
    ? notifications
    : filter === 'unread'
      ? notifications.filter(n => !readIds.has(n.id))
      : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const markAllRead = () => {
    setReadIds(new Set(notifications.map(n => n.id)));
  };

  const markRead = (id) => {
    setReadIds(prev => new Set([...prev, id]));
  };

  const timeSince = (dateStr) => {
    if (!dateStr) return '';
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  const filterOptions = [
    { key: 'all', label: 'All', icon: <FiBell size={13} /> },
    { key: 'unread', label: `Unread (${unreadCount})`, icon: <FiClock size={13} /> },
    { key: 'escalation', label: 'Escalations', icon: <FiAlertTriangle size={13} /> },
    { key: 'approval', label: 'Approvals', icon: <FiCheckCircle size={13} /> },
    { key: 'tracking', label: 'Tracking', icon: <FiMapPin size={13} /> },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">🔔 Notifications</h1>
          <p className="page-subtitle">
            {isAdmin
              ? 'Stay updated on all student requests, escalations, and system events.'
              : 'Track your request approvals, visit updates, and important alerts.'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="btn-outline" onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="notif-filters">
        {filterOptions.map(opt => (
          <button
            key={opt.key}
            className={`notif-filter-btn ${filter === opt.key ? 'notif-filter-active' : ''}`}
            onClick={() => setFilter(opt.key)}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="section-card glass-card">
          <div className="empty-state">
            <div className="empty-state-icon">🔕</div>
            <h3>No notifications</h3>
            <p>{filter === 'unread' ? 'You\'ve read all notifications!' : 'No notifications in this category yet.'}</p>
          </div>
        </div>
      ) : (
        <div className="notif-list">
          {filteredNotifs.map((notif, i) => {
            const isRead = readIds.has(notif.id);
            return (
              <div
                className={`notif-item glass-card ${isRead ? 'notif-read' : 'notif-unread'} ${notif.type === 'escalation' ? 'notif-escalation' : ''}`}
                key={notif.id}
                style={{ animationDelay: `${i * 0.03}s` }}
                onClick={() => markRead(notif.id)}
              >
                <div className="notif-icon" style={{ background: notif.bg, color: notif.color }}>
                  {notif.icon}
                </div>
                <div className="notif-body">
                  <div className="notif-title-row">
                    <span className="notif-title">{notif.title}</span>
                    {notif.urgency === 'emergency' && (
                      <span className="urgency-badge" style={{ color: 'var(--error-500)', borderColor: 'var(--error-500)', fontSize: '0.65rem' }}>
                        🚨 EMERGENCY
                      </span>
                    )}
                    {notif.urgency === 'urgent' && (
                      <span className="urgency-badge" style={{ color: 'var(--warning-500)', borderColor: 'var(--warning-500)', fontSize: '0.65rem' }}>
                        ⚡ URGENT
                      </span>
                    )}
                  </div>
                  <div className="notif-desc">{notif.desc}</div>
                  <div className="notif-time">{timeSince(notif.time)}</div>
                </div>
                {!isRead && <div className="notif-unread-dot"></div>}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Statistics */}
      <div className="notif-summary glass-card">
        <h3>📊 Notification Summary</h3>
        <div className="notif-summary-grid">
          {[
            { label: 'Total', value: notifications.length, color: 'var(--primary-400)' },
            { label: 'Unread', value: unreadCount, color: 'var(--accent-400)' },
            { label: 'Escalations', value: notifications.filter(n => n.type === 'escalation').length, color: 'var(--error-500)' },
            { label: 'Approvals', value: notifications.filter(n => n.type === 'approval').length, color: 'var(--success-500)' },
            { label: 'Parent Alerts', value: notifications.filter(n => n.type === 'parent').length, color: '#a855f7' },
          ].map((s, i) => (
            <div className="notif-summary-stat" key={i}>
              <div className="notif-summary-value" style={{ color: s.color }}>{s.value}</div>
              <div className="notif-summary-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
