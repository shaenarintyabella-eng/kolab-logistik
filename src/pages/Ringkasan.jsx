import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  XCircle, 
  ShoppingCart,
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ScanLine, 
  UtensilsCrossed,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import api from '../services/api';
import { useAppContext } from '../context/AppContext';

export default function Ringkasan() {
  const navigate = useNavigate();
  const { refreshKey } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total_item: 0,
    aman: 0,
    menipis: 0,
    kritis: 0,
    habis: 0,
    perlu_dibeli: 0,
    total_masuk: 0,
    total_keluar: 0,
    chart: [],
    urgent_items: [],
    recent_movements: []
  });

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      if (res.success && res.data) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error('Gagal memuat ringkasan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [refreshKey]);

  const cards = [
    {
      title: 'Total Item',
      value: summary.total_item,
      color: 'var(--navy-dark)',
      bg: '#F1F5F9',
      icon: Package,
      filter: ''
    },
    {
      title: 'Aman',
      value: summary.aman,
      color: '#15803D',
      bg: 'var(--status-aman-bg)',
      icon: ShieldCheck,
      filter: 'aman'
    },
    {
      title: 'Menipis',
      value: summary.menipis,
      color: '#B45309',
      bg: 'var(--status-menipis-bg)',
      icon: AlertTriangle,
      filter: 'menipis'
    },
    {
      title: 'Kritis',
      value: summary.kritis,
      color: '#C2410C',
      bg: 'var(--status-kritis-bg)',
      icon: AlertOctagon,
      filter: 'kritis'
    },
    {
      title: 'Habis',
      value: summary.habis,
      color: '#B91C1C',
      bg: 'var(--status-habis-bg)',
      icon: XCircle,
      filter: 'habis'
    },
    {
      title: 'Perlu Dibeli',
      value: summary.perlu_dibeli,
      color: 'var(--primary-orange)',
      bg: 'var(--primary-orange-light)',
      icon: ShoppingCart,
      filter: 'perlu_dibeli'
    }
  ];

  return (
    <div>
      {/* Header Banner */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' 
      }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--navy-dark)', letterSpacing: '-0.02em' }}>
            Ringkasan Operasional Logistik
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Status inventori bahan baku, resep retail & F&B terhubung langsung ke MySQL
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchSummary} className="btn btn-outline" title="Refresh Data">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Segarkan
          </button>
          <Link to="/input-scan" className="btn btn-primary">
            <ScanLine size={18} /> Catat Mutasi / Scan
          </Link>
        </div>
      </div>

      {/* 6 Metrik Status Stok Utama */}
      <div className="grid-cols-6 mb-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="card"
              onClick={() => navigate(`/barang?stock_status=${card.filter}`)}
              style={{ 
                cursor: 'pointer', padding: '1.25rem', position: 'relative', overflow: 'hidden' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {card.title}
                </span>
                <div style={{ 
                  width: 32, height: 32, borderRadius: 'var(--radius-md)', background: card.bg, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color 
                }}>
                  <Icon size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: card.color }}>
                {card.value}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--accent-blue)', marginTop: '0.5rem', fontWeight: 600 }}>
                Lihat detail <ArrowRight size={12} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Grafik Pergerakan Stok & Quick Action */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Grafik */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-dark)' }}>
                Aktivitas Barang 7 Hari Terakhir
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Pergerakan transaksi barang masuk vs barang keluar
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16A34A' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#16A34A' }}></span> Masuk: {summary.total_masuk}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#DC2626' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#DC2626' }}></span> Keluar: {summary.total_keluar}
              </span>
            </div>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            {summary.chart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="tanggal" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                  />
                  <Area type="monotone" dataKey="masuk" stroke="#16A34A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMasuk)" name="Barang Masuk" />
                  <Area type="monotone" dataKey="keluar" stroke="#DC2626" strokeWidth={2.5} fillOpacity={1} fill="url(#colorKeluar)" name="Barang Keluar" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Belum ada data pergerakan 7 hari terakhir.
              </div>
            )}
          </div>
        </div>

        {/* Barang Perlu Dibeli / Menipis */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="var(--primary-orange)" />
              Perlu Restock Segera
            </h3>
            <Link to="/barang?stock_status=perlu_dibeli" style={{ color: 'var(--primary-orange)', fontSize: '0.8rem', fontWeight: 600 }}>
              Lihat Semua →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {summary.urgent_items && summary.urgent_items.length > 0 ? (
              summary.urgent_items.map((item) => (
                <div 
                  key={item.id} 
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    padding: '0.75rem', borderRadius: 'var(--radius-md)', background: '#F8FAFC',
                    border: '1px solid var(--border-color)' 
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{item.nama}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      SKU: {item.sku} • {item.kategori_nama}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: item.status_stok === 'habis' ? '#DC2626' : '#EA580C' }}>
                      {Number(item.stok).toLocaleString('id-ID')} {item.satuan}
                    </div>
                    <span className={`badge badge-${item.status_stok}`}>
                      {item.status_stok === 'habis' ? 'Habis' : item.status_stok === 'kritis' ? 'Kritis' : 'Menipis'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={36} color="#16A34A" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Semua Stok Aman</p>
                <p style={{ fontSize: '0.8rem' }}>Tidak ada barang di bawah batas minimum.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5 Aktivitas Mutasi Terakhir */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Riwayat Mutasi Terkini</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pencatatan real-time dari database transaksi</p>
          </div>
          <Link to="/riwayat-mutasi" className="btn btn-outline btn-sm">
            Buka Riwayat Lengkap →
          </Link>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Kode Transaksi</th>
                <th>Barang</th>
                <th>Jenis</th>
                <th>Jumlah</th>
                <th>Metode</th>
                <th>Petugas</th>
              </tr>
            </thead>
            <tbody>
              {summary.recent_movements && summary.recent_movements.length > 0 ? (
                summary.recent_movements.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(m.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--accent-blue)' }}>
                      {m.kode_transaksi}
                    </td>
                    <td style={{ fontWeight: 600 }}>{m.item_nama}</td>
                    <td>
                      <span className={`badge ${m.jenis === 'Barang Masuk' ? 'badge-aman' : m.jenis === 'Barang Keluar' ? 'badge-habis' : 'badge-blue'}`}>
                        {m.jenis}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: m.jenis === 'Barang Masuk' ? '#16A34A' : m.jenis === 'Barang Keluar' ? '#DC2626' : 'var(--text-dark)' }}>
                      {m.jenis === 'Barang Masuk' ? '+' : m.jenis === 'Barang Keluar' ? '-' : ''}
                      {Number(m.jumlah).toLocaleString('id-ID')} {m.item_satuan}
                    </td>
                    <td>
                      <span className="badge badge-nonaktif">{m.metode}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{m.petugas}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Belum ada riwayat mutasi barang di database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
