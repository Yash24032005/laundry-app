import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard, MdListAlt, MdAddCircle, MdLogout,
  MdMenu, MdClose, MdLocalLaundryService, MdPerson
} from 'react-icons/md';
import toast from 'react-hot-toast';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
    { to: '/orders', icon: <MdListAlt />, label: 'All Orders' },
    { to: '/orders/new', icon: <MdAddCircle />, label: 'New Order' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40, display: 'none' }}
          className="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 260, background: 'var(--primary)', color: 'white',
        display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, left: 0, bottom: 0, zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.3s ease'
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, background: 'var(--accent)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
            }}>
              <MdLocalLaundryService />
            </div>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18 }}>LaundryPro</div>
              <div style={{ fontSize: 11, opacity: 0.6, marginTop: 1 }}>Management System</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '20px 16px' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 10, marginBottom: 4,
                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                background: isActive ? 'rgba(233,69,96,0.2)' : 'transparent',
                color: isActive ? 'var(--accent-light)' : 'rgba(255,255,255,0.7)',
                border: isActive ? '1px solid rgba(233,69,96,0.3)' : '1px solid transparent',
                transition: 'all 0.2s'
              })}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
            }}>
              <MdPerson />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1 }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn" style={{
            width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <MdLogout /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ marginLeft: 260, flex: 1, minHeight: '100vh' }}>
        {/* Top bar for mobile */}
        <header style={{
          height: 64, background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 24px',
          position: 'sticky', top: 0, zIndex: 30, justifyContent: 'space-between'
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            {sidebarOpen ? <MdClose /> : <MdMenu />}
          </button>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong> 👋
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: '32px 32px' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          aside { transform: translateX(-100%); }
          aside.open { transform: translateX(0); }
          main > div:first-child { margin-left: 0 !important; }
          .mobile-overlay { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default Layout;
