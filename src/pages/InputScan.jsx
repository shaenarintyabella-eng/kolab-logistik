import { useState, useEffect, useRef } from 'react';
import { 
  ScanLine, 
  Search, 
  Camera, 
  CameraOff, 
  Upload, 
  Package, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  RefreshCw, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  User,
  Warehouse
} from 'lucide-react';
import api from '../services/api';
import { useAppContext } from '../context/AppContext';

export default function InputScan() {
  const { user, showNotification, triggerRefresh } = useAppContext();

  // Data List
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Selected Item State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Camera & Scanner State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Lampiran Foto Mutasi State
  const [lampiranFile, setLampiranFile] = useState(null);
  const [lampiranPreview, setLampiranPreview] = useState(null);

  // Transaction Form State
  const [jenisMutasi, setJenisMutasi] = useState('Barang Masuk');
  const [jumlah, setJumlah] = useState('');
  const [warehouseAsalId, setWarehouseAsalId] = useState('');
  const [warehouseTujuanId, setWarehouseTujuanId] = useState('');
  const [metode, setMetode] = useState('Scan Barcode');
  const [petugas, setPetugas] = useState(user?.nama_lengkap || 'Admin Ko+Lab');
  const [catatan, setCatatan] = useState('');
  
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastSuccessTrx, setLastSuccessTrx] = useState(null);

  // Load items and warehouses on mount
  useEffect(() => {
    async function init() {
      try {
        const [itemsRes, whRes] = await Promise.all([
          api.getItems({ status: 'aktif' }),
          api.getWarehouses()
        ]);
        if (itemsRes.success) setItems(itemsRes.data);
        if (whRes.success) setWarehouses(whRes.data);
      } catch (err) {
        console.error('Gagal mengambil data:', err);
      }
    }
    init();
  }, []);

  // Set default petugas from user if available
  useEffect(() => {
    if (user?.nama_lengkap) {
      setPetugas(user.nama_lengkap);
    }
  }, [user]);

  // Handle Item Search / Barcode Scan
  const handleSearchOrScan = async (codeToSearch = null) => {
    const query = codeToSearch || searchQuery.trim();
    if (!query) {
      setFormError('Masukkan nama, SKU, atau barcode barang terlebih dahulu.');
      return;
    }

    setFormError('');
    setLoading(true);

    try {
      // 1. Coba cari spesifik berdasarkan barcode atau SKU
      try {
        const directRes = await api.searchItemByCode(query);
        if (directRes.success && directRes.data) {
          selectItem(directRes.data);
          setLoading(false);
          return;
        }
      } catch {
        // Lanjutkan ke pencarian nama jika kode tidak tepat
      }

      // 2. Pencarian umum di database
      const searchRes = await api.getItems({ search: query });
      if (searchRes.success && searchRes.data.length > 0) {
        selectItem(searchRes.data[0]);
      } else {
        setFormError(`Barang dengan kata kunci "${query}" tidak ditemukan.`);
      }
    } catch (err) {
      setFormError(err.message || 'Gagal mencari barang');
    } finally {
      setLoading(false);
    }
  };

  const selectItem = (item) => {
    setSelectedItem(item);
    setSearchQuery(`${item.nama} (${item.sku})`);
    setFormError('');
    // Sesuaikan gudang asal jika barang sudah memiliki gudang
    if (item.warehouse_id) {
      setWarehouseAsalId(item.warehouse_id);
    }
  };

  // Start Camera
  const startCamera = async () => {
    setCameraError('');
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Kamera tidak dapat diakses langsung:', err);
      setCameraError('Kamera tidak dapat diakses atau izin ditolak. Anda tetap dapat memasukkan barcode/SKU secara manual di bawah.');
      setIsCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Handle Photo Lampiran Upload
  const handleLampiranChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('File lampiran harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setFormError('Ukuran file gambar tidak boleh melebihi 3MB.');
      return;
    }

    setLampiranFile(file);
    setLampiranPreview(URL.createObjectURL(file));
    setFormError('');
  };

  // Handle Save Transaction
  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedItem) {
      setFormError('Harap pilih barang terlebih dahulu di panel kiri.');
      return;
    }

    const numJumlah = Number(jumlah);
    if (isNaN(numJumlah) || numJumlah <= 0) {
      setFormError('Jumlah mutasi harus lebih besar dari 0.');
      return;
    }

    if (jenisMutasi === 'Barang Keluar' && selectedItem.stok < numJumlah) {
      setFormError(
        `Stok tidak mencukupi untuk Barang Keluar! Stok saat ini: ${selectedItem.stok} ${selectedItem.satuan}, diminta: ${numJumlah} ${selectedItem.satuan}.`
      );
      return;
    }

    if (jenisMutasi === 'Transfer Gudang') {
      if (!warehouseAsalId || !warehouseTujuanId) {
        setFormError('Pilih Gudang Asal dan Gudang Tujuan untuk transfer stok.');
        return;
      }
      if (warehouseAsalId === warehouseTujuanId) {
        setFormError('Gudang Asal dan Gudang Tujuan tidak boleh sama.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('item_id', selectedItem.id);
      formData.append('jenis', jenisMutasi);
      formData.append('jumlah', numJumlah);
      formData.append('warehouse_asal_id', warehouseAsalId || '');
      formData.append('warehouse_tujuan_id', warehouseTujuanId || '');
      formData.append('metode', metode);
      formData.append('petugas', petugas || 'Staff Logistik');
      formData.append('catatan', catatan || '');
      if (lampiranFile) {
        formData.append('lampiran_foto', lampiranFile);
      }

      const res = await api.createMovement(formData);

      if (res.success) {
        setLastSuccessTrx(res.data);
        showNotification(res.message, 'success');
        triggerRefresh();

        // Refresh data item terpilih
        const updatedItemRes = await api.getItemById(selectedItem.id);
        if (updatedItemRes.success) {
          setSelectedItem(updatedItemRes.data);
        }

        // Reset form input
        setJumlah('');
        setCatatan('');
        setLampiranFile(null);
        setLampiranPreview(null);
      }
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan transaksi mutasi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--navy-dark)' }}>
          Input & Scan Logistik
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Pindai barcode dengan kamera atau input manual untuk mencatat mutasi stok secara aman
        </p>
      </div>

      {/* Two-Panel Layout */}
      <div className="two-panel-grid">
        {/* PANEL KIRI: SCAN & CARI BARANG */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--navy-dark)' }}>
              <ScanLine size={20} color="var(--primary-orange)" />
              Panel 1: Scan / Cari Barang
            </h3>
            <span className="badge badge-blue">Input Barcode</span>
          </div>

          {/* Scanner Viewport / Kamera */}
          <div>
            <div className="scanner-frame">
              {isCameraActive ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div className="scanner-laser"></div>
                  <div className="scanner-corner corner-tl"></div>
                  <div className="scanner-corner corner-tr"></div>
                  <div className="scanner-corner corner-bl"></div>
                  <div className="scanner-corner corner-br"></div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#94A3B8', padding: '1rem' }}>
                  <Camera size={44} style={{ margin: '0 auto 0.5rem', opacity: 0.6 }} />
                  <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Kamera Scanner Belum Aktif</p>
                  <p style={{ fontSize: '0.75rem', maxWidth: '280px', margin: '0.25rem auto' }}>
                    Nyalakan kamera jika perangkat Anda mendukung pemindaian visual langsung
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
              {!isCameraActive ? (
                <button type="button" onClick={startCamera} className="btn btn-outline btn-sm" style={{ gap: '0.35rem' }}>
                  <Camera size={16} /> Buka Kamera Scanner
                </button>
              ) : (
                <button type="button" onClick={stopCamera} className="btn btn-outline btn-sm" style={{ color: '#DC2626', gap: '0.35rem' }}>
                  <CameraOff size={16} /> Matikan Kamera
                </button>
              )}
            </div>

            {cameraError && (
              <div style={{ background: '#FEF3C7', color: '#B45309', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={15} /> {cameraError}
              </div>
            )}
          </div>

          {/* Input Manual / Barcode Search */}
          <div>
            <label className="form-label">Cari Nama Barang / Barcode / SKU</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Ketik nama atau scan barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchOrScan()}
                />
              </div>
              <button 
                type="button" 
                onClick={() => handleSearchOrScan()} 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : 'Cari'}
              </button>
            </div>
          </div>

          {/* Quick Dropdown Pilihan Barang */}
          <div>
            <label className="form-label">Atau Pilih dari Daftar Barang Aktif</label>
            <select
              className="form-select"
              value={selectedItem?.id || ''}
              onChange={(e) => {
                const itm = items.find((i) => i.id === Number(e.target.value));
                if (itm) selectItem(itm);
              }}
            >
              <option value="">-- Pilih Barang dari Database --</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nama} • Stok: {i.stok} {i.satuan} ({i.kategori_nama})
                </option>
              ))}
            </select>
          </div>

          {/* Lampiran Foto Barang / Dokumen Mutasi */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Upload size={16} /> Lampirkan Foto Barang / Surat Jalan (Opsional)
            </label>
            <input
              type="file"
              accept="image/*"
              className="form-input"
              style={{ padding: '0.45rem' }}
              onChange={handleLampiranChange}
            />
            {lampiranPreview && (
              <div style={{ marginTop: '0.75rem', position: 'relative', width: '90px', height: '90px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img src={lampiranPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => { setLampiranFile(null); setLampiranPreview(null); }}
                  style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: '50%', width: 20, height: 20, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PANEL KANAN: CATAT MUTASI STOK */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--navy-dark)' }}>
              <ArrowDownToLine size={20} color="var(--primary-orange)" />
              Panel 2: Catat Mutasi Stok
            </h3>
            <span className="badge badge-aman">Transaksi Atomic</span>
          </div>

          {/* Card Info Barang Terpilih */}
          {selectedItem ? (
            <div style={{ 
              background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF2E0 100%)', 
              border: '1.5px solid #FFD8A8', borderRadius: 'var(--radius-lg)', padding: '1.25rem' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="badge badge-blue" style={{ marginBottom: '0.35rem' }}>
                    {selectedItem.kategori_nama}
                  </span>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-dark)' }}>
                    {selectedItem.nama}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    SKU: {selectedItem.sku} • Barcode: {selectedItem.barcode || '-'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Stok Saat Ini
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-orange)' }}>
                    {Number(selectedItem.stok).toLocaleString('id-ID')} <span style={{ fontSize: '0.85rem' }}>{selectedItem.satuan}</span>
                  </div>
                  <span className={`badge badge-${selectedItem.status_stok}`}>
                    {selectedItem.status_stok.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ 
              padding: '2rem 1rem', textAlign: 'center', background: '#F8FAFC', 
              border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' 
            }}>
              <Package size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
              <p style={{ fontWeight: 600 }}>Belum Ada Barang yang Dipilih</p>
              <p style={{ fontSize: '0.8rem' }}>Gunakan pencarian atau dropdown di panel kiri untuk memilih barang.</p>
            </div>
          )}

          {/* Alert Sukses Transaksi Terakhir */}
          {lastSuccessTrx && (
            <div style={{ 
              background: 'var(--status-aman-bg)', border: '1px solid rgba(21, 128, 61, 0.3)', 
              borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' 
            }}>
              <CheckCircle2 size={24} color="#15803D" />
              <div style={{ fontSize: '0.85rem', color: '#15803D' }}>
                <strong>Transaksi Berhasil ({lastSuccessTrx.kode_transaksi})</strong>: Stok {lastSuccessTrx.nama_barang} berubah dari <strong>{lastSuccessTrx.stok_sebelum}</strong> menjadi <strong>{lastSuccessTrx.stok_sesudah}</strong>.
              </div>
            </div>
          )}

          {/* Error Message */}
          {formError && (
            <div style={{ 
              background: 'var(--status-habis-bg)', color: 'var(--status-habis-text)', 
              padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', 
              display: 'flex', alignItems: 'center', gap: '0.5rem' 
            }}>
              <AlertCircle size={18} /> {formError}
            </div>
          )}

          {/* Formulir Mutasi */}
          <form onSubmit={handleSaveTransaction}>
            <div className="grid-cols-2">
              {/* Jenis Mutasi */}
              <div className="form-group">
                <label className="form-label">Jenis Mutasi *</label>
                <select
                  className="form-select"
                  value={jenisMutasi}
                  onChange={(e) => setJenisMutasi(e.target.value)}
                  required
                >
                  <option value="Barang Masuk">Barang Masuk (+ Tambah Stok)</option>
                  <option value="Barang Keluar">Barang Keluar (- Kurang Stok)</option>
                  <option value="Penyesuaian">Penyesuaian (Opname Stok Aktual)</option>
                  <option value="Transfer Gudang">Transfer Gudang (Pindah Lokasi)</option>
                </select>
              </div>

              {/* Jumlah */}
              <div className="form-group">
                <label className="form-label">
                  Jumlah {selectedItem ? `(${selectedItem.satuan})` : ''} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  placeholder={jenisMutasi === 'Penyesuaian' ? 'Isi jumlah fisik baru...' : 'Contoh: 10'}
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Gudang Asal & Tujuan (Untuk Transfer atau Mutasi) */}
            {(jenisMutasi === 'Transfer Gudang' || jenisMutasi === 'Barang Masuk') && (
              <div className="grid-cols-2">
                {jenisMutasi === 'Transfer Gudang' && (
                  <div className="form-group">
                    <label className="form-label">Gudang Asal *</label>
                    <select
                      className="form-select"
                      value={warehouseAsalId}
                      onChange={(e) => setWarehouseAsalId(e.target.value)}
                      required
                    >
                      <option value="">-- Pilih Gudang Asal --</option>
                      {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>{w.nama}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    {jenisMutasi === 'Transfer Gudang' ? 'Gudang Tujuan *' : 'Gudang Penempatan (Opsional)'}
                  </label>
                  <select
                    className="form-select"
                    value={warehouseTujuanId}
                    onChange={(e) => setWarehouseTujuanId(e.target.value)}
                    required={jenisMutasi === 'Transfer Gudang'}
                  >
                    <option value="">-- Pilih Gudang Tujuan --</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.nama}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="grid-cols-2">
              {/* Metode */}
              <div className="form-group">
                <label className="form-label">Metode Input</label>
                <select
                  className="form-select"
                  value={metode}
                  onChange={(e) => setMetode(e.target.value)}
                >
                  <option value="Scan Barcode">Scan Barcode</option>
                  <option value="Manual">Manual</option>
                  <option value="Hasil Produksi / Dapur">Hasil Produksi / Dapur</option>
                  <option value="Penerimaan Supplier">Penerimaan Supplier</option>
                </select>
              </div>

              {/* Nama Petugas */}
              <div className="form-group">
                <label className="form-label">Nama Petugas / Operator *</label>
                <input
                  type="text"
                  className="form-input"
                  value={petugas}
                  onChange={(e) => setPetugas(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  required
                />
              </div>
            </div>

            {/* Catatan */}
            <div className="form-group">
              <label className="form-label">Catatan Transaksi</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Tuliskan keterangan pengiriman, nomor faktur, atau alasan penyesuaian..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
              disabled={submitting || !selectedItem}
            >
              {submitting ? 'Menyimpan ke Database...' : 'Simpan Transaksi Mutasi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
