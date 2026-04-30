import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MdLocalLaundryService, MdEmail, MdLock, MdLogin } from 'react-icons/md';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.03,
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, background: 'var(--accent)', borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(233,69,96,0.4)'
          }}>
            <MdLocalLaundryService style={{ color: 'white' }} />
          </div>
          <h1 style={{ color: 'white', fontFamily: 'Syne, sans-serif', fontSize: 32 }}>LaundryPro</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8, fontSize: 14 }}>
            Dry Cleaning Management System
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 36
        }}>
          <h2 style={{ color: 'white', marginBottom: 28, fontSize: 20 }}>Sign In</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{ color: 'rgba(255,255,255,0.6)' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <MdEmail style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.4)', fontSize: 18
                }} />
                <input
                  type="email"
                  placeholder="admin@laundry.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)',
                    color: 'white', paddingLeft: 42
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ color: 'rgba(255,255,255,0.6)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <MdLock style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.4)', fontSize: 18
                }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)',
                    color: 'white', paddingLeft: 42
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              disabled={loading}
            >
              {loading ? '⏳ Signing in...' : <><MdLogin /> Sign In</>}
            </button>
          </form>

          <div style={{
            marginTop: 24, padding: '14px 16px',
            background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 6 }}>Demo Credentials:</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>📧 admin@laundry.com</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>🔑 admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
