import { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';

const AppContext = createContext();

const defaultData = {
  barang: [
    { id: '1', kode: 'BRG001', nama: 'Air Mineral 600ml', jenis: 'F&B', stok: 8, minStok: 20 },
    { id: '2', kode: 'BRG002', nama: 'Roti Coklat', jenis: 'F&B', stok: 5, minStok: 15 },
    { id: '3', kode: 'BRG003', nama: 'Tumbler 500ml', jenis: 'Retail', stok: 12, minStok: 30 },
    { id: '4', kode: 'BRG004', nama: 'Mie Instan', jenis: 'F&B', stok: 18, minStok: 50 },
  ],
  supplier: [
    { id: '1', nama: 'PT Aqua', kontak: '08123456789' },
    { id: '2', nama: 'CV Roti Sedap', kontak: '08129876543' },
  ],
  gudang: [
    { id: '1', nama: 'Gudang Utama', lokasi: 'Jakarta Selatan' },
    { id: '2', nama: 'Gudang F&B', lokasi: 'Jakarta Pusat' },
  ],
  transaksi: [
    { id: '1', waktu: new Date().toISOString(), barangId: '4', namaBarang: 'Mie Instan', jenis: 'masuk', jumlah: 40 },
    { id: '2', waktu: new Date(Date.now() - 3600000).toISOString(), barangId: '1', namaBarang: 'Air Mineral 600ml', jenis: 'keluar', jumlah: 20 },
    { id: '3', waktu: new Date(Date.now() - 7200000).toISOString(), barangId: '2', namaBarang: 'Roti Coklat', jenis: 'masuk', jumlah: 30 },
  ],
  user: null, // null means not logged in
};

export function AppProvider({ children }) {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('kolab_data');
    if (saved) return JSON.parse(saved);
    return defaultData;
  });

  useEffect(() => {
    localStorage.setItem('kolab_data', JSON.stringify(data));
  }, [data]);

  const login = (username, password) => {
    if (username === 'admin' && password === 'admin123') {
      setData({ ...data, user: { name: 'Admin' } });
      return true;
    }
    return false;
  };

  const logout = () => {
    setData({ ...data, user: null });
  };

  const addBarang = (barang) => {
    setData({ ...data, barang: [...data.barang, { ...barang, id: Date.now().toString(), stok: Number(barang.stok), minStok: Number(barang.minStok) }] });
  };
  const updateBarang = (id, updated) => {
    setData({ ...data, barang: data.barang.map(b => b.id === id ? { ...b, ...updated, stok: Number(updated.stok), minStok: Number(updated.minStok) } : b) });
  };
  const deleteBarang = (id) => {
    setData({ ...data, barang: data.barang.filter(b => b.id !== id) });
  };

  const addTransaksi = (trans) => {
    const barang = data.barang.find(b => b.id === trans.barangId);
    if (!barang) return { success: false, message: 'Barang tidak ditemukan' };

    const jumlah = Number(trans.jumlah);

    if (trans.jenis === 'keluar' && barang.stok < jumlah) {
      return { success: false, message: 'Stok tidak mencukupi untuk barang keluar!' };
    }

    const newStok = trans.jenis === 'masuk' ? barang.stok + jumlah : barang.stok - jumlah;

    const newTransaksi = {
      id: Date.now().toString(),
      waktu: new Date().toISOString(),
      barangId: barang.id,
      namaBarang: barang.nama,
      jenis: trans.jenis,
      jumlah: jumlah
    };

    setData({
      ...data,
      barang: data.barang.map(b => b.id === barang.id ? { ...b, stok: newStok } : b),
      transaksi: [newTransaksi, ...data.transaksi]
    });
    return { success: true };
  };

  const addGudang = (gudang) => setData({ ...data, gudang: [...data.gudang, { ...gudang, id: Date.now().toString() }] });
  const updateGudang = (id, updated) => setData({ ...data, gudang: data.gudang.map(g => g.id === id ? { ...g, ...updated } : g) });
  const deleteGudang = (id) => setData({ ...data, gudang: data.gudang.filter(g => g.id !== id) });

  const addSupplier = (supplier) => setData({ ...data, supplier: [...data.supplier, { ...supplier, id: Date.now().toString() }] });
  const updateSupplier = (id, updated) => setData({ ...data, supplier: data.supplier.map(s => s.id === id ? { ...s, ...updated } : s) });
  const deleteSupplier = (id) => setData({ ...data, supplier: data.supplier.filter(s => s.id !== id) });

  return (
    <AppContext.Provider value={{
      data,
      login, logout,
      addBarang, updateBarang, deleteBarang,
      addTransaksi,
      addGudang, updateGudang, deleteGudang,
      addSupplier, updateSupplier, deleteSupplier
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
