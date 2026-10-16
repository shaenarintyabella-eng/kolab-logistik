import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export default function TransaksiForm({ jenis }) {
  const { data, addTransaksi } = useAppContext();
  const navigate = useNavigate();
  const [form, setForm] = useState({ barangId: '', jumlah: '' });
  const [error, setError] = useState('');

  const isMasuk = jenis === 'masuk';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.barangId || !form.jumlah) {
      setError('Harap lengkapi semua field');
      return;
    }

    const result = addTransaksi({ ...form, jenis });
    if (result.success) {
      navigate('/laporan');
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="flex items-center gap-3 mb-6">
        <div style={{ padding: '0.75rem', background: isMasuk ? 'var(--accent-blue-bg)' : 'var(--accent-red-bg)', color: isMasuk ? 'var(--accent-blue-text)' : 'var(--accent-red-text)', borderRadius: '0.5rem' }}>
          {isMasuk ? <ArrowDownToLine size={24} /> : <ArrowUpFromLine size={24} />}
        </div>
        <h2 className="font-bold" style={{ fontSize: '1.5rem' }}>
          Form Barang {isMasuk ? 'Masuk' : 'Keluar'}
        </h2>
      </div>

      <div className="card">
        {error && <div style={{ background: 'var(--accent-red-bg)', color: 'var(--accent-red-text)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Pilih Barang</label>
            <select className="form-input" value={form.barangId} onChange={e => setForm({...form, barangId: e.target.value})} required>
              <option value="">-- Pilih Barang --</option>
              {data.barang.map(b => (
                <option key={b.id} value={b.id}>{b.nama} (Stok: {b.stok})</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Jumlah</label>
            <input type="number" className="form-input" value={form.jumlah} onChange={e => setForm({...form, jumlah: e.target.value})} required min="1" placeholder="Masukkan jumlah..." />
          </div>

          <div className="flex justify-end mt-6">
            <button type="submit" className="btn btn-primary w-full">
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
