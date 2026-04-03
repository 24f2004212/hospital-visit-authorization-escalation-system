'use client';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FiHome, FiPlusCircle, FiList, FiCheckCircle,
  FiMapPin, FiAlertTriangle, FiMessageSquare, FiBarChart2,
  FiLogOut, FiShield, FiUser, FiMenu, FiX
} from 'react-icons/fi';
import { useState } from 'react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { stats } = useData();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = ['admin', 'warden', 'proctor', 'guard'].includes(user?.role);

  const studentNavItems = [
    { href: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { href: '/new-request', icon: <FiPlusCircle />, label: 'New Request' },
    { href: '/my-requests', icon: <FiList />, label: 'My Requests' },
    { href: '/tracking', icon: <FiMapPin />, label: 'Visit Tracking' },
    { href: '/feedback', icon: <FiMessageSquare />, label: 'Feedback' },
  ];

  const adminNavItems = [
    { href: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { href: '/approvals', icon: <FiCheckCircle />, label: 'Approvals', badge: stats.pending },
    { href: '/tracking', icon: <FiMapPin />, label: 'Live Tracking', badge: stats.activeVisits },
    { href: '/escalations', icon: <FiAlertTriangle />, label: 'Escalations', badge: stats.escalated },
    { href: '/feedback', icon: <FiMessageSquare />, label: 'Feedback' },
    { href: '/analytics', icon: <FiBarChart2 />, label: 'Analytics' },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <>
      {/* Mobile toggle */}
      <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      <aside className={`sidebar ${collapsed ? 'sidebar-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo">
            <FiShield size={24} />
          </div>
          <div className="sidebar-brand-text">
            <h1>Care<span>Sync</span></h1>
            <p>Hospital Authorization</p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="sidebar-role">
          <div className="sidebar-role-icon">
            {isAdmin ? <FiShield size={14} /> : <FiUser size={14} />}
          </div>
          <span>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Panel</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${pathname === item.href ? 'sidebar-nav-item-active' : ''}`}
              onClick={() => setCollapsed(false)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
              {item.badge > 0 && (
                <span className="sidebar-nav-badge">{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.fullName}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={logout}>
            <FiLogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {collapsed && <div className="sidebar-overlay" onClick={() => setCollapsed(false)} />}
    </>
  );
}
