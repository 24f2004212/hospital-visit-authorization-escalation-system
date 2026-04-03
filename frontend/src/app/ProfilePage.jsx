import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  FiUser, FiMail, FiHome, FiPhone, FiCalendar,
  FiCheckCircle, FiClock, FiMapPin, FiAlertTriangle,
  FiStar, FiActivity, FiShield, FiAward, FiTrendingUp
} from 'react-icons/fi';

export default function ProfilePage() {
  const { user } = useAuth();
  const { myRequests, requests, feedback, stats } = useData();
  const isAdmin = ['admin', 'warden', 'proctor', 'guard'].includes(user?.role);

  const userRequests = isAdmin ? requests : myRequests;
  const userFeedback = isAdmin ? feedback : feedback.filter(f => f.studentId === user?.id);

  // Calculate stats
  const totalRequests = userRequests.length;
  const approved = userRequests.filter(r => r.status === 'approved' || r.status === 'completed').length;
  const completed = userRequests.filter(r => r.status === 'completed').length;
  const escalated = userRequests.filter(r => r.escalated).length;
  const avgRating = userFeedback.length > 0
    ? (userFeedback.reduce((sum, f) => sum + f.rating, 0) / userFeedback.length).toFixed(1)
    : 'N/A';

  // Trust Score Calculation (out of 100)
  const trustBase = 50;
  const completionBonus = totalRequests > 0 ? Math.round((completed / totalRequests) * 30) : 0;
  const feedbackBonus = userFeedback.length > 0 ? Math.min(userFeedback.length * 3, 10) : 0;
  const escalationPenalty = escalated * 5;
  const ratingBonus = avgRating !== 'N/A' ? Math.round(parseFloat(avgRating) * 2) : 0;
  const trustScore = Math.min(100, Math.max(0, trustBase + completionBonus + feedbackBonus + ratingBonus - escalationPenalty));

  // Badges
  const badges = [];
  if (completed >= 1) badges.push({ icon: '🏥', label: 'First Visit', desc: 'Completed first hospital visit' });
  if (completed >= 5) badges.push({ icon: '⭐', label: 'Regular', desc: 'Completed 5+ visits' });
  if (userFeedback.length >= 1) badges.push({ icon: '📝', label: 'Feedback Provider', desc: 'Submitted feedback' });
  if (avgRating !== 'N/A' && parseFloat(avgRating) >= 4.5) badges.push({ icon: '🌟', label: 'Top Rated', desc: 'Average rating above 4.5' });
  if (escalated === 0 && totalRequests > 0) badges.push({ icon: '🛡️', label: 'Zero Escalations', desc: 'No escalated requests' });
  if (isAdmin) badges.push({ icon: '👑', label: 'Administrator', desc: `Role: ${user?.role}` });
  const onTimeReturns = userRequests.filter(r => r.status === 'completed' && !r.escalated).length;
  if (onTimeReturns >= 3) badges.push({ icon: '⏰', label: 'Punctual', desc: 'Always returns on time' });

  const trustColor = trustScore >= 80 ? '#00d4aa' : trustScore >= 60 ? '#f59e0b' : '#ef4444';

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (trustScore / 100) * circumference;

  // Activity Timeline
  const recentActivity = [...userRequests]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6);

  const roleLabels = {
    student: '🎓 Student',
    warden: '🛡️ Warden',
    proctor: '👨‍🏫 Proctor',
    admin: '⚙️ Admin',
    guard: '💂 Guard',
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">👤 My Profile</h1>
          <p className="page-subtitle">Your account details, trust score, and activity overview.</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="profile-top-grid">
        <div className="profile-card glass-card">
          <div className="profile-avatar-lg">
            <div className="profile-avatar-circle">{getInitials(user?.fullName)}</div>
            <div className="profile-role-badge">{roleLabels[user?.role] || user?.role}</div>
          </div>
          <h2 className="profile-name">{user?.fullName}</h2>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <FiMail size={14} />
              <span>{user?.email}</span>
            </div>
            {user?.hostelBlock && (
              <div className="profile-info-item">
                <FiHome size={14} />
                <span>{user?.hostelBlock} — Room {user?.roomNumber}</span>
              </div>
            )}
            {user?.contactNumber && (
              <div className="profile-info-item">
                <FiPhone size={14} />
                <span>{user?.contactNumber}</span>
              </div>
            )}
            <div className="profile-info-item">
              <FiCalendar size={14} />
              <span>Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</span>
            </div>
          </div>
        </div>

        {/* Trust Score */}
        <div className="trust-score-card glass-card">
          <h3>
            <FiShield size={16} style={{ marginRight: '0.4rem' }} />
            Trust Score
          </h3>
          <div className="trust-score-ring">
            <svg viewBox="0 0 120 120" className="trust-svg">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke={trustColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="trust-ring-progress"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="trust-score-value" style={{ color: trustColor }}>
              {trustScore}
            </div>
            <div className="trust-score-label">out of 100</div>
          </div>
          <div className="trust-breakdown">
            <div className="trust-factor">
              <span>Base Score</span>
              <span>+{trustBase}</span>
            </div>
            <div className="trust-factor">
              <span>Completion Bonus</span>
              <span className="trust-positive">+{completionBonus}</span>
            </div>
            <div className="trust-factor">
              <span>Feedback Bonus</span>
              <span className="trust-positive">+{feedbackBonus}</span>
            </div>
            <div className="trust-factor">
              <span>Rating Bonus</span>
              <span className="trust-positive">+{ratingBonus}</span>
            </div>
            {escalationPenalty > 0 && (
              <div className="trust-factor">
                <span>Escalation Penalty</span>
                <span className="trust-negative">-{escalationPenalty}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="profile-stats-row">
        {[
          { icon: <FiActivity />, label: 'Total Requests', value: totalRequests, color: '#00d4aa', bg: 'rgba(0,212,170,0.1)' },
          { icon: <FiCheckCircle />, label: 'Approved', value: approved, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
          { icon: <FiMapPin />, label: 'Completed', value: completed, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
          { icon: <FiAlertTriangle />, label: 'Escalated', value: escalated, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          { icon: <FiStar />, label: 'Avg Rating', value: avgRating, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        ].map((s, i) => (
          <div className="profile-stat-card glass-card" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="profile-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="profile-stat-value">{s.value}</div>
            <div className="profile-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges & Activity */}
      <div className="profile-bottom-grid">
        {/* Badges */}
        <div className="section-card glass-card">
          <div className="section-card-header">
            <h2><FiAward style={{ marginRight: '0.4rem' }} /> Achievements</h2>
          </div>
          {badges.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-icon">🎯</div>
              <h3>No badges yet</h3>
              <p>Complete hospital visits and submit feedback to earn badges!</p>
            </div>
          ) : (
            <div className="badges-grid">
              {badges.map((b, i) => (
                <div className="badge-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="badge-card-icon">{b.icon}</div>
                  <div className="badge-card-info">
                    <div className="badge-card-label">{b.label}</div>
                    <div className="badge-card-desc">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        <div className="section-card glass-card">
          <div className="section-card-header">
            <h2><FiTrendingUp style={{ marginRight: '0.4rem' }} /> Recent Activity</h2>
          </div>
          {recentActivity.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-icon">📭</div>
              <h3>No activity yet</h3>
              <p>Submit your first hospital visit request to see activity here.</p>
            </div>
          ) : (
            <div className="activity-timeline">
              {recentActivity.map((req, i) => {
                const statusIcons = {
                  pending: { icon: '⏳', color: 'var(--warning-500)', bg: 'rgba(245,158,11,0.1)' },
                  approved: { icon: '✅', color: 'var(--success-500)', bg: 'rgba(34,197,94,0.1)' },
                  rejected: { icon: '❌', color: 'var(--error-500)', bg: 'rgba(239,68,68,0.1)' },
                  completed: { icon: '🏁', color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
                };
                const si = statusIcons[req.status] || statusIcons.pending;

                return (
                  <div className="timeline-item" key={req.id} style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="timeline-dot" style={{ background: si.bg, color: si.color }}>
                      {si.icon}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">
                        <span className="mono-text">{req.id}</span>
                        <span className="status-badge" style={{ color: si.color, borderColor: si.color }}>
                          {req.status}
                        </span>
                      </div>
                      <div className="timeline-desc">{req.reason} — {req.hospitalName || 'Hospital visit'}</div>
                      <div className="timeline-time">{new Date(req.updatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
