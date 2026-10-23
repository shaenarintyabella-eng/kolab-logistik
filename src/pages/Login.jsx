import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/ringkasan');
      } else {
        setError(result.message || 'Username atau password salah.');
      }
    } catch (err) {
      setError(err.message || 'Gagal menghubungi server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      padding: '1.5rem'
    }}>
      <div className="card" style={{ 
        width: '100%', 
        maxWidth: '440px', 
        padding: '2.5rem', 
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' 
      }}>
        {/* Logo & Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: 56, height: 56, borderRadius: 'var(--radius-lg)', 
            background: 'linear-gradient(135deg, var(--primary-orange), #FFA533)', 
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', fontWeight: 800, margin: '0 auto 1rem',
            boxShadow: '0 10px 20px var(--primary-orange-glow)'
          }}>
            K+
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-dark)', letterSpacing: '-0.02em' }}>
            Ko+Lab Logistik
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Sistem Manajemen Inventori Retail & F&B
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'var(--status-habis-bg)', color: 'var(--status-habis-text)', 
            padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', 
            fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' 
          }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username..."
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password..."
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Memverifikasi...' : 'Masuk ke Sistem'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Demo Credentials Info */}
        <div style={{ 
          marginTop: '2rem', padding: '1rem', background: '#F8FAFC', 
          borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
          fontSize: '0.8rem', color: 'var(--text-muted)' 
        }}>
          <div style={{ fontWeight: 700, color: 'var(--navy-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <ShieldCheck size={16} color="var(--primary-orange)" /> Akun Demo Pengujian:
          </div>
          <div>Admin: <strong>admin</strong> / <strong>admin123</strong></div>
          <div>Staff Gudang: <strong>staff_gudang</strong> / <strong>staff123</strong></div>
        </div>
      </div>
    </div>
  );
}
