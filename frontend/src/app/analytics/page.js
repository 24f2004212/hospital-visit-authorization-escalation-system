'use client';
import { useData } from '@/context/DataContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FiUsers, FiCheckCircle, FiClock, FiAlertTriangle, FiStar, FiBarChart2 } from 'react-icons/fi';

function AnalyticsContent() {
  const { requests, feedback, guards, stats } = useData();

  const urgencyData = [
    { label: 'Normal', value: requests.filter(r => r.urgency === 'normal').length, color: 'var(--primary-400)' },
    { label: 'Urgent', value: requests.filter(r => r.urgency === 'urgent').length, color: 'var(--warning-500)' },
    { label: 'Emergency', value: requests.filter(r => r.urgency === 'emergency').length, color: 'var(--error-500)' },
  ];

  const statusData = [
    { label: 'Pending', value: stats.pending, color: 'var(--warning-500)' },
    { label: 'Approved', value: stats.approved, color: 'var(--success-500)' },
    { label: 'Rejected', value: stats.rejected, color: 'var(--error-500)' },
    { label: 'Completed', value: stats.completed, color: '#a855f7' },
  ];

  const reasonCounts = {};
  requests.forEach(r => { reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1; });
  const topReasons = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const ratingDist = [1, 2, 3, 4, 5].map(r => ({
    label: `${r}★`,
    value: feedback.filter(f => f.rating === r).length,
    color: r >= 4 ? 'var(--success-500)' : r >= 3 ? 'var(--warning-500)' : 'var(--error-500)',
  }));

  const maxBarValue = (data) => Math.max(...data.map(d => d.value), 1);

  const overviewStats = [
    { icon: <FiBarChart2 />, label: 'Total Requests', value: stats.totalRequests, color: 'var(--primary-400)', bg: 'rgba(0,212,170,0.1)' },
    { icon: <FiClock />, label: 'Pending', value: stats.pending, color: 'var(--warning-500)', bg: 'rgba(245,158,11,0.1)' },
    { icon: <FiCheckCircle />, label: 'Completed', value: stats.completed, color: 'var(--success-500)', bg: 'rgba(34,197,94,0.1)' },
    { icon: <FiAlertTriangle />, label: 'Escalated', value: stats.escalated, color: 'var(--error-500)', bg: 'rgba(239,68,68,0.1)' },
    { icon: <FiUsers />, label: 'Guards Available', value: `${stats.guardsAvailable}/${stats.guardsTotal}`, color: 'var(--accent-400)', bg: 'rgba(59,158,255,0.1)' },
    { icon: <FiStar />, label: 'Avg Rating', value: stats.avgRating, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  ];

  const total = stats.totalRequests || 1;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Analytics Dashboard</h1>
          <p className="page-subtitle">Hospital visit analytics and insights for hostel management.</p>
        </div>
      </div>

      <div className="stats-grid">
        {overviewStats.map((s, i) => (
          <div className="stat-card glass-card" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-card-info">
              <div className="stat-card-value">{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        <div className="chart-card glass-card">
          <h3>📈 Request Status</h3>
          <div className="donut-stat">
            <div className="donut-ring" style={{
              background: `conic-gradient(
                var(--warning-500) 0deg ${(stats.pending / total * 360)}deg,
                var(--success-500) ${(stats.pending / total * 360)}deg ${((stats.pending + stats.approved) / total * 360)}deg,
                var(--error-500) ${((stats.pending + stats.approved) / total * 360)}deg ${((stats.pending + stats.approved + stats.rejected) / total * 360)}deg,
                #a855f7 ${((stats.pending + stats.approved + stats.rejected) / total * 360)}deg 360deg
              )`
            }}>
              <div className="donut-ring-inner">
                <div className="donut-ring-value">{stats.totalRequests}</div>
                <div className="donut-ring-label">Total</div>
              </div>
            </div>
            <div className="donut-legend">
              {statusData.map(s => (
                <div className="legend-item" key={s.label}>
                  <span className="legend-dot" style={{ background: s.color }} />
                  <span>{s.label}</span>
                  <span className="legend-value">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card glass-card">
          <h3>⚡ Urgency Breakdown</h3>
          <div className="bar-chart">
            {urgencyData.map(d => (
              <div className="bar-item" key={d.label}>
                <div className="bar-value">{d.value}</div>
                <div className="bar-fill" style={{
                  height: `${(d.value / maxBarValue(urgencyData)) * 100}%`,
                  background: d.color,
                }} />
                <div className="bar-label">{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card glass-card">
          <h3>🏥 Top Visit Reasons</h3>
          {topReasons.length === 0 ? (
            <div className="empty-state" style={{ padding: '1rem' }}><p>No data yet</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {topReasons.map(([reason, count], i) => {
                const pct = (count / total * 100).toFixed(0);
                return (
                  <div key={reason}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--neutral-300)' }}>{reason}</span>
                      <span style={{ color: 'var(--neutral-400)', fontWeight: 700 }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: `hsl(${170 + i * 30}, 70%, 50%)`,
                        borderRadius: '3px',
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="chart-card glass-card">
          <h3>⭐ Feedback Ratings</h3>
          {feedback.length === 0 ? (
            <div className="empty-state" style={{ padding: '1rem' }}><p>No feedback yet</p></div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--neutral-0)' }}>{stats.avgRating}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--neutral-400)' }}>
                  Average from {feedback.length} reviews
                </div>
                <div style={{ fontSize: '1.2rem', marginTop: '0.25rem' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < Math.round(parseFloat(stats.avgRating)) ? '⭐' : '☆'}</span>
                  ))}
                </div>
              </div>
              <div className="bar-chart" style={{ height: '100px' }}>
                {ratingDist.map(d => (
                  <div className="bar-item" key={d.label}>
                    <div className="bar-value">{d.value}</div>
                    <div className="bar-fill" style={{
                      height: `${(d.value / maxBarValue(ratingDist)) * 100}%`,
                      background: d.color,
                    }} />
                    <div className="bar-label">{d.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="chart-card glass-card">
          <h3>💂 Guard Utilization</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {guards.map(g => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 32, height: 32,
                  borderRadius: 'var(--radius-full)',
                  background: g.status === 'available' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700,
                  color: g.status === 'available' ? 'var(--success-500)' : 'var(--warning-500)',
                }}>
                  {g.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--neutral-200)', fontWeight: 600 }}>{g.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--neutral-500)' }}>{g.phone}</div>
                </div>
                <span className="status-badge" style={{
                  color: g.status === 'available' ? 'var(--success-500)' : 'var(--warning-500)',
                  borderColor: g.status === 'available' ? 'var(--success-500)' : 'var(--warning-500)',
                }}>
                  {g.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card glass-card">
          <h3>🚨 Escalation Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🚨</div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--neutral-0)' }}>{stats.escalated}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Escalations</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>⚡</div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--neutral-0)' }}>{stats.emergencyCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Emergency Requests</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📱</div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--neutral-0)' }}>
                  {requests.filter(r => r.parentNotified).length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Parents Notified</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute adminOnly>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}
