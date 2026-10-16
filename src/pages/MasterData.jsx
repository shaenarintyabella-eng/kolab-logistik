import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function MasterData({ type }) {
  const { data, addGudang, updateGudang, deleteGudang, addSupplier, updateSupplier, deleteSupplier } = useAppContext();
  const isGudang = type === 'gudang';
  const list = isGudang ? data.gudang : data.supplier;
  
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nama: '', info: '' }); // info: lokasi or kontak

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = isGudang ? { nama: form.nama, lokasi: form.info } : { nama: form.nama, kontak: form.info };
    
    if (editing) {
      if (isGudang) updateGudang(editing.id, payload);
      else updateSupplier(editing.id, payload);
    } else {
      if (isGudang) addGudang(payload);
      else addSupplier(payload);
    }
    
    setShowModal(false);
    setEditing(null);
    setForm({ nama: '', info: '' });
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({ nama: item.nama, info: isGudang ? item.lokasi : item.kontak });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (isGudang) deleteGudang(id);
    else deleteSupplier(id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold" style={{ fontSize: '1.5rem' }}>Daftar {isGudang ? 'Gudang' : 'Supplier'}</h2>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); setForm({nama:'', info:''}); }}>
          <Plus size={18} /> Tambah {isGudang ? 'Gudang' : 'Supplier'}
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nama {isGudang ? 'Gudang' : 'Supplier'}</th>
                <th>{isGudang ? 'Lokasi' : 'Kontak'}</th>
                <th style={{ width: '100px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.map(item => (
                <tr key={item.id}>
                  <td className="font-semibold">{item.nama}</td>
                  <td>{isGudang ? item.lokasi : item.kontak}</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(item)} style={{ color: 'var(--accent-blue-text)' }}><Edit size={18} /></button>
                      <button onClick={() => handleDelete(item.id)} style={{ color: 'var(--accent-red-text)' }}><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center' }}>Data kosong.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '400px' }}>
            <h3 className="font-bold mb-4" style={{ fontSize: '1.25rem' }}>{editing ? 'Edit' : 'Tambah'} {isGudang ? 'Gudang' : 'Supplier'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama</label>
                <input type="text" className="form-input" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">{isGudang ? 'Lokasi' : 'Kontak'}</label>
                <input type="text" className="form-input" value={form.info} onChange={e => setForm({...form, info: e.target.value})} required />
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
