'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiShield, FiAlertCircle, FiPhone, FiHome, FiHash, FiCheckCircle } from 'react-icons/fi';

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '', hostelBlock: '', roomNumber: '', contactNumber: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const adminRoles = [{ value: 'warden', label: 'Warden' }, { value: 'proctor', label: 'Proctor' }, { value: 'admin', label: 'Admin' }, { value: 'guard', label: 'Guard' }];
  const [adminRole, setAdminRole] = useState('warden');

  if (user) {
    router.replace('/dashboard');
    return null;
  }

  const handleChange = (field) => (e) => { setFormData(prev => ({ ...prev, [field]: e.target.value })); setError(''); };

  const validateForm = () => {
    if (!formData.fullName.trim()) return 'Please enter your full name';
    if (!formData.email.trim()) return 'Please enter your email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (role === 'student') {
      if (!formData.hostelBlock.trim()) return 'Please enter your hostel block';
      if (!formData.roomNumber.trim()) return 'Please enter your room number';
    }
    if (!formData.contactNumber.trim()) return 'Please enter your contact number';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const v = validateForm();
    if (v) { setError(v); return; }
    setLoading(true);
    try {
      await register({ fullName: formData.fullName, email: formData.email, password: formData.password, role: role === 'admin' ? adminRole : 'student', hostelBlock: formData.hostelBlock, roomNumber: formData.roomNumber, contactNumber: formData.contactNumber });
      router.push('/dashboard');
    } catch (err) { setError(err.message || 'Registration failed'); } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="animated-bg"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="auth-card glass-card">
        <div className="auth-brand">
          <div className="auth-brand-logo"><FiShield size={28} color="white" /></div>
          <h1>Create Account</h1>
          <p>Join CareSync — Hospital Visit Authorization</p>
        </div>

        <div className="role-toggle">
          <button type="button" className={`role-toggle-btn ${role === 'student' ? 'active' : ''}`} onClick={() => { setRole('student'); setError(''); }}>
            <FiUser size={15} /> Student
          </button>
          <button type="button" className={`role-toggle-btn ${role === 'admin' ? 'active' : ''}`} onClick={() => { setRole('admin'); setError(''); }}>
            <FiShield size={15} /> Admin
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-fullname">Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon"><FiUser /></span>
              <input id="reg-fullname" type="text" className="form-input" placeholder="John Doe" value={formData.fullName} onChange={handleChange('fullName')} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon"><FiMail /></span>
              <input id="reg-email" type="email" className="form-input" placeholder={role === 'admin' ? 'admin@hostel.edu' : 'student@hostel.edu'} value={formData.email} onChange={handleChange('email')} required />
            </div>
          </div>

          {role === 'admin' && (
            <div className="form-group form-fields-enter">
              <label className="form-label" htmlFor="reg-admin-role">Admin Role</label>
              <div className="input-wrapper">
                <span className="input-icon"><FiShield /></span>
                <select id="reg-admin-role" className="form-select" value={adminRole} onChange={(e) => setAdminRole(e.target.value)}>
                  {adminRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
          )}

          {role === 'student' && (
            <div className="form-group form-fields-enter" style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">Hostel Block</label>
                <div className="input-wrapper"><span className="input-icon"><FiHome /></span><input type="text" className="form-input" placeholder="Block A" value={formData.hostelBlock} onChange={handleChange('hostelBlock')} required /></div>
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">Room No.</label>
                <div className="input-wrapper"><span className="input-icon"><FiHash /></span><input type="text" className="form-input" placeholder="204" value={formData.roomNumber} onChange={handleChange('roomNumber')} required /></div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <div className="input-wrapper"><span className="input-icon"><FiPhone /></span><input type="tel" className="form-input" placeholder="+91 98765 43210" value={formData.contactNumber} onChange={handleChange('contactNumber')} required /></div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon"><FiLock /></span>
              <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Min. 6 characters" value={formData.password} onChange={handleChange('password')} required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>{showPassword ? <FiEyeOff /> : <FiEye />}</button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-wrapper"><span className="input-icon"><FiCheckCircle /></span><input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Re-enter your password" value={formData.confirmPassword} onChange={handleChange('confirmPassword')} required /></div>
          </div>

          {error && <div className="form-error"><FiAlertCircle size={14} />{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>{loading && <span className="spinner"></span>}{loading ? 'Creating Account...' : 'Create Account'}</button>
        </form>

        <div className="auth-divider">or</div>
        <div className="auth-switch">Already have an account? <Link href="/login">Sign In</Link></div>
      </div>
    </div>
  );
}
