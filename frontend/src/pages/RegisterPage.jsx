import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiShield, FiAlertCircle, FiPhone, FiHome, FiHash, FiCheckCircle, FiCheck, FiX } from 'react-icons/fi';
const COUNTRY_CODES = [
  { code: '+1', name: 'US/CA' }, { code: '+7', name: 'Russia/KZ' }, { code: '+20', name: 'Egypt' }, { code: '+27', name: 'South Africa' },
  { code: '+30', name: 'Greece' }, { code: '+31', name: 'Netherlands' }, { code: '+32', name: 'Belgium' }, { code: '+33', name: 'France' },
  { code: '+34', name: 'Spain' }, { code: '+36', name: 'Hungary' }, { code: '+39', name: 'Italy' }, { code: '+40', name: 'Romania' },
  { code: '+41', name: 'Switzerland' }, { code: '+43', name: 'Austria' }, { code: '+44', name: 'UK' }, { code: '+45', name: 'Denmark' },
  { code: '+46', name: 'Sweden' }, { code: '+47', name: 'Norway' }, { code: '+48', name: 'Poland' }, { code: '+49', name: 'Germany' },
  { code: '+51', name: 'Peru' }, { code: '+52', name: 'Mexico' }, { code: '+54', name: 'Argentina' }, { code: '+55', name: 'Brazil' },
  { code: '+56', name: 'Chile' }, { code: '+57', name: 'Colombia' }, { code: '+58', name: 'Venezuela' }, { code: '+60', name: 'Malaysia' },
  { code: '+61', name: 'Australia' }, { code: '+62', name: 'Indonesia' }, { code: '+63', name: 'Philippines' }, { code: '+64', name: 'New Zealand' },
  { code: '+65', name: 'Singapore' }, { code: '+66', name: 'Thailand' }, { code: '+81', name: 'Japan' }, { code: '+82', name: 'South Korea' },
  { code: '+84', name: 'Vietnam' }, { code: '+86', name: 'China' }, { code: '+90', name: 'Turkey' }, { code: '+91', name: 'India' },
  { code: '+92', name: 'Pakistan' }, { code: '+93', name: 'Afghanistan' }, { code: '+94', name: 'Sri Lanka' }, { code: '+95', name: 'Myanmar' },
  { code: '+98', name: 'Iran' }, { code: '+212', name: 'Morocco' }, { code: '+213', name: 'Algeria' }, { code: '+234', name: 'Nigeria' },
  { code: '+254', name: 'Kenya' }, { code: '+255', name: 'Tanzania' }, { code: '+256', name: 'Uganda' }, { code: '+260', name: 'Zambia' },
  { code: '+351', name: 'Portugal' }, { code: '+353', name: 'Ireland' }, { code: '+358', name: 'Finland' }, { code: '+380', name: 'Ukraine' },
  { code: '+420', name: 'Czech Rep' }, { code: '+880', name: 'Bangladesh' }, { code: '+966', name: 'Saudi Arabia' }, { code: '+971', name: 'UAE' },
  { code: '+972', name: 'Israel' }, { code: '+977', name: 'Nepal' }, { code: '+355', name: 'Albania' }, { code: '+376', name: 'Andorra' },
  { code: '+244', name: 'Angola' }, { code: '+374', name: 'Armenia' }, { code: '+973', name: 'Bahrain' }, { code: '+375', name: 'Belarus' },
  { code: '+501', name: 'Belize' }, { code: '+229', name: 'Benin' }, { code: '+975', name: 'Bhutan' }, { code: '+591', name: 'Bolivia' },
  { code: '+387', name: 'Bosnia' }, { code: '+267', name: 'Botswana' }, { code: '+673', name: 'Brunei' }, { code: '+359', name: 'Bulgaria' },
  { code: '+226', name: 'Burkina Faso' }, { code: '+257', name: 'Burundi' }, { code: '+855', name: 'Cambodia' }, { code: '+237', name: 'Cameroon' },
  { code: '+238', name: 'Cape Verde' }, { code: '+236', name: 'CAR' }, { code: '+235', name: 'Chad' }, { code: '+269', name: 'Comoros' },
  { code: '+506', name: 'Costa Rica' }, { code: '+385', name: 'Croatia' }, { code: '+53', name: 'Cuba' }, { code: '+357', name: 'Cyprus' }
];

