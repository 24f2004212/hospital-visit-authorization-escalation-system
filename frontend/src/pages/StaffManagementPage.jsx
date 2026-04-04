import { useState, useEffect } from 'react';
import { FiUserPlus, FiMail, FiShield, FiLock, FiUser, FiAlertCircle, FiCheckCircle, FiLoader, FiTrash2 } from 'react-icons/fi';
import api from '../utils/api';

export default function StaffManagementPage() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'warden',
    passcode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Client-side validation for passcode
    if (!/^\d{6}$/.test(formData.passcode)) {
      setError('Passcode must be exactly 6 digits.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/create-staff', {
        email: formData.email,
        name: formData.name,
        role: formData.role.toUpperCase(),
        passcode: formData.passcode
      });
      setSuccess(`Successfully created ${formData.role} account for ${formData.email}`);
      setFormData({ email: '', name: '', role: 'warden', passcode: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create staff account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="header-content">
          <h1>Staff Management</h1>
          <p>Create and manage administrative accounts (Wardens, Proctors, and Guards)</p>
        </div>
      </header>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <div className="glass-card p-6" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: 'rgba(78, 205, 196, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--primary-400)'
            }}>
              <FiUserPlus size={24} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Create New Staff Account</h2>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon"><FiUser /></span>
                <input 
                  type="text" 
                  name="name"
                  className="form-input" 
                  placeholder="e.g. Dr. Shankar"
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon"><FiMail /></span>
                <input 
                  type="email" 
                  name="email"
                  className="form-input" 
                  placeholder="staff@hostel.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Staff Role</label>
              <div className="input-wrapper">
                <span className="input-icon"><FiShield /></span>
                <select 
                  name="role"
                  className="form-select" 
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="warden">Warden</option>
                  <option value="proctor">Proctor</option>
                  <option value="guard">Guard</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">6-Digit Passcode</label>
              <div className="input-wrapper">
                <span className="input-icon"><FiLock /></span>
                <input 
                  type="text" 
                  name="passcode"
                  maxLength={6}
                  className="form-input" 
                  placeholder="e.g. 123456"
                  value={formData.passcode}
                  onChange={handleChange}
                  required 
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.4rem' }}>
                This 6-digit number will be used for their initial login.
              </p>
            </div>

            {error && (
              <div className="form-error" style={{ marginBottom: '1.5rem' }}>
                <FiAlertCircle size={14} /> {error}
              </div>
            )}

            {success && (
              <div className="form-success" style={{ 
                marginBottom: '1.5rem', 
                padding: '0.75rem', 
                background: 'rgba(74, 222, 128, 0.1)', 
                color: '#4ade80', 
                borderRadius: '8px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FiCheckCircle size={14} /> {success}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary w-full" 
              disabled={loading}
              style={{ padding: '0.875rem' }}
            >
              {loading ? (
                <>
                  <FiLoader className="spinner" style={{ marginRight: '0.5rem' }} />
                  Creating Account...
                </>
              ) : (
                'Create Staff Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
