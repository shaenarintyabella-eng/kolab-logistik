import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function Barang() {
  const { data, addBarang, updateBarang, deleteBarang } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  
  const [form, setForm] = useState({
    kode: '',
    nama: '',
    jenis: 'F&B',
    stok: 0,
    minStok: 10
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      updateBarang(editing.id, form);
    } else {
      addBarang(form);
    }
    setShowModal(false);
    setEditing(null);
    setForm({ kode: '', nama: '', jenis: 'F&B', stok: 0, minStok: 10 });
  };

  const handleEdit = (b) => {
    setEditing(b);
    setForm({ kode: b.kode, nama: b.nama, jenis: b.jenis, stok: b.stok, minStok: b.minStok });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold" style={{ fontSize: '1.5rem' }}>Daftar Barang</h2>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <Plus size={18} /> Tambah Barang
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Barang</th>
                <th>Jenis</th>
                <th>Stok</th>
                <th>Min. Stok</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.barang.map(b => (
                <tr key={b.id}>
                  <td className="font-medium text-gray">{b.kode}</td>
                  <td className="font-semibold">{b.nama}</td>
                  <td>{b.jenis}</td>
                  <td className="font-bold">{b.stok}</td>
                  <td>{b.minStok}</td>
                  <td>
                    {b.stok <= b.minStok ? (
                      <span className="badge badge-danger">Menipis</span>
                    ) : (
                      <span className="badge badge-success">Aman</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(b)} style={{ color: 'var(--accent-blue-text)' }}><Edit size={18} /></button>
                      <button onClick={() => deleteBarang(b.id)} style={{ color: 'var(--accent-red-text)' }}><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.barang.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center' }}>Belum ada data barang.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '500px' }}>
            <h3 className="font-bold mb-4" style={{ fontSize: '1.25rem' }}>{editing ? 'Edit Barang' : 'Tambah Barang'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Kode Barang</label>
                <input type="text" className="form-input" value={form.kode} onChange={e => setForm({...form, kode: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Nama Barang</label>
                <input type="text" className="form-input" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Jenis</label>
                <select className="form-input" value={form.jenis} onChange={e => setForm({...form, jenis: e.target.value})}>
                  <option value="F&B">F&B</option>
                  <option value="Retail">Retail</option>
                </select>
              </div>
              <div className="grid-cols-2 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label">Stok Awal</label>
                  <input type="number" className="form-input" value={form.stok} onChange={e => setForm({...form, stok: e.target.value})} required min="0" disabled={!!editing} />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Min. Stok</label>
                  <input type="number" className="form-input" value={form.minStok} onChange={e => setForm({...form, minStok: e.target.value})} required min="0" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
