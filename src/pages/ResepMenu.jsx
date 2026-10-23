import { useState, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  Calculator, 
  Layers,
  X,
  AlertCircle,
  Eye,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { useAppContext } from '../context/AppContext';

export default function ResepMenu() {
  const { showNotification, triggerRefresh } = useAppContext();

  const [menus, setMenus] = useState([]);
  const [items, setItems] = useState([]); // Daftar bahan baku dari Master Barang
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialForm = {
    kode_menu: '',
    nama_menu: '',
    kategori: 'Makanan',
    status_manual: 'aktif',
    deskripsi: '',
    harga: 0
  };
  const [form, setForm] = useState(initialForm);
  const [ingredients, setIngredients] = useState([]);

  // Simulator Porsi State
  const [simulasiPorsi, setSimulasiPorsi] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const [menuRes, itemsRes] = await Promise.all([
        api.getMenus({ search, kategori: kategoriFilter }),
        api.getItems({ status: 'aktif' })
      ]);
      if (menuRes.success) setMenus(menuRes.data);
      if (itemsRes.success) setItems(itemsRes.data);
    } catch (err) {
      console.error('Gagal memuat data menu resep:', err);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, kategoriFilter]);

  const handleOpenAdd = () => {
    setEditingMenu(null);
    setForm(initialForm);
    setIngredients([{ item_id: '', jumlah_per_porsi: '', satuan: 'gram' }]);
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (menu) => {
    setEditingMenu(menu);
    setForm({
      kode_menu: menu.kode_menu,
      nama_menu: menu.nama_menu,
      kategori: menu.kategori,
      status_manual: menu.status_manual,
      deskripsi: menu.deskripsi || '',
      harga: menu.harga || 0
    });
    setIngredients(
      menu.resep && menu.resep.length > 0
        ? menu.resep.map((r) => ({
            item_id: r.item_id,
            jumlah_per_porsi: r.jumlah_per_porsi,
            satuan: r.satuan
          }))
        : [{ item_id: '', jumlah_per_porsi: '', satuan: 'gram' }]
    );
    setFormError('');
    setShowModal(true);
  };

  const handleOpenDetail = (menu) => {
    setSelectedMenu(menu);
    setSimulasiPorsi(1);
    setShowDetailModal(true);
  };

  // Tambah baris bahan baku
  const handleAddIngredientRow = () => {
    setIngredients([...ingredients, { item_id: '', jumlah_per_porsi: '', satuan: 'gram' }]);
  };

  // Hapus baris bahan baku
  const handleRemoveIngredientRow = (index) => {
    setIngredients(ingredients.filter((_, idx) => idx !== index));
  };

  // Update baris bahan
  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    if (field === 'item_id') {
      const itm = items.find((i) => i.id === Number(value));
      if (itm) {
        updated[index].satuan = itm.satuan;
      }
    }
    setIngredients(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      // Filter hanya bahan baku yang valid
      const validIngredients = ingredients.filter(
        (ing) => ing.item_id && Number(ing.jumlah_per_porsi) > 0
      );

      const payload = new FormData();
      payload.append('kode_menu', form.kode_menu);
      payload.append('nama_menu', form.nama_menu);
      payload.append('kategori', form.kategori);
      payload.append('status_manual', form.status_manual);
      payload.append('deskripsi', form.deskripsi);
      payload.append('harga', form.harga);
      payload.append('ingredients', JSON.stringify(validIngredients));

      if (editingMenu) {
        await api.updateMenu(editingMenu.id, payload);
        showNotification(`Resep menu '${form.nama_menu}' berhasil diperbarui!`, 'success');
      } else {
        await api.createMenu(payload);
        showNotification(`Resep menu '${form.nama_menu}' berhasil dibuat!`, 'success');
      }

      setShowModal(false);
      triggerRefresh();
      loadData();
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan resep menu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Hapus resep menu "${nama}"?`)) return;
    try {
      await api.deleteMenu(id);
      showNotification(`Menu "${nama}" berhasil dihapus.`, 'success');
      triggerRefresh();
      loadData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--navy-dark)' }}>
            Katalog Resep & Komposisi Menu
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Kalkulasi otomatis kapasitas porsi maksimal berdasarkan stok riil bahan baku di MySQL
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} /> Buat Resep Menu Baru
        </button>
      </div>

      {/* Filter & Pencarian */}
      <div className="card mb-6" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Cari nama menu atau kode menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="form-select"
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            <option value="Makanan">Makanan</option>
            <option value="Minuman">Minuman</option>
          </select>
        </div>
      </div>

      {/* Daftar Resep Menu Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {menus.length > 0 ? (
          menus.map((menu) => (
            <div 
              key={menu.id} 
              className="card"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-blue">{menu.kategori}</span>
                  <span className={`badge badge-${menu.status_ketersediaan === 'tersedia' ? 'aman' : menu.status_ketersediaan === 'menipis' ? 'menipis' : 'habis'}`}>
                    {menu.status_ketersediaan === 'tersedia' ? 'Siap Disajikan' : menu.status_ketersediaan === 'menipis' ? 'Bahan Menipis' : menu.status_ketersediaan === 'nonaktif_manual' ? 'Nonaktif Manual' : 'Stok Bahan Habis'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-dark)', marginBottom: '0.25rem' }}>
                  {menu.nama_menu}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Kode: <strong>{menu.kode_menu}</strong> • Harga: <strong>Rp {Number(menu.harga).toLocaleString('id-ID')}</strong>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginBottom: '1.25rem', minHeight: '38px', lineHeight: 1.4 }}>
                  {menu.deskripsi || 'Tidak ada deskripsi resep.'}
                </p>

                {/* Box Perhitungan Kapasitas Porsi */}
                <div style={{ 
                  background: '#F8FAFC', border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1rem' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Kapasitas Maksimal:
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: menu.kapasitas_maksimal_porsi > 0 ? 'var(--primary-orange)' : '#DC2626' }}>
                      {menu.kapasitas_maksimal_porsi} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Porsi</span>
                    </div>
                  </div>

                  {menu.bottleneck && (
                    <div style={{ fontSize: '0.75rem', color: '#B45309', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertTriangle size={13} />
                      Batas stok ditentukan oleh: <strong>{menu.bottleneck.item_nama}</strong> ({menu.bottleneck.item_stok} {menu.bottleneck.satuan})
                    </div>
                  )}
                </div>

                {/* Komposisi Bahan Preview */}
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Komposisi Bahan ({menu.resep ? menu.resep.length : 0} Item):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                  {menu.resep && menu.resep.slice(0, 3).map((ing, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.25rem 0', borderBottom: '1px dashed #E2E8F0' }}>
                      <span>{ing.item_nama}</span>
                      <span style={{ fontWeight: 600 }}>{ing.jumlah_per_porsi} {ing.satuan} / porsi</span>
                    </div>
                  ))}
                  {menu.resep && menu.resep.length > 3 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                      +{menu.resep.length - 3} bahan lainnya...
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                <button 
                  onClick={() => handleOpenDetail(menu)} 
                  className="btn btn-outline btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  <Eye size={15} /> Detail & Kalkulator
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleOpenEdit(menu)} 
                    className="btn btn-outline btn-sm" 
                    title="Edit Resep"
                  >
                    <Edit size={15} color="#D97706" />
                  </button>
                  <button 
                    onClick={() => handleDelete(menu.id, menu.nama_menu)} 
                    className="btn btn-outline btn-sm" 
                    title="Hapus Menu"
                  >
                    <Trash2 size={15} color="#DC2626" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem', background: 'white', borderRadius: 'var(--radius-lg)' }}>
            <UtensilsCrossed size={48} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            <p style={{ fontWeight: 600, fontSize: '1rem' }}>Belum ada resep menu terdaftar</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Klik tombol "Buat Resep Menu Baru" untuk menambahkan resep masakan atau minuman.</p>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT RESEP MENU */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingMenu ? 'Edit Resep Menu' : 'Tambah Resep Menu Baru'}
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
                  <label className="form-label">Kode Menu *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: MN-010"
                    value={form.kode_menu}
                    onChange={(e) => setForm({ ...form, kode_menu: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select
                    className="form-select"
                    value={form.kategori}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                  >
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nama Menu *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Mie Ayam Spesial Ko+Lab"
                  value={form.nama_menu}
                  onChange={(e) => setForm({ ...form, nama_menu: e.target.value })}
                  required
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={form.harga}
                    onChange={(e) => setForm({ ...form, harga: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status Menu</label>
                  <select
                    className="form-select"
                    value={form.status_manual}
                    onChange={(e) => setForm({ ...form, status_manual: e.target.value })}
                  >
                    <option value="aktif">Aktif (Bisa Dipesan)</option>
                    <option value="nonaktif">Nonaktif Manual</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi Menu</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Deskripsi cita rasa atau penyajian..."
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                />
              </div>

              {/* Komposisi Bahan Baku Per 1 Porsi */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Komposisi Bahan Baku (Kebutuhan Per 1 Porsi)
                  </label>
                  <button 
                    type="button" 
                    onClick={handleAddIngredientRow} 
                    className="btn btn-outline btn-sm"
                    style={{ gap: '0.25rem', color: 'var(--primary-orange)' }}
                  >
                    <Plus size={14} /> Tambah Bahan
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {ingredients.map((ing, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                      <select
                        className="form-select"
                        value={ing.item_id}
                        onChange={(e) => handleIngredientChange(idx, 'item_id', e.target.value)}
                        required
                      >
                        <option value="">-- Pilih Bahan Baku --</option>
                        {items.map((itm) => (
                          <option key={itm.id} value={itm.id}>
                            {itm.nama} (Stok: {itm.stok} {itm.satuan})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="form-input"
                        placeholder="Qty / porsi"
                        value={ing.jumlah_per_porsi}
                        onChange={(e) => handleIngredientChange(idx, 'jumlah_per_porsi', e.target.value)}
                        required
                      />

                      <input
                        type="text"
                        className="form-input"
                        placeholder="Satuan"
                        value={ing.satuan}
                        readOnly
                        style={{ background: '#F1F5F9' }}
                      />

                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredientRow(idx)}
                          style={{ color: '#DC2626', padding: '0.5rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Resep Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL & KALKULATOR PORSI */}
      {showDetailModal && selectedMenu && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Detail & Simulasi Resep</h3>
              <button onClick={() => setShowDetailModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-dark)' }}>{selectedMenu.nama_menu}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedMenu.deskripsi}</p>
              <div style={{ marginTop: '0.5rem', fontWeight: 700, color: 'var(--primary-orange)' }}>
                Kapasitas Maksimal Saat Ini: {selectedMenu.kapasitas_maksimal_porsi} Porsi
              </div>
            </div>

            {/* Interactive Calculator: Hitung Kebutuhan Bahan Berdasarkan Jumlah Porsi */}
            <div style={{ border: '1.5px solid var(--primary-orange-light)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem', background: '#FFFDF9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--navy-dark)' }}>
                <Calculator size={18} color="var(--primary-orange)" />
                Simulasi Kebutuhan Produksi
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Rencana Jumlah Porsi:</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  className="form-input"
                  style={{ width: '120px' }}
                  value={simulasiPorsi}
                  onChange={(e) => setSimulasiPorsi(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>

              {/* Tabel Kebutuhan vs Ketersediaan */}
              <div className="table-container">
                <table style={{ fontSize: '0.825rem' }}>
                  <thead>
                    <tr>
                      <th>Bahan</th>
                      <th>Butuh ({simulasiPorsi} Porsi)</th>
                      <th>Stok Ada</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMenu.resep && selectedMenu.resep.map((r, i) => {
                      const butuhTotal = Number(r.jumlah_per_porsi) * simulasiPorsi;
                      const cukup = r.item_stok >= butuhTotal;
                      return (
                        <tr key={i}>
                          <td><strong>{r.item_nama}</strong></td>
                          <td>{butuhTotal} {r.satuan}</td>
                          <td>{r.item_stok} {r.satuan}</td>
                          <td>
                            <span className={`badge ${cukup ? 'badge-aman' : 'badge-habis'}`}>
                              {cukup ? 'Mencukupi' : 'Kurang'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDetailModal(false)} className="btn btn-outline">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
