import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiPlusCircle, FiList, FiCheckSquare,
  FiMapPin, FiMessageSquare, FiBarChart2, FiLogOut, FiMenu, FiX,
  FiAlertTriangle, FiBell, FiUser
} from 'react-icons/fi';
import { useState } from 'react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = ['admin', 'warden', 'proctor', 'guard'].includes(user?.role);

  const studentLinks = [
    { to: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/new-request', icon: <FiPlusCircle />, label: 'New Request' },
    { to: '/my-requests', icon: <FiList />, label: 'My Requests' },
    { to: '/tracking', icon: <FiMapPin />, label: 'Visit Tracking' },
    { to: '/feedback', icon: <FiMessageSquare />, label: 'Feedback' },
    { to: '/notifications', icon: <FiBell />, label: 'Notifications' },
    { to: '/profile', icon: <FiUser />, label: 'My Profile' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/approvals', icon: <FiCheckSquare />, label: 'Approvals' },
    { to: '/tracking', icon: <FiMapPin />, label: 'Live Tracking' },
    { to: '/escalations', icon: <FiAlertTriangle />, label: 'Escalations' },
    { to: '/analytics', icon: <FiBarChart2 />, label: 'Analytics' },
    { to: '/feedback', icon: <FiMessageSquare />, label: 'Feedback' },
    { to: '/notifications', icon: <FiBell />, label: 'Notifications' },
    { to: '/profile', icon: <FiUser />, label: 'My Profile' },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const roleBadge = {
    student: 'badge-student',
    warden: 'badge-warden',
    proctor: 'badge-proctor',
    admin: 'badge-admin',
    guard: 'badge-warden',
  };

  return (
    <>
      {/* Mobile toggle */}
      <button className="sidebar-mobile-toggle" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? <FiX /> : <FiMenu />}
      </button>

      <aside className={`sidebar ${collapsed ? 'sidebar-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <img src="/logo.png" alt="CareSync" />
          </div>
          <div className="sidebar-brand-text">
            <h2>CareSync</h2>
            <span>Hospital Visits</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              onClick={() => setCollapsed(false)}
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              <span className="sidebar-link-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{getInitials(user?.fullName)}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.fullName}</div>
            <span className={`badge ${roleBadge[user?.role] || 'badge-student'}`}>
              {user?.role}
            </span>
          </div>
          <button className="sidebar-logout" onClick={logout} title="Sign Out">
            <FiLogOut />
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {collapsed && <div className="sidebar-overlay" onClick={() => setCollapsed(false)} />}
    </>
  );
}
