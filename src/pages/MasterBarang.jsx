import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  X, 
  AlertCircle,
  Warehouse,
  Truck,
  Barcode,
  Layers
} from 'lucide-react';
import api from '../services/api';
import { useAppContext } from '../context/AppContext';

export default function MasterBarang() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showNotification, triggerRefresh } = useAppContext();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category_id') || '');
  const [warehouseId, setWarehouseId] = useState(searchParams.get('warehouse_id') || '');
  const [stockStatus, setStockStatus] = useState(searchParams.get('stock_status') || '');

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialFormState = {
    sku: '',
    barcode: '',
    nama: '',
    category_id: '',
    satuan: 'porsi',
    stok: 0,
    min_stok: 10,
    batas_kritis: 5,
    status: 'aktif',
    warehouse_id: '',
    supplier_id: ''
  };
  const [form, setForm] = useState(initialFormState);
  const [fotoFile, setFotoFile] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsRes, catsRes, whRes, supRes] = await Promise.all([
        api.getItems({
          search,
          category_id: categoryId,
          warehouse_id: warehouseId,
          stock_status: stockStatus
        }),
        api.getCategories(),
        api.getWarehouses(),
        api.getSuppliers()
      ]);

      if (itemsRes.success) setItems(itemsRes.data);
      if (catsRes.success) setCategories(catsRes.data);
      if (whRes.success) setWarehouses(whRes.data);
      if (supRes.success) setSuppliers(supRes.data);
    } catch (err) {
      console.error('Gagal memuat data master barang:', err);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, categoryId, warehouseId, stockStatus]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm(initialFormState);
    setFotoFile(null);
    setFormError('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      sku: item.sku,
      barcode: item.barcode || '',
      nama: item.nama,
      category_id: item.category_id || '',
      satuan: item.satuan,
      stok: item.stok,
      min_stok: item.min_stok,
      batas_kritis: item.batas_kritis,
      status: item.status,
      warehouse_id: item.warehouse_id || '',
      supplier_id: item.supplier_id || ''
    });
    setFotoFile(null);
    setFormError('');
    setShowFormModal(true);
  };

  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        formData.append(key, form[key] !== null ? form[key] : '');
      });
      if (fotoFile) {
        formData.append('foto', fotoFile);
      }

      if (editingItem) {
        await api.updateItem(editingItem.id, formData);
        showNotification(`Barang '${form.nama}' berhasil diperbarui!`, 'success');
      } else {
        await api.createItem(formData);
        showNotification(`Barang '${form.nama}' berhasil ditambahkan ke database!`, 'success');
      }

      setShowFormModal(false);
      triggerRefresh();
      loadData();
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan barang');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    try {
      setSubmitting(true);
      await api.deleteItem(selectedItem.id);
      showNotification(`Barang '${selectedItem.nama}' berhasil dihapus.`, 'success');
      setShowDeleteModal(false);
      triggerRefresh();
      loadData();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCategoryId('');
    setWarehouseId('');
    setStockStatus('');
    setSearchParams({});
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--navy-dark)' }}>
            Master Barang & Logistik
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Katalog bahan baku F&B, resep, retail, dan pengaturan stok batas kritis
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={18} /> Tambah Barang Baru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card mb-6" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Cari nama, SKU, atau barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Kategori Filter */}
          <select 
            className="form-select" 
            value={categoryId} 
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nama} ({c.tipe})</option>
            ))}
          </select>

          {/* Gudang Filter */}
          <select 
            className="form-select" 
            value={warehouseId} 
            onChange={(e) => setWarehouseId(e.target.value)}
          >
            <option value="">Semua Gudang</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.nama}</option>
            ))}
          </select>

          {/* Status Stok Filter */}
          <select 
            className="form-select" 
            value={stockStatus} 
            onChange={(e) => setStockStatus(e.target.value)}
          >
            <option value="">Semua Status Stok</option>
            <option value="aman">Aman</option>
            <option value="menipis">Menipis</option>
            <option value="kritis">Kritis</option>
            <option value="habis">Habis</option>
            <option value="perlu_dibeli">Perlu Dibeli</option>
          </select>

          {/* Reset button */}
          {(search || categoryId || warehouseId || stockStatus) && (
            <button onClick={resetFilters} className="btn btn-outline btn-sm" title="Reset Filter">
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Tabel Data Barang */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Barang</th>
                <th>SKU / Barcode</th>
                <th>Kategori</th>
                <th>Stok Saat Ini</th>
                <th>Batas (Min / Kritis)</th>
                <th>Gudang</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          width: 40, height: 40, borderRadius: 'var(--radius-md)', 
                          background: 'var(--primary-orange-light)', color: 'var(--primary-orange)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 
                        }}>
                          <Package size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>{item.nama}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ID #{item.id} • Satuan: {item.satuan}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.sku}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.barcode || '-'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-blue">
                        {item.kategori_nama || 'Retail'}
                      </span>
                    </td>
                    <td>
                      <div style={{ 
                        fontSize: '1rem', fontWeight: 800, 
                        color: item.status_stok === 'habis' ? '#DC2626' : item.status_stok === 'kritis' ? '#EA580C' : item.status_stok === 'menipis' ? '#D97706' : '#15803D' 
                      }}>
                        {Number(item.stok).toLocaleString('id-ID')} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{item.satuan}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Min: <strong>{Number(item.min_stok).toLocaleString('id-ID')}</strong> • Kritis: <strong>{Number(item.batas_kritis).toLocaleString('id-ID')}</strong>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {item.warehouse_nama || '-'}
                    </td>
                    <td>
                      <span className={`badge badge-${item.status_stok}`}>
                        {item.status_stok === 'habis' ? 'Habis' : item.status_stok === 'kritis' ? 'Kritis' : item.status_stok === 'menipis' ? 'Menipis' : 'Aman'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <button 
                          onClick={() => handleOpenDetail(item)}
                          className="btn btn-outline btn-sm" 
                          title="Lihat Detail"
                          style={{ padding: '0.35rem 0.5rem' }}
                        >
                          <Eye size={15} color="var(--accent-blue)" />
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(item)}
                          className="btn btn-outline btn-sm" 
                          title="Edit Barang"
                          style={{ padding: '0.35rem 0.5rem' }}
                        >
                          <Edit size={15} color="#D97706" />
                        </button>
                        <button 
                          onClick={() => handleOpenDelete(item)}
                          className="btn btn-outline btn-sm" 
                          title="Hapus Barang"
                          style={{ padding: '0.35rem 0.5rem' }}
                        >
                          <Trash2 size={15} color="#DC2626" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <Package size={42} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Tidak ada data barang ditemukan</p>
                    <p style={{ fontSize: '0.85rem' }}>Coba ubah kata kunci pencarian atau reset filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT BARANG */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-dark)' }}>
                {editingItem ? 'Edit Data Barang' : 'Tambah Barang Baru'}
              </h3>
              <button onClick={() => setShowFormModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ background: 'var(--status-habis-bg)', color: 'var(--status-habis-text)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleSubmitForm}>
              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">SKU / Kode Barang *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="Contoh: BRG-FNB-010"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Barcode (Opsional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.barcode}
                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    placeholder="Contoh: 899100100010"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nama Barang *</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Contoh: Daging Sapi Cincang Premium"
                  required
                />
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Kategori *</label>
                  <select
                    className="form-select"
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    required
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nama} ({c.tipe})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Satuan *</label>
                  <select
                    className="form-select"
                    value={form.satuan}
                    onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                    required
                  >
                    <option value="porsi">porsi</option>
                    <option value="biji">biji</option>
                    <option value="gram">gram</option>
                    <option value="kg">kg</option>
                    <option value="liter">liter</option>
                    <option value="botol">botol</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>
              </div>

              <div className="grid-cols-3">
                <div className="form-group">
                  <label className="form-label">Stok {editingItem ? 'Sekarang' : 'Awal'}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={form.stok}
                    onChange={(e) => setForm({ ...form, stok: e.target.value })}
                    disabled={!!editingItem} // Jika edit, stok diubah via mutasi
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stok Minimum</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={form.min_stok}
                    onChange={(e) => setForm({ ...form, min_stok: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Batas Kritis</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    value={form.batas_kritis}
                    onChange={(e) => setForm({ ...form, batas_kritis: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Gudang Penyimpanan</label>
                  <select
                    className="form-select"
                    value={form.warehouse_id}
                    onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })}
                  >
                    <option value="">-- Pilih Gudang --</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.nama}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Supplier Rekanan</label>
                  <select
                    className="form-select"
                    value={form.supplier_id}
                    onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                  >
                    <option value="">-- Pilih Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Status Barang</label>
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Foto / Gambar (Maks 3MB)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-input"
                    style={{ padding: '0.45rem' }}
                    onChange={(e) => setFotoFile(e.target.files[0] || null)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowFormModal(false)} className="btn btn-outline">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Simpan Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETAIL BARANG */}
      {showDetailModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Detail Informasi Barang</h3>
              <button onClick={() => setShowDetailModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--primary-orange-light)', color: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={28} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedItem.nama}</h4>
                  <span className={`badge badge-${selectedItem.status_stok}`}>
                    Status Stok: {selectedItem.status_stok.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid-cols-2" style={{ fontSize: '0.875rem' }}>
                <div><strong>SKU:</strong> {selectedItem.sku}</div>
                <div><strong>Barcode:</strong> {selectedItem.barcode || '-'}</div>
                <div><strong>Kategori:</strong> {selectedItem.kategori_nama}</div>
                <div><strong>Satuan:</strong> {selectedItem.satuan}</div>
                <div><strong>Stok Aktual:</strong> {selectedItem.stok} {selectedItem.satuan}</div>
                <div><strong>Stok Minimum:</strong> {selectedItem.min_stok} {selectedItem.satuan}</div>
                <div><strong>Batas Kritis:</strong> {selectedItem.batas_kritis} {selectedItem.satuan}</div>
                <div><strong>Status Aktif:</strong> {selectedItem.status === 'aktif' ? 'Aktif' : 'Nonaktif'}</div>
                <div><strong>Gudang:</strong> {selectedItem.warehouse_nama || '-'}</div>
                <div><strong>Supplier:</strong> {selectedItem.supplier_nama || '-'}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button onClick={() => setShowDetailModal(false)} className="btn btn-outline">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {showDeleteModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '450px' }}>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--status-habis-bg)', color: 'var(--status-habis-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Trash2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Hapus Barang?</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Apakah Anda yakin ingin menghapus <strong>{selectedItem.nama}</strong> ({selectedItem.sku})? 
                Data dengan riwayat mutasi atau resep tidak akan dapat dihapus demi integritas data.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }}>
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline">
                Batal
              </button>
              <button onClick={handleConfirmDelete} className="btn btn-danger" disabled={submitting}>
                {submitting ? 'Menghapus...' : 'Ya, Hapus Barang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
