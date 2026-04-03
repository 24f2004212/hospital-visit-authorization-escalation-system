'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { FiStar, FiSend, FiAlertCircle } from 'react-icons/fi';

function FeedbackContent() {
  const { user } = useAuth();
  const { myRequests, requests, feedback, submitFeedback } = useData();
  const isAdmin = ['admin', 'warden', 'proctor', 'guard'].includes(user?.role);

  const completedRequests = isAdmin
    ? requests.filter(r => r.status === 'completed')
    : myRequests.filter(r => r.status === 'completed');

  const givenFeedbackIds = feedback.map(f => f.requestId);
  const pendingFeedback = completedRequests.filter(r => !givenFeedbackIds.includes(r.id));

  const [selectedRequest, setSelectedRequest] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hospitalExperience, setHospitalExperience] = useState('');
  const [guardBehavior, setGuardBehavior] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedRequest) return setError('Please select a completed visit');
    if (rating === 0) return setError('Please provide a rating');
    if (!hospitalExperience.trim()) return setError('Please describe your hospital experience');

    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    submitFeedback({
      requestId: selectedRequest,
      rating,
      hospitalExperience,
      guardBehavior,
      suggestions,
    });
    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      setSuccess(false);
      setSelectedRequest('');
      setRating(0);
      setHospitalExperience('');
      setGuardBehavior('');
      setSuggestions('');
    }, 3000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isAdmin ? '📊 Student Feedback' : '⭐ Post-Visit Feedback'}</h1>
          <p className="page-subtitle">
            {isAdmin
              ? 'Review all student feedback to improve hospital visit experiences.'
              : 'Help us improve! Share your experience after each hospital visit.'}
          </p>
        </div>
      </div>

      {!isAdmin && (
        <div className="form-card glass-card" style={{ marginBottom: '2rem' }}>
          {success ? (
            <div className="success-page" style={{ padding: '2rem' }}>
              <div className="success-page-icon">🎉</div>
              <h1 style={{ fontSize: '1.3rem' }}>Thank you for your feedback!</h1>
              <p className="success-msg">Your response helps us improve the system.</p>
            </div>
          ) : (
            <form className="request-form feedback-form" onSubmit={handleSubmit}>
              <h3 style={{ color: 'var(--neutral-200)', marginBottom: '0.25rem' }}>Share Your Experience</h3>

              {pendingFeedback.length === 0 ? (
                <div className="empty-state" style={{ padding: '1.5rem 0' }}>
                  <p>No completed visits awaiting feedback.</p>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Select Completed Visit</label>
                    <select className="form-select" style={{ paddingLeft: '1rem' }} value={selectedRequest} onChange={e => { setSelectedRequest(e.target.value); setError(''); }}>
                      <option value="">Choose a visit...</option>
                      {pendingFeedback.map(r => (
                        <option key={r.id} value={r.id}>{r.id} — {r.reason} ({new Date(r.preferredDate).toLocaleDateString()})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Overall Rating</label>
                    <div className="rating-selector">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className="rating-star"
                          onClick={() => { setRating(star); setError(''); }}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          {star <= (hoverRating || rating) ? '⭐' : '☆'}
                        </button>
                      ))}
                      {rating > 0 && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--warning-500)', fontWeight: 700, marginLeft: '0.5rem', alignSelf: 'center' }}>
                          {rating}/5
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hospital Experience</label>
                    <textarea className="form-textarea" placeholder="How was your experience at the hospital? Was the staff helpful?" value={hospitalExperience} onChange={e => setHospitalExperience(e.target.value)} rows={3} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Guard Assistance (Optional)</label>
                    <textarea className="form-textarea" placeholder="How was the guard's behavior? Were they helpful and supportive?" value={guardBehavior} onChange={e => setGuardBehavior(e.target.value)} rows={2} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Suggestions (Optional)</label>
                    <textarea className="form-textarea" placeholder="Any suggestions to improve the hospital visit process?" value={suggestions} onChange={e => setSuggestions(e.target.value)} rows={2} />
                  </div>

                  {error && <div className="form-error"><FiAlertCircle size={14} /> {error}</div>}

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading && <span className="spinner"></span>}
                    {loading ? 'Submitting...' : <><FiSend style={{ marginRight: '0.4rem' }} /> Submit Feedback</>}
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      )}

      {feedback.length > 0 && (
        <div className="section-card glass-card">
          <div className="section-card-header">
            <h2>📝 {isAdmin ? 'All Student Feedback' : 'My Past Feedback'}</h2>
          </div>

          <div className="requests-list">
            {(isAdmin ? feedback : feedback.filter(f => f.studentId === user?.id)).map((fb, i) => (
              <div key={fb.id} className="request-card" style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,255,255,0.04)',
                animationDelay: `${i * 0.04}s`,
              }}>
                <div className="request-card-top" style={{ marginBottom: '0.5rem' }}>
                  <div className="request-card-id">
                    <span className="mono-text">{fb.requestId}</span>
                    {isAdmin && <span style={{ color: 'var(--neutral-300)', fontSize: '0.85rem', fontWeight: 600 }}>{fb.studentName}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span key={idx} style={{ fontSize: '1rem' }}>{idx < fb.rating ? '⭐' : '☆'}</span>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--neutral-300)', marginBottom: '0.3rem' }}>{fb.hospitalExperience}</p>
                {fb.guardBehavior && <p style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>💂 {fb.guardBehavior}</p>}
                {fb.suggestions && <p style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', marginTop: '0.2rem' }}>💡 {fb.suggestions}</p>}
                <span style={{ fontSize: '0.72rem', color: 'var(--neutral-600)', marginTop: '0.3rem', display: 'block' }}>{new Date(fb.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {feedback.length === 0 && isAdmin && (
        <div className="section-card glass-card">
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No feedback yet</h3>
            <p>Students haven&apos;t submitted any feedback yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <ProtectedRoute>
      <FeedbackContent />
    </ProtectedRoute>
  );
}
