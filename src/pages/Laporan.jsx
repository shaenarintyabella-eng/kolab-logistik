import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export default function Laporan() {
  const { data } = useAppContext();

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-bold" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Laporan Transaksi</h2>
        <p className="text-gray">Riwayat barang masuk dan keluar.</p>
      </div>

      <div className="card mb-6">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Waktu</th>
                <th>Nama Barang</th>
                <th>Jenis</th>
                <th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {data.transaksi.map(t => (
                <tr key={t.id}>
                  <td className="text-gray text-sm">TRX-{t.id.slice(-6)}</td>
                  <td>{format(new Date(t.waktu), 'dd MMMM yyyy HH:mm', { locale: id })}</td>
                  <td className="font-semibold">{t.namaBarang}</td>
                  <td>
                    <span className={`badge ${t.jenis === 'masuk' ? 'badge-blue' : 'badge-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      {t.jenis === 'masuk' ? <ArrowDownToLine size={12}/> : <ArrowUpFromLine size={12}/>}
                      {t.jenis === 'masuk' ? 'Barang Masuk' : 'Barang Keluar'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 'bold', color: t.jenis === 'masuk' ? 'var(--accent-green-text)' : 'var(--accent-red-text)' }}>
                    {t.jenis === 'masuk' ? '+' : '-'}{t.jumlah}
                  </td>
                </tr>
              ))}
              {data.transaksi.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>Belum ada transaksi.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
