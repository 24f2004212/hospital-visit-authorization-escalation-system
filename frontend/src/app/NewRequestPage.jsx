import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
  FiAlertCircle, FiCalendar, FiClock, FiFileText,
  FiMapPin, FiSend, FiAlertTriangle, FiCheckCircle
} from 'react-icons/fi';

export default function NewRequestPage() {
  const { submitRequest } = useData();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    reason: '',
    description: '',
    urgency: 'normal',
    preferredDate: '',
    preferredTime: '',
    hospitalName: '',
  });

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.reason.trim()) return setError('Please select a reason');
    if (!form.description.trim()) return setError('Please describe your condition');
    if (!form.preferredDate) return setError('Please select a date');
    if (!form.preferredTime) return setError('Please select a time');

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const req = submitRequest(form);
    setSuccess(req);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="page-container">
        <div className="success-page">
          <div className="success-page-icon">
            {success.urgency === 'emergency' ? '🚨' : '✅'}
          </div>
          <h1>Request {success.urgency === 'emergency' ? 'Auto-Approved!' : 'Submitted!'}</h1>
          <p className="success-id">Request ID: <strong>{success.id}</strong></p>
          {success.urgency === 'emergency' && (
            <div className="alert-box alert-emergency">
              <FiAlertTriangle />
              <span>Emergency request auto-approved. Parents and wardens have been notified. A guard will be assigned shortly.</span>
            </div>
          )}
          {success.urgency !== 'emergency' && (
            <p className="success-msg">Your request has been sent to the warden for approval. You'll be notified once it's reviewed.</p>
          )}
          <div className="success-actions">
            <button className="btn-primary" onClick={() => navigate('/my-requests')} style={{ width: 'auto', padding: '0.75rem 2rem' }}>
              View My Requests
            </button>
            <button className="btn-outline" onClick={() => { setSuccess(null); setForm({ reason: '', description: '', urgency: 'normal', preferredDate: '', preferredTime: '', hospitalName: '' }); }}>
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">📝 New Hospital Visit Request</h1>
          <p className="page-subtitle">Fill in the details below. Emergency requests are auto-approved.</p>
        </div>
      </div>

      <div className="form-card glass-card">
        <form className="request-form" onSubmit={handleSubmit}>
          {/* Urgency Level */}
          <div className="form-group">
            <label className="form-label">Urgency Level</label>
            <div className="urgency-selector">
              {['normal', 'urgent', 'emergency'].map(level => (
                <button
                  key={level}
                  type="button"
                  className={`urgency-option ${form.urgency === level ? 'urgency-option-active' : ''}`}
                  data-urgency={level}
                  onClick={() => { setForm(prev => ({ ...prev, urgency: level })); setError(''); }}
                >
                  <span className="urgency-option-icon">
                    {level === 'normal' && <FiCheckCircle />}
                    {level === 'urgent' && <FiClock />}
                    {level === 'emergency' && <FiAlertTriangle />}
                  </span>
                  <span className="urgency-option-label">{level}</span>
                  <span className="urgency-option-desc">
                    {level === 'normal' && 'Routine checkup'}
                    {level === 'urgent' && 'Needs quick attention'}
                    {level === 'emergency' && 'Immediate medical help'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {form.urgency === 'emergency' && (
            <div className="alert-box alert-emergency">
              <FiAlertTriangle />
              <span>Emergency requests are <strong>auto-approved</strong>. Parents, wardens, and proctors will be immediately notified.</span>
            </div>
          )}

          {/* Reason */}
          <div className="form-group">
            <label className="form-label" htmlFor="req-reason">Reason for Visit</label>
            <div className="input-wrapper">
              <span className="input-icon"><FiFileText /></span>
              <select id="req-reason" className="form-select" value={form.reason} onChange={handleChange('reason')} required>
                <option value="">Select a reason...</option>
                <option value="General Checkup">General Checkup</option>
                <option value="Fever / Cold / Flu">Fever / Cold / Flu</option>
                <option value="Injury / Accident">Injury / Accident</option>
                <option value="Dental Issue">Dental Issue</option>
                <option value="Eye / Vision Issue">Eye / Vision Issue</option>
                <option value="Stomach / Digestion">Stomach / Digestion</option>
                <option value="Skin Problem">Skin Problem</option>
                <option value="Mental Health / Counselling">Mental Health / Counselling</option>
                <option value="Follow-up Visit">Follow-up Visit</option>
                <option value="Lab Tests / Reports">Lab Tests / Reports</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="req-desc">Description</label>
            <textarea
              id="req-desc"
              className="form-textarea"
              placeholder="Describe your symptoms or reason for the hospital visit..."
              value={form.description}
              onChange={handleChange('description')}
              rows={3}
              required
            />
          </div>

          {/* Hospital Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="req-hospital">Hospital / Clinic Name (optional)</label>
            <div className="input-wrapper">
              <span className="input-icon"><FiMapPin /></span>
              <input
                id="req-hospital"
                type="text"
                className="form-input"
                placeholder="e.g., City General Hospital"
                value={form.hospitalName}
                onChange={handleChange('hospitalName')}
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="req-date">Preferred Date</label>
              <div className="input-wrapper">
                <span className="input-icon"><FiCalendar /></span>
                <input
                  id="req-date"
                  type="date"
                  className="form-input"
                  value={form.preferredDate}
                  onChange={handleChange('preferredDate')}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="req-time">Preferred Time</label>
              <div className="input-wrapper">
                <span className="input-icon"><FiClock /></span>
                <input
                  id="req-time"
                  type="time"
                  className="form-input"
                  value={form.preferredTime}
                  onChange={handleChange('preferredTime')}
                  required
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="form-error">
              <FiAlertCircle size={14} /> {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <span className="spinner"></span>}
            {loading ? 'Submitting...' : <><FiSend style={{ marginRight: '0.5rem' }} /> Submit Request</>}
          </button>
        </form>
      </div>
    </div>
  );
}
