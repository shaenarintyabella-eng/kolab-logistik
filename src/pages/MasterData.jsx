import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Warehouse, Truck, X, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAppContext } from '../context/AppContext';

export default function MasterData({ type }) {
  const { showNotification } = useAppContext();
  const isGudang = type === 'gudang';

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const initialForm = isGudang 
    ? { kode: '', nama: '', lokasi: '', keterangan: '' }
    : { kode: '', nama: '', kontak: '', telepon: '', alamat: '' };

  const [form, setForm] = useState(initialForm);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = isGudang ? await api.getWarehouses() : await api.getSuppliers();
      if (res.success) setList(res.data);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setForm(initialForm);
  }, [type]);

  const handleOpenAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditing(item);
    setForm(item);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (isGudang) {
        if (editing) await api.updateWarehouse(editing.id, form);
        else await api.createWarehouse(form);
      } else {
        if (editing) await api.updateSupplier(editing.id, form);
        else await api.createSupplier(form);
      }

      showNotification(`Data ${isGudang ? 'Gudang' : 'Supplier'} berhasil disimpan!`, 'success');
      setShowModal(false);
      loadData();
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Hapus ${isGudang ? 'Gudang' : 'Supplier'} "${nama}"?`)) return;
    try {
      if (isGudang) await api.deleteWarehouse(id);
      else await api.deleteSupplier(id);
      showNotification(`Data berhasil dihapus`, 'success');
      loadData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--navy-dark)' }}>
            Kelola {isGudang ? 'Gudang Penyimpanan' : 'Supplier Rekanan'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isGudang ? 'Daftar gudang logistik, cold storage, dan area display retail' : 'Daftar vendor penyedia bahan baku dan barang retail'}
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} /> Tambah {isGudang ? 'Gudang' : 'Supplier'}
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama {isGudang ? 'Gudang' : 'Supplier'}</th>
                <th>{isGudang ? 'Lokasi' : 'Kontak Person'}</th>
                <th>{isGudang ? 'Keterangan' : 'Telepon / Alamat'}</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.length > 0 ? (
                list.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '0.85rem' }}>{item.kode}</td>
                    <td style={{ fontWeight: 700 }}>{item.nama}</td>
                    <td>{isGudang ? item.lokasi : item.kontak || '-'}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {isGudang ? item.keterangan || '-' : `${item.telepon || '-'} • ${item.alamat || '-'}`}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button onClick={() => handleOpenEdit(item)} className="btn btn-outline btn-sm">
                          <Edit size={15} color="#D97706" />
                        </button>
                        <button onClick={() => handleDelete(item.id, item.nama)} className="btn btn-outline btn-sm">
                          <Trash2 size={15} color="#DC2626" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    Data {isGudang ? 'gudang' : 'supplier'} masih kosong di database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editing ? 'Edit' : 'Tambah'} {isGudang ? 'Gudang' : 'Supplier'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ background: 'var(--status-habis-bg)', color: 'var(--status-habis-text)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Kode *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={isGudang ? 'GDG-001' : 'SPL-001'}
                    value={form.kode}
                    onChange={(e) => setForm({ ...form, kode: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nama *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    required
                  />
                </div>
              </div>

              {isGudang ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Lokasi *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.lokasi}
                      onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Keterangan</label>
                    <textarea
                      className="form-textarea"
                      rows="2"
                      value={form.keterangan || ''}
                      onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid-cols-2">
                    <div className="form-group">
                      <label className="form-label">Kontak Person</label>
                      <input
                        type="text"
                        className="form-input"
                        value={form.kontak || ''}
                        onChange={(e) => setForm({ ...form, kontak: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nomor Telepon</label>
                      <input
                        type="text"
                        className="form-input"
                        value={form.telepon || ''}
                        onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Alamat</label>
                    <textarea
                      className="form-textarea"
                      rows="2"
                      value={form.alamat || ''}
                      onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
