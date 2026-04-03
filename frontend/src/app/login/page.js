'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiShield, FiAlertCircle } from 'react-icons/fi';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    router.replace('/dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields'); return; }

    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      const isAdmin = ['admin', 'warden', 'proctor'].includes(loggedInUser.role);
      if (role === 'admin' && !isAdmin) {
        setError('This account does not have admin privileges');
        setLoading(false);
        return;
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="animated-bg"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="auth-card glass-card">
        <div className="auth-brand">
          <div className="auth-brand-logo">
            <FiShield size={28} color="white" />
          </div>
          <h1>Care<span>Sync</span></h1>
          <p>Hospital Visit Authorization System</p>
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
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon"><FiMail /></span>
              <input id="login-email" type="email" className="form-input" placeholder={role === 'admin' ? 'admin@hostel.edu' : 'student@hostel.edu'} value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} autoComplete="email" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon"><FiLock /></span>
              <input id="login-password" type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Enter your password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} autoComplete="current-password" required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {error && <div className="form-error"><FiAlertCircle size={14} />{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <span className="spinner"></span>}
            {loading ? 'Signing in...' : `Sign in as ${role === 'admin' ? 'Admin' : 'Student'}`}
          </button>
        </form>

        <div className="auth-divider">or</div>
        <div className="auth-switch">
          Don&apos;t have an account?{' '}
          <Link href="/register">Create Account</Link>
        </div>
      </div>
    </div>
  );
}
