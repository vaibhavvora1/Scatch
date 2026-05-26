import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/client';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';

function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', background: '#fafaf9',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(168, 145, 102, .08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(168, 145, 102, .05) 0%, transparent 50%)',
    }}>
      <motion.div
        className="glass auth-panel"
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: '440px', borderRadius: '1.5rem', padding: '2.5rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', color: 'var(--accent)', marginBottom: '.25rem' }}>Scatch</h1>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '.5rem' }}>{title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.88rem' }}>{subtitle}</p>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate           = useNavigate();
  const [form, setForm]    = useState({ email: '', password: '' });
  const [showPw, setShowPw]= useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const r = await login(form.email, form.password);
    if (r.success) { toast.success('Welcome back!'); navigate('/shop'); }
    else toast.error(r.message);
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--text-secondary)', marginBottom: '.4rem', letterSpacing: '.05em' }}>Email</label>
          <div style={{ position: 'relative' }}>
            <FiMail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input className="input-luxury" type="email" placeholder="you@example.com" value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} style={{ paddingLeft: '2.75rem' }} required />
          </div>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--text-secondary)', marginBottom: '.4rem', letterSpacing: '.05em' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <FiLock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input className="input-luxury" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }} required />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              {showPw ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-magnetic btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '.88rem' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
      </p>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate              = useNavigate();
  const [form, setForm]       = useState({ fullname: '', email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    const r = await register(form.fullname, form.email, form.password);
    if (r.success) { toast.success('Account created!'); navigate('/shop'); }
    else toast.error(r.message);
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join the Scatch community">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--text-secondary)', marginBottom: '.4rem', letterSpacing: '.05em' }}>Full Name</label>
          <div style={{ position: 'relative' }}>
            <FiUser style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input className="input-luxury" type="text" placeholder="Your name" value={form.fullname}
              onChange={(e) => setForm(f => ({ ...f, fullname: e.target.value }))} style={{ paddingLeft: '2.75rem' }} required />
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--text-secondary)', marginBottom: '.4rem', letterSpacing: '.05em' }}>Email</label>
          <div style={{ position: 'relative' }}>
            <FiMail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input className="input-luxury" type="email" placeholder="you@example.com" value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} style={{ paddingLeft: '2.75rem' }} required />
          </div>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--text-secondary)', marginBottom: '.4rem', letterSpacing: '.05em' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <FiLock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input className="input-luxury" type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }} required />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              {showPw ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-magnetic btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '.88rem' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
      </p>
    </AuthLayout>
  );
}

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.adminLogin(form);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      toast.success('Admin access granted');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Scatch Command" subtitle="Luxury operations dashboard">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--text-secondary)', marginBottom: '.4rem', letterSpacing: '.05em' }}>Admin Email</label>
          <div style={{ position: 'relative' }}>
            <FiMail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input className="input-luxury" type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} style={{ paddingLeft: '2.75rem' }} required />
          </div>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--text-secondary)', marginBottom: '.4rem', letterSpacing: '.05em' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <FiLock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input className="input-luxury" type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }} required />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              {showPw ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-magnetic btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? 'Opening dashboard...' : 'Enter Dashboard'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '.88rem' }}>
        Need to create the first admin?{' '}
        <Link to="/admin/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Register Admin</Link>
      </p>
    </AuthLayout>
  );
}

export function AdminRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullname: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authAPI.adminRegister(form);
      toast.success('Admin created. Please login.');
      navigate('/admin/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Admin registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Admin" subtitle="Set up the first Scatch dashboard owner">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--text-secondary)', marginBottom: '.4rem', letterSpacing: '.05em' }}>Full Name</label>
          <div style={{ position: 'relative' }}>
            <FiUser style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input className="input-luxury" type="text" placeholder="Admin name" value={form.fullname}
              onChange={(e) => setForm(f => ({ ...f, fullname: e.target.value }))} style={{ paddingLeft: '2.75rem' }} required />
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--text-secondary)', marginBottom: '.4rem', letterSpacing: '.05em' }}>Admin Email</label>
          <div style={{ position: 'relative' }}>
            <FiMail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input className="input-luxury" type="email" placeholder="admin@example.com" value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} style={{ paddingLeft: '2.75rem' }} required />
          </div>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '.8rem', color: 'var(--text-secondary)', marginBottom: '.4rem', letterSpacing: '.05em' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <FiLock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input className="input-luxury" type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password}
              onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }} required />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              {showPw ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-magnetic btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? 'Creating admin...' : 'Create Admin'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '.88rem' }}>
        Already have admin access?{' '}
        <Link to="/admin/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
      </p>
    </AuthLayout>
  );
}

export default function AuthPages({ mode }) {
  if (mode === 'register') return <RegisterPage />;
  if (mode === 'admin') return <AdminLoginPage />;
  if (mode === 'admin-register') return <AdminRegisterPage />;
  return <LoginPage />;
}
