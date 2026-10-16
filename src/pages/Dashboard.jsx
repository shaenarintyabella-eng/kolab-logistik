import { useAppContext } from '../context/AppContext';
import { Box, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Plus, Database, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Dashboard() {
  const { data } = useAppContext();

  const totalProduk = data.barang.length;
  const barangMasukTotal = data.transaksi.filter(t => t.jenis === 'masuk').reduce((acc, curr) => acc + curr.jumlah, 0);
  const barangKeluarTotal = data.transaksi.filter(t => t.jenis === 'keluar').reduce((acc, curr) => acc + curr.jumlah, 0);
  const stokMenipis = data.barang.filter(b => b.stok <= b.minStok);

  const chartData = [
    { name: '3 Okt', stok: 60 },
    { name: '4 Okt', stok: 95 },
    { name: '5 Okt', stok: 85 },
    { name: '6 Okt', stok: 130 },
    { name: '7 Okt', stok: 80 },
    { name: '8 Okt', stok: 110 },
    { name: '9 Okt', stok: 160 },
  ];

  return (
    <div>
      <div className="grid-cols-4 mb-6">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', gridColumn: 'span 1' }}>
           <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Hallo, Admin 👋</h2>
           <p style={{ color: 'var(--text-gray)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Kelola stok dan logistik dengan mudah dan lebih efisien.</p>
           <div><span className="badge" style={{ background: 'var(--primary-orange)', color: 'white', padding: '0.5rem 1rem' }}>Ko+Lab</span></div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: '#fef3c7', borderRadius: '0.5rem', color: '#d97706' }}><Box /></div>
            <span style={{ color: 'var(--text-gray)', fontWeight: '500' }}>Total Produk</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{totalProduk}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-green-text)', marginTop: '0.5rem' }}>↑ 12% dari bulan lalu</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--accent-blue-bg)', borderRadius: '0.5rem', color: 'var(--accent-blue-text)' }}><ArrowDownToLine /></div>
            <span style={{ color: 'var(--text-gray)', fontWeight: '500' }}>Barang Masuk</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{barangMasukTotal}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-green-text)', marginTop: '0.5rem' }}>↑ 8% dari bulan lalu</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--accent-red-bg)', borderRadius: '0.5rem', color: 'var(--accent-red-text)' }}><ArrowUpFromLine /></div>
            <span style={{ color: 'var(--text-gray)', fontWeight: '500' }}>Barang Keluar</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{barangKeluarTotal}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-red-text)', marginTop: '0.5rem' }}>↑ 5% dari bulan lalu</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Pergerakan Stok</h3>
            <select className="form-input" style={{ width: 'auto', padding: '0.25rem 0.5rem' }}>
              <option>7 Hari Terakhir</option>
            </select>
          </div>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip />
                <Line type="monotone" dataKey="stok" stroke="var(--primary-orange)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary-orange)' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
           <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={18} color="var(--primary-orange)"/> Stok Menipis</h3>
            <Link to="/barang" style={{ color: 'var(--primary-orange)', fontSize: '0.875rem' }}>Lihat Semua →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stokMenipis.slice(0, 4).map(b => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div className="font-semibold text-sm">{b.nama}</div>
                  <div className="text-xs text-gray">{b.jenis} • {b.kode}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="font-bold" style={{ color: 'var(--accent-red-text)' }}>{b.stok}</div>
                  <div className="text-xs text-gray">Min. {b.minStok}</div>
                </div>
                <span className="badge badge-danger">Menipis</span>
              </div>
            ))}
            {stokMenipis.length === 0 && <div className="text-gray text-sm">Semua stok aman.</div>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Aktivitas Terbaru</h3>
            <Link to="/laporan" style={{ color: 'var(--primary-orange)', fontSize: '0.875rem' }}>Lihat Semua →</Link>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Nama Barang</th>
                  <th>Jenis</th>
                  <th>Jumlah</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.transaksi.slice(0, 5).map(t => (
                  <tr key={t.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div style={{ color: t.jenis === 'masuk' ? 'var(--accent-green-text)' : 'var(--accent-red-text)' }}>
                          {t.jenis === 'masuk' ? <ArrowDownToLine size={16}/> : <ArrowUpFromLine size={16}/>}
                        </div>
                        {format(new Date(t.waktu), 'dd MMM yyyy HH:mm', { locale: id })}
                      </div>
                    </td>
                    <td className="font-medium">{t.namaBarang}</td>
                    <td>{t.jenis === 'masuk' ? 'Barang Masuk' : 'Barang Keluar'}</td>
                    <td style={{ color: t.jenis === 'masuk' ? 'var(--accent-green-text)' : 'var(--accent-red-text)', fontWeight: 'bold' }}>
                      {t.jenis === 'masuk' ? '+' : '-'}{t.jumlah}
                    </td>
                    <td><span className="badge badge-success">Selesai</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Database size={18} color="var(--primary-orange)" /> Quick Action</h3>
          <div className="grid-cols-2">
            <Link to="/barang-masuk" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: '#fff7ed', color: 'var(--primary-orange)', borderRadius: '0.5rem', gap: '0.5rem', fontWeight: '500' }}>
              <ArrowDownToLine size={24} /> Barang Masuk
            </Link>
            <Link to="/barang-keluar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--accent-blue-bg)', color: 'var(--accent-blue-text)', borderRadius: '0.5rem', gap: '0.5rem', fontWeight: '500' }}>
              <ArrowUpFromLine size={24} /> Barang Keluar
            </Link>
            <Link to="/barang" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--accent-purple-bg)', color: 'var(--accent-purple-text)', borderRadius: '0.5rem', gap: '0.5rem', fontWeight: '500' }}>
              <Plus size={24} /> Tambah Barang
            </Link>
            <Link to="/gudang" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: '#fef3c7', color: '#b45309', borderRadius: '0.5rem', gap: '0.5rem', fontWeight: '500' }}>
              <Box size={24} /> Kelola Gudang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
