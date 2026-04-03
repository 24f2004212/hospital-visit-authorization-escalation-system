import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import {
  FiPlusCircle, FiClock, FiCheckCircle, FiXCircle,
  FiMapPin, FiAlertTriangle, FiUsers, FiActivity, FiStar
} from 'react-icons/fi';

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, myRequests, pendingRequests, activeVisits } = useData();
  const isAdmin = ['admin', 'warden', 'proctor', 'guard'].includes(user?.role);

  const studentStats = [
    { icon: <FiClock />, label: 'Pending', value: myRequests.filter(r => r.status === 'pending').length, color: 'var(--warning-500)', bg: 'rgba(245,158,11,0.1)' },
    { icon: <FiCheckCircle />, label: 'Approved', value: myRequests.filter(r => r.status === 'approved').length, color: 'var(--success-500)', bg: 'rgba(34,197,94,0.1)' },
    { icon: <FiMapPin />, label: 'Active Visits', value: myRequests.filter(r => r.trackingStatus && r.trackingStatus !== 'completed').length, color: 'var(--primary-400)', bg: 'rgba(0,180,204,0.1)' },
    { icon: <FiCheckCircle />, label: 'Completed', value: myRequests.filter(r => r.status === 'completed').length, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  ];

  const adminStats = [
    { icon: <FiClock />, label: 'Pending Requests', value: stats.pending, color: 'var(--warning-500)', bg: 'rgba(245,158,11,0.1)' },
    { icon: <FiActivity />, label: 'Active Visits', value: stats.activeVisits, color: 'var(--primary-400)', bg: 'rgba(0,180,204,0.1)' },
    { icon: <FiAlertTriangle />, label: 'Escalated', value: stats.escalated, color: 'var(--error-500)', bg: 'rgba(239,68,68,0.1)' },
    { icon: <FiUsers />, label: 'Guards Available', value: `${stats.guardsAvailable}/${stats.guardsTotal}`, color: 'var(--success-500)', bg: 'rgba(34,197,94,0.1)' },
    { icon: <FiCheckCircle />, label: 'Total Completed', value: stats.completed, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
    { icon: <FiStar />, label: 'Avg Rating', value: stats.avgRating, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  ];

  const currentStats = isAdmin ? adminStats : studentStats;

  const urgencyColors = { normal: 'var(--primary-400)', urgent: 'var(--warning-500)', emergency: 'var(--error-500)' };
  const statusColors = { pending: 'var(--warning-500)', approved: 'var(--success-500)', rejected: 'var(--error-500)', completed: '#a855f7' };

  const recentItems = isAdmin ? pendingRequests.slice(0, 5) : myRequests.slice(0, 5);

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isAdmin ? '🛡️ Admin Dashboard' : '🎓 Student Dashboard'}
          </h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user?.fullName?.split(' ')[0]}</strong>!
            {isAdmin ? ' Manage hospital visit requests and monitor student safety.' : ' Submit and track your hospital visit requests.'}
          </p>
        </div>
        {!isAdmin && (
          <Link to="/new-request" className="btn-primary" style={{ width: 'auto', marginTop: 0, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
            <FiPlusCircle /> New Request
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {currentStats.map((stat, i) => (
          <div className="stat-card glass-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="stat-card-icon" style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-card-info">
              <div className="stat-card-value">{stat.value}</div>
              <div className="stat-card-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="section-card glass-card">
        <div className="section-card-header">
          <h2>{isAdmin ? '⏳ Pending Approvals' : '📋 Recent Requests'}</h2>
          <Link to={isAdmin ? '/approvals' : '/my-requests'} className="section-card-link">
            View All →
          </Link>
        </div>
        {recentItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>{isAdmin ? 'No pending requests' : 'No requests yet'}</p>
            {!isAdmin && <Link to="/new-request" className="btn-outline">Submit your first request</Link>}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  {isAdmin && <th>Student</th>}
                  <th>Reason</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentItems.map(req => (
                  <tr key={req.id}>
                    <td><span className="mono-text">{req.id}</span></td>
                    {isAdmin && (
                      <td>
                        <div className="cell-user">
                          <span>{req.studentName}</span>
                          <small>{req.hostelBlock} - {req.roomNumber}</small>
                        </div>
                      </td>
                    )}
                    <td>{req.reason}</td>
                    <td>
                      <span className="urgency-badge" style={{ color: urgencyColors[req.urgency], borderColor: urgencyColors[req.urgency] }}>
                        {req.urgency === 'emergency' && '🚨 '}{req.urgency}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge" style={{ color: statusColors[req.status], borderColor: statusColors[req.status] }}>
                        {req.status}
                      </span>
                    </td>
                    <td className="mono-text">{new Date(req.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Visits for Admin */}
      {isAdmin && activeVisits.length > 0 && (
        <div className="section-card glass-card">
          <div className="section-card-header">
            <h2>🏥 Active Hospital Visits</h2>
            <Link to="/tracking" className="section-card-link">Live Tracking →</Link>
          </div>
          <div className="active-visits-grid">
            {activeVisits.slice(0, 4).map(visit => (
              <div className="visit-card" key={visit.id}>
                <div className="visit-card-header">
                  <span className="mono-text">{visit.id}</span>
                  <span className="tracking-status" data-status={visit.trackingStatus}>
                    {visit.trackingStatus}
                  </span>
                </div>
                <div className="visit-card-student">{visit.studentName}</div>
                <div className="visit-card-detail">{visit.hospitalName || 'Hospital visit'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
