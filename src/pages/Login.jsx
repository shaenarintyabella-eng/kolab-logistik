import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/');
    } else {
      setError('Username atau password salah (gunakan admin/admin123)');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-orange)' }}>
      <div className="card" style={{ width: '400px', padding: '2.5rem' }}>
        <h1 style={{ textAlign: 'center', color: 'var(--primary-orange)', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Ko+Lab</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-gray)', marginBottom: '2rem' }}>Login ke sistem logistik</p>
        
        {error && <div style={{ background: 'var(--accent-red-bg)', color: 'var(--accent-red-text)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-input" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              placeholder="Masukkan username..."
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="Masukkan password..."
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem', padding: '0.75rem' }}>
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
