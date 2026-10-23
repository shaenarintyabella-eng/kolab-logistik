import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Slash, 
  Search, 
  Eye, 
  ToggleLeft, 
  ToggleRight, 
  UtensilsCrossed, 
  AlertTriangle,
  RefreshCw,
  X
} from 'lucide-react';
import api from '../services/api';
import { useAppContext } from '../context/AppContext';

export default function Ketersediaan() {
  const { showNotification, triggerRefresh } = useAppContext();

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedMenu, setSelectedMenu] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getMenus({
        search,
        kategori: kategoriFilter,
        status_filter: statusFilter
      });
      if (res.success) {
        setMenus(res.data);
      }
    } catch (err) {
      console.error('Gagal memuat status ketersediaan:', err);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, kategoriFilter, statusFilter]);

  // Hitung angka ringkasan
  const total = menus.length;
  const tersedia = menus.filter((m) => m.status_ketersediaan === 'tersedia').length;
  const nonaktifManual = menus.filter((m) => m.status_manual === 'nonaktif').length;
  const stokHabis = menus.filter((m) => m.status_ketersediaan === 'stok_habis').length;

  // Toggle Aktif / Nonaktif Manual di MySQL
  const handleToggleManual = async (menu) => {
    const newStatus = menu.status_manual === 'aktif' ? 'nonaktif' : 'aktif';
    try {
      await api.toggleMenuStatus(menu.id, newStatus);
      showNotification(
        `Menu '${menu.nama_menu}' kini berstatus: ${newStatus === 'aktif' ? 'Aktif' : 'Nonaktif Manual'}`,
        'success'
      );
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
            Ketersediaan Menu & Logistik F&B
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Pantau status ketersediaan menu berdasarkan kesiapan stok bahan resep dan sakelar kontrol manual
          </p>
        </div>
        <button onClick={loadData} className="btn btn-outline" title="Refresh">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Segarkan
        </button>
      </div>

      {/* 4 Card Ringkasan Ketersediaan */}
      <div className="grid-cols-4 mb-6">
        <div className="card" onClick={() => setStatusFilter('')} style={{ cursor: 'pointer', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Menu</span>
            <UtensilsCrossed size={18} color="var(--navy-dark)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy-dark)' }}>{total}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Semua item terdaftar</div>
        </div>

        <div className="card" onClick={() => setStatusFilter('tersedia')} style={{ cursor: 'pointer', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tersedia (Ready)</span>
            <CheckCircle2 size={18} color="#16A34A" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16A34A' }}>{tersedia}</div>
          <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '0.25rem' }}>Bahan cukup & aktif</div>
        </div>

        <div className="card" onClick={() => setStatusFilter('nonaktif_manual')} style={{ cursor: 'pointer', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Nonaktif Manual</span>
            <Slash size={18} color="#64748B" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#64748B' }}>{nonaktifManual}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>Dimatikan oleh manajer</div>
        </div>

        <div className="card" onClick={() => setStatusFilter('stok_habis')} style={{ cursor: 'pointer', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Stok Bahan Habis</span>
            <XCircle size={18} color="#DC2626" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#DC2626' }}>{stokHabis}</div>
          <div style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem' }}>Otomatis sold out</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card mb-6" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Cari menu atau kode..."
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

          <select 
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="tersedia">Tersedia</option>
            <option value="menipis">Bahan Menipis</option>
            <option value="stok_habis">Stok Habis</option>
            <option value="nonaktif_manual">Nonaktif Manual</option>
          </select>

          {(search || kategoriFilter || statusFilter) && (
            <button onClick={() => { setSearch(''); setKategoriFilter(''); setStatusFilter(''); }} className="btn btn-outline btn-sm">
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Tabel Ketersediaan */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Menu</th>
                <th>Kategori</th>
                <th>Kapasitas Porsi</th>
                <th>Status Ketersediaan</th>
                <th>Sakelar Manual</th>
                <th>Status Resep Bahan</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {menus.length > 0 ? (
                menus.map((menu) => (
                  <tr key={menu.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>{menu.nama_menu}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kode: {menu.kode_menu} • Rp {Number(menu.harga).toLocaleString('id-ID')}</div>
                    </td>
                    <td>
                      <span className="badge badge-blue">{menu.kategori}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: menu.kapasitas_maksimal_porsi > 0 ? 'var(--primary-orange)' : '#DC2626' }}>
                        {menu.kapasitas_maksimal_porsi} Porsi
                      </div>
                    </td>
                    <td>
                      {menu.status_manual === 'nonaktif' ? (
                        <span className="badge badge-nonaktif">Nonaktif Manual</span>
                      ) : menu.status_ketersediaan === 'stok_habis' ? (
                        <span className="badge badge-habis">Stok Bahan Habis</span>
                      ) : menu.status_ketersediaan === 'menipis' ? (
                        <span className="badge badge-menipis">Bahan Menipis</span>
                      ) : (
                        <span className="badge badge-aman">Tersedia</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleManual(menu)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: menu.status_manual === 'aktif' ? '#DCFCE7' : '#F1F5F9',
                          color: menu.status_manual === 'aktif' ? '#15803D' : '#64748B',
                          border: `1px solid ${menu.status_manual === 'aktif' ? '#86EFAC' : '#CBD5E1'}`
                        }}
                        title={menu.status_manual === 'aktif' ? 'Klik untuk menonaktifkan manual' : 'Klik untuk mengaktifkan manual'}
                      >
                        {menu.status_manual === 'aktif' ? (
                          <>
                            <ToggleRight size={18} color="#16A34A" /> Aktif
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={18} color="#64748B" /> Nonaktif
                          </>
                        )}
                      </button>
                    </td>
                    <td>
                      {menu.bottleneck ? (
                        <div style={{ fontSize: '0.75rem', color: '#B45309' }}>
                          Dibatasi: <strong>{menu.bottleneck.item_nama}</strong> (stok: {menu.bottleneck.item_stok} {menu.bottleneck.satuan})
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>Semua bahan aman</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => setSelectedMenu(menu)}
                        className="btn btn-outline btn-sm"
                        title="Lihat Detail Bahan"
                        style={{ padding: '0.35rem 0.5rem' }}
                      >
                        <Eye size={15} color="var(--accent-blue)" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    Tidak ada menu yang sesuai kriteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL KETERSEDIAAN BAHAN MENU */}
      {selectedMenu && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Kesiapan Bahan Resep Menu</h3>
              <button onClick={() => setSelectedMenu(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-dark)' }}>{selectedMenu.nama_menu}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Kode: {selectedMenu.kode_menu} • {selectedMenu.kategori}</div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                <div>Status Sakelar: <strong>{selectedMenu.status_manual === 'aktif' ? 'Aktif' : 'Nonaktif Manual'}</strong></div>
                <div>Kapasitas Maksimal: <strong>{selectedMenu.kapasitas_maksimal_porsi} Porsi</strong></div>
              </div>
            </div>

            <div className="table-container">
              <table style={{ fontSize: '0.825rem' }}>
                <thead>
                  <tr>
                    <th>Bahan Baku</th>
                    <th>Butuh / Porsi</th>
                    <th>Stok Tersedia</th>
                    <th>Bisa Dibuat</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMenu.resep && selectedMenu.resep.map((r, i) => (
                    <tr key={i}>
                      <td><strong>{r.item_nama}</strong></td>
                      <td>{r.jumlah_per_porsi} {r.satuan}</td>
                      <td>{r.item_stok} {r.satuan}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: r.kapasitas_porsi > 0 ? '#15803D' : '#DC2626' }}>
                          {r.kapasitas_porsi} porsi
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setSelectedMenu(null)} className="btn btn-outline">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
