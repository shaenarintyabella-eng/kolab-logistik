import { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Download, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowRightLeft, 
  Filter, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Eye,
  X,
  Package
} from 'lucide-react';
import api from '../services/api';
import { useAppContext } from '../context/AppContext';

export default function RiwayatMutasi() {
  const { showNotification } = useAppContext();

  const [movements, setMovements] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [jenis, setJenis] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [petugas, setPetugas] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Detail Modal
  const [selectedTrx, setSelectedTrx] = useState(null);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const res = await api.getMovements({
        search,
        jenis,
        warehouse_id: warehouseId,
        petugas,
        start_date: startDate,
        end_date: endDate,
        page,
        limit
      });

      if (res.success) {
        setMovements(res.data);
        setTotalPages(res.pagination.totalPages || 1);
        setTotalRecords(res.pagination.total || 0);
      }
    } catch (err) {
      console.error('Gagal memuat riwayat mutasi:', err);
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadWh() {
      const res = await api.getWarehouses();
      if (res.success) setWarehouses(res.data);
    }
    loadWh();
  }, []);

  useEffect(() => {
    loadMovements();
  }, [search, jenis, warehouseId, petugas, startDate, endDate, page]);

  // Export CSV Handler
  const handleExportCsv = async () => {
    try {
      showNotification('Menyiapkan file ekspor CSV...', 'info');
      const blob = await api.exportMovementsCsv({
        search,
        jenis,
        warehouse_id: warehouseId,
        petugas,
        start_date: startDate,
        end_date: endDate
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `riwayat_mutasi_kolab_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showNotification('File CSV berhasil diunduh!', 'success');
    } catch (err) {
      showNotification('Gagal mengunduh CSV: ' + err.message, 'error');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setJenis('');
    setWarehouseId('');
    setPetugas('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--navy-dark)' }}>
            Riwayat Mutasi & Logistik
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Audit trail lengkap pergerakan stok barang masuk, keluar, opname, dan transfer gudang
          </p>
        </div>
        <button onClick={handleExportCsv} className="btn btn-outline" style={{ gap: '0.4rem', borderColor: '#16A34A', color: '#16A34A' }}>
          <FileSpreadsheet size={18} /> Ekspor Data CSV
        </button>
      </div>

      {/* Filter Card */}
      <div className="card mb-6" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
          {/* Pencarian */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Cari kode transaksi, barang, SKU..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Filter Jenis */}
          <select 
            className="form-select" 
            value={jenis} 
            onChange={(e) => { setJenis(e.target.value); setPage(1); }}
          >
            <option value="">Semua Jenis Mutasi</option>
            <option value="Barang Masuk">Barang Masuk</option>
            <option value="Barang Keluar">Barang Keluar</option>
            <option value="Penyesuaian">Penyesuaian</option>
            <option value="Transfer Gudang">Transfer Gudang</option>
          </select>

          {/* Filter Gudang */}
          <select 
            className="form-select" 
            value={warehouseId} 
            onChange={(e) => { setWarehouseId(e.target.value); setPage(1); }}
          >
            <option value="">Semua Gudang</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.nama}</option>
            ))}
          </select>

          {/* Tanggal Mulai */}
          <input
            type="date"
            className="form-input"
            value={startDate}
            title="Tanggal Mulai"
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
          />

          {/* Tanggal Selesai */}
          <input
            type="date"
            className="form-input"
            value={endDate}
            title="Tanggal Selesai"
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
          />

          {/* Reset Filters */}
          {(search || jenis || warehouseId || petugas || startDate || endDate) && (
            <button onClick={resetFilters} className="btn btn-outline btn-sm">
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Tabel Mutasi */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Menampilkan <strong>{movements.length}</strong> dari <strong>{totalRecords}</strong> total transaksi
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Kode Transaksi</th>
                <th>Nama Barang</th>
                <th>Jenis</th>
                <th>Perubahan</th>
                <th>Stok Sebelum</th>
                <th>Stok Sesudah</th>
                <th>Metode</th>
                <th>Petugas</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {movements.length > 0 ? (
                movements.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(m.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '0.825rem', color: 'var(--accent-blue)', whiteSpace: 'nowrap' }}>
                      {m.kode_transaksi}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--navy-dark)' }}>{m.item_nama}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {m.item_sku}</div>
                    </td>
                    <td>
                      <span className={`badge ${m.jenis === 'Barang Masuk' ? 'badge-aman' : m.jenis === 'Barang Keluar' ? 'badge-habis' : 'badge-blue'}`}>
                        {m.jenis}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: m.jenis === 'Barang Masuk' ? '#16A34A' : m.jenis === 'Barang Keluar' ? '#DC2626' : 'var(--navy-dark)' }}>
                      {m.jenis === 'Barang Masuk' ? '+' : m.jenis === 'Barang Keluar' ? '-' : ''}
                      {Number(m.jumlah).toLocaleString('id-ID')} {m.item_satuan}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {Number(m.stok_sebelum).toLocaleString('id-ID')}
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--navy-dark)' }}>
                      {Number(m.stok_sesudah).toLocaleString('id-ID')}
                    </td>
                    <td>
                      <span className="badge badge-nonaktif">{m.metode}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{m.petugas}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => setSelectedTrx(m)}
                        className="btn btn-outline btn-sm"
                        title="Lihat Detail Transaksi"
                        style={{ padding: '0.35rem 0.5rem' }}
                      >
                        <Eye size={15} color="var(--accent-blue)" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <History size={42} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                    <p style={{ fontWeight: 600 }}>Tidak ada riwayat mutasi yang cocok.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Halaman {page} dari {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn btn-outline btn-sm"
                style={{ gap: '0.25rem' }}
              >
                <ChevronLeft size={16} /> Sebelumnya
              </button>
              <button 
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="btn btn-outline btn-sm"
                style={{ gap: '0.25rem' }}
              >
                Berikutnya <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL TRANSAKSI */}
      {selectedTrx && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Detail Transaksi Mutasi</h3>
              <button onClick={() => setSelectedTrx(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
              <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kode Transaksi:</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                  {selectedTrx.kode_transaksi}
                </div>
              </div>

              <div className="grid-cols-2">
                <div><strong>Barang:</strong> {selectedTrx.item_nama}</div>
                <div><strong>SKU:</strong> {selectedTrx.item_sku}</div>
                <div><strong>Jenis:</strong> {selectedTrx.jenis}</div>
                <div><strong>Jumlah:</strong> {selectedTrx.jumlah} {selectedTrx.item_satuan}</div>
                <div><strong>Stok Sebelum:</strong> {selectedTrx.stok_sebelum}</div>
                <div><strong>Stok Sesudah:</strong> {selectedTrx.stok_sesudah}</div>
                <div><strong>Metode:</strong> {selectedTrx.metode}</div>
                <div><strong>Petugas:</strong> {selectedTrx.petugas}</div>
                <div><strong>Gudang Asal:</strong> {selectedTrx.warehouse_asal_nama || '-'}</div>
                <div><strong>Gudang Tujuan:</strong> {selectedTrx.warehouse_tujuan_nama || '-'}</div>
              </div>

              <div>
                <strong>Catatan / Keterangan:</strong>
                <p style={{ marginTop: '0.25rem', padding: '0.5rem', background: '#F1F5F9', borderRadius: 'var(--radius-sm)' }}>
                  {selectedTrx.catatan || 'Tidak ada catatan.'}
                </p>
              </div>

              {selectedTrx.lampiran_foto && (
                <div>
                  <strong>Lampiran Foto:</strong>
                  <div style={{ marginTop: '0.5rem', width: '100%', maxHeight: '200px', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
                    <img 
                      src={`http://localhost:5000${selectedTrx.lampiran_foto}`} 
                      alt="Lampiran" 
                      style={{ width: '100%', height: 'auto', objectFit: 'contain' }} 
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button onClick={() => setSelectedTrx(null)} className="btn btn-outline">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