export default function RegisterPage({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({ 
    fullName: '', email: '', password: '', confirmPassword: '', 
    hostelBlock: '', roomNumber: '', countryCode: '+91', phoneNumber: '',
    parentEmail: '', parentCountryCode: '+91', parentPhone: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const adminRoles = [{ value: 'warden', label: 'Warden' }, { value: 'proctor', label: 'Proctor' }];
  const [adminRole, setAdminRole] = useState('warden');
  const [role, setRole] = useState('student');

  const handleChange = (field) => (e) => { 
    setFormData(prev => ({ ...prev, [field]: e.target.value })); 
    setError(''); 
  };

  const pwdCriteria = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>\-_]/.test(formData.password),
    noStartNumber: formData.password.length > 0 && !/^\d/.test(formData.password)
  };

  const isPasswordValid = pwdCriteria.length && pwdCriteria.uppercase && pwdCriteria.lowercase && pwdCriteria.special && pwdCriteria.noStartNumber;

  const validateForm = () => {
    if (!formData.fullName.trim()) return 'Please enter your full name';
    if (!formData.email.trim()) return 'Please enter your email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email';
    
    if (!isPasswordValid) return 'Please ensure password meets all security requirements';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    
    if (!formData.phoneNumber.trim()) return 'Phone number is required to create an account';
    if (!/^\d+$/.test(formData.phoneNumber)) return 'Phone number must contain ONLY numbers';
    
    const fullContactNumber = `${formData.countryCode}${formData.phoneNumber}`;

    if (role === 'student') {
      if (!formData.hostelBlock.trim()) return 'Please enter your hostel block';
      if (!formData.roomNumber.trim()) return 'Please enter your room number';
      if (!formData.parentEmail.trim()) return 'Please enter your parent\'s email';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) return 'Invalid parent email';
      if (!formData.parentPhone.trim()) return 'Parent mobile number is required';
      if (formData.parentPhone.length < 5) return 'Invalid parent mobile number';
    }
    return null;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const v = validateForm();
    if (v) { setError(v); return; }
    
    setLoading(true);
    try {
      const fullContactNumber = `${formData.countryCode} ${formData.phoneNumber}`;
      const result = await register({ 
        fullName: formData.fullName, 
        email: formData.email, 
        password: formData.password, 
        role: role, 
        hostelBlock: formData.hostelBlock, 
        roomNumber: formData.roomNumber, 
        contactNumber: fullContactNumber,
        parentEmail: formData.parentEmail,
        parentPhone: `${formData.parentCountryCode} ${formData.parentPhone}`
      });
      // If staff registration needs admin approval
      if (result?.pendingApproval) {
        setPendingApproval(true);
      }
    } catch (err) { 
      setError(err.message || 'Registration failed'); 
    } finally { 
      setLoading(false); 
    }
  };

  // If registration is pending admin approval, show success message
  if (pendingApproval) {
    return (
      <div className="auth-container">
        <div className="animated-bg"></div>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="auth-card glass-card" style={{ textAlign: 'center' }}>
          <div className="auth-brand">
            <div className="auth-brand-logo"><img src="/logo.png" alt="CareSync Logo" /></div>
            <h1 style={{ fontSize: '1.5rem' }}>✅ Registration Submitted</h1>
          </div>
          <div style={{ padding: '1.5rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)', margin: '1rem 0' }}>
            <p style={{ color: '#4ade80', fontWeight: 600, marginBottom: '0.5rem', fontSize: '1rem' }}>Your account is pending admin approval.</p>
            <p style={{ color: 'var(--neutral-400)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              You have successfully registered as a <strong style={{ color: 'var(--primary-400)' }}>{adminRole}</strong>. 
              An administrator will review your registration and approve it. 
              You will be able to log in once your account is approved.
            </p>
          </div>
          <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={onSwitchToLogin}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="animated-bg"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="auth-card glass-card">
        <div className="auth-brand">
          <div className="auth-brand-logo"><img src="/logo.png" alt="CareSync Logo" /></div>
          <h1>Create Account</h1>
          <p>Join CareSync — Hospital Visit Authorization</p>
        </div>

        <div className="role-toggle">
          <button type="button" className={`role-toggle-btn ${role === 'student' ? 'active' : ''}`} onClick={() => { setRole('student'); setError(''); }}>
            <FiUser size={15} /> Student
          </button>
          <button type="button" className={`role-toggle-btn ${role === 'admin' ? 'active' : ''}`} onClick={() => { setRole('admin'); setError(''); }}>
            <FiShield size={15} /> Staff
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
              <input id="reg-email" type="email" className="form-input" placeholder="student@hostel.edu" value={formData.email} onChange={handleChange('email')} required />
            </div>
          </div>

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

          <div className="form-group form-fields-enter" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-400)' }}>Parent / Guardian Details</p>
            
            <div>
              <label className="form-label">Parent Email</label>
              <div className="input-wrapper">
                <span className="input-icon"><FiMail /></span>
                <input type="email" className="form-input" placeholder="parent@example.com" value={formData.parentEmail} onChange={handleChange('parentEmail')} required />
              </div>
            </div>

            <div>
              <label className="form-label">Parent Mobile</label>
              <div className="input-wrapper" style={{ display: 'flex', gap: '0.5rem' }}>
                <select className="form-select" style={{ width: '100px' }} value={formData.parentCountryCode} onChange={handleChange('parentCountryCode')}>
                  {COUNTRY_CODES.map((c, i) => <option key={i} value={c.code}>{c.code}</option>)}
                </select>
                <input type="text" className="form-input" placeholder="Mobile Number" value={formData.parentPhone} onChange={handleChange('parentPhone')} required />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <div className="input-wrapper" style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                className="form-select" 
                style={{ width: '120px', paddingLeft: '1rem', borderRight: '1px solid rgba(255,255,255,0.1)' }}
                value={formData.countryCode} 
                onChange={handleChange('countryCode')}
              >
                {COUNTRY_CODES.map((c, i) => (
                  <option key={i} value={c.code}>{c.code} {c.name}</option>
                ))}
              </select>
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '0.75rem' }}
                placeholder="Only digits" 
                value={formData.phoneNumber} 
                onChange={handleChange('phoneNumber')} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon"><FiLock /></span>
              <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Create a strong password" value={formData.password} onChange={handleChange('password')} required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>{showPassword ? <FiEyeOff /> : <FiEye />}</button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-wrapper"><span className="input-icon"><FiCheckCircle /></span><input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange('confirmPassword')} required /></div>
          </div>

          {error && <div className="form-error"><FiAlertCircle size={14} />{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
        </form>

        <div className="auth-divider">or</div>
        <div className="auth-switch">Already have an account? <button onClick={onSwitchToLogin}>Sign In</button></div>
      </div>
    </div>
  );
}
