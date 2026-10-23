-- Data Seed Awal untuk Kolab Logistik Retail & F&B
USE `kolab_logistik`;

-- 1. Seed Users (admin / admin123)
INSERT INTO `users` (`id`, `username`, `password`, `nama_lengkap`, `role`) VALUES
(1, 'admin', 'admin123', 'Administrator Ko+Lab', 'admin'),
(2, 'staff_gudang', 'staff123', 'Staff Logistik', 'gudang')
ON DUPLICATE KEY UPDATE `nama_lengkap` = VALUES(`nama_lengkap`);

-- 2. Seed Categories
INSERT INTO `categories` (`id`, `nama`, `tipe`) VALUES
(1, 'Bahan Resep', 'Bahan Resep'),
(2, 'Retail', 'Retail'),
(3, 'Makanan', 'Makanan'),
(4, 'Minuman', 'Minuman')
ON DUPLICATE KEY UPDATE `nama` = VALUES(`nama`);

-- 3. Seed Warehouses
INSERT INTO `warehouses` (`id`, `kode`, `nama`, `lokasi`, `keterangan`) VALUES
(1, 'GDG-UTM', 'Gudang Utama Ko+Lab', 'Lt. 1 Gedung Logistik Pusat', 'Penyimpanan stok utama & buffer'),
(2, 'GDG-FNB', 'Dapur & Cold Storage F&B', 'Area Kitchen & Bar', 'Penyimpanan bahan segar dan olahan'),
(3, 'GDG-RTL', 'Gudang Display Retail', 'Area Retail Store', 'Penyimpanan produk display dan kemasan')
ON DUPLICATE KEY UPDATE `nama` = VALUES(`nama`);

-- 4. Seed Suppliers
INSERT INTO `suppliers` (`id`, `kode`, `nama`, `kontak`, `telepon`, `alamat`) VALUES
(1, 'SPL-001', 'PT Berkah Segar Nusantara', 'Budi Santoso', '081234567890', 'Sentra Pasar Induk Blok A2'),
(2, 'SPL-002', 'CV Rasa Bumbu Alami', 'Dewi Lestari', '081398765432', 'Kawasan Industri Kuliner No. 12'),
(3, 'SPL-003', 'PT Retail Pack Sejahtera', 'Ahmad Ridwan', '085712344321', 'Ruko Niaga Harapan No. 8')
ON DUPLICATE KEY UPDATE `nama` = VALUES(`nama`);

-- 5. Seed Items (Sesuai spesifikasi wajib):
-- Ayam Cincang — 80 porsi
-- Bakso Halus — 250 biji
-- Bakso Urat — 100 biji
-- Bumbu Rahasia — 5.000 gram
-- Mie Basah — 100 porsi
-- Pangsit Goreng — 150 biji
-- + Produk Retail & Minuman
INSERT INTO `items` (`id`, `sku`, `barcode`, `nama`, `category_id`, `satuan`, `stok`, `min_stok`, `batas_kritis`, `status`, `warehouse_id`, `supplier_id`) VALUES
(1, 'BRG-FNB-001', '899100100001', 'Ayam Cincang', 1, 'porsi', 80.00, 30.00, 15.00, 'aktif', 2, 1),
(2, 'BRG-FNB-002', '899100100002', 'Bakso Halus', 1, 'biji', 250.00, 80.00, 30.00, 'aktif', 2, 1),
(3, 'BRG-FNB-003', '899100100003', 'Bakso Urat', 1, 'biji', 100.00, 50.00, 20.00, 'aktif', 2, 1),
(4, 'BRG-FNB-004', '899100100004', 'Bumbu Rahasia', 1, 'gram', 5000.00, 1500.00, 500.00, 'aktif', 2, 2),
(5, 'BRG-FNB-005', '899100100005', 'Mie Basah', 1, 'porsi', 100.00, 40.00, 20.00, 'aktif', 2, 1),
(6, 'BRG-FNB-006', '899100100006', 'Pangsit Goreng', 1, 'biji', 150.00, 60.00, 25.00, 'aktif', 2, 1),
(7, 'BRG-RTL-001', '899200200001', 'Tumbler Ko+Lab Stainless 500ml', 2, 'pcs', 35.00, 15.00, 5.00, 'aktif', 3, 3),
(8, 'BRG-RTL-002', '899200200002', 'Kaos Polo Merchandise Ko+Lab (L)', 2, 'pcs', 18.00, 10.00, 4.00, 'aktif', 3, 3),
(9, 'BRG-BEV-001', '899300300001', 'Kopi Susu Gula Aren Botol 250ml', 4, 'botol', 45.00, 20.00, 10.00, 'aktif', 2, 2)
ON DUPLICATE KEY UPDATE `stok` = VALUES(`stok`);

-- 6. Seed Riwayat Mutasi Awal
INSERT INTO `stock_movements` (`id`, `kode_transaksi`, `item_id`, `jenis`, `jumlah`, `stok_sebelum`, `stok_sesudah`, `warehouse_asal_id`, `warehouse_tujuan_id`, `metode`, `petugas`, `catatan`, `created_at`) VALUES
(1, 'TRX-INIT-001', 1, 'Barang Masuk', 80.00, 0.00, 80.00, NULL, 2, 'Scan Barcode', 'Admin Ko+Lab', 'Stok awal batch penerimaan segar', NOW() - INTERVAL 2 DAY),
(2, 'TRX-INIT-002', 2, 'Barang Masuk', 250.00, 0.00, 250.00, NULL, 2, 'Manual', 'Admin Ko+Lab', 'Penerimaan supplier PT Berkah', NOW() - INTERVAL 2 DAY),
(3, 'TRX-INIT-003', 4, 'Barang Masuk', 5000.00, 0.00, 5000.00, NULL, 2, 'Manual', 'Staff Logistik', 'Restock bumbu dapur pusat', NOW() - INTERVAL 1 DAY),
(4, 'TRX-INIT-004', 5, 'Barang Masuk', 100.00, 0.00, 100.00, NULL, 2, 'Scan Barcode', 'Staff Logistik', 'Penerimaan mie basah harian', NOW() - INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE `kode_transaksi` = VALUES(`kode_transaksi`);

-- 7. Seed Menus
INSERT INTO `menus` (`id`, `kode_menu`, `nama_menu`, `kategori`, `status_manual`, `deskripsi`, `harga`) VALUES
(1, 'MN-001', 'Mie Ayam Ko+Lab Komplit', 'Makanan', 'aktif', 'Mie basah kenyal dengan topping ayam cincang gurih, 2 bakso halus, 1 bakso urat, dan pangsit goreng renyah.', 32000.00),
(2, 'MN-002', 'Bakso Kuah Spesial Ko+Lab', 'Makanan', 'aktif', 'Semangkuk bakso kuah lezat berisi 4 bakso halus dan 2 bakso urat pilihan disiram kuah bumbu rahasia.', 28000.00),
(3, 'MN-003', 'Kopi Susu Aren Ko+Lab', 'Minuman', 'aktif', 'Kopi susu segar dingin siap minum kemasan botol higienis.', 18000.00)
ON DUPLICATE KEY UPDATE `nama_menu` = VALUES(`nama_menu`);

-- 8. Seed Menu Ingredients (Resep)
-- Untuk 1 Porsi "Mie Ayam Ko+Lab Komplit":
-- Mie Basah: 1 porsi (stok 100 -> max 100 porsi)
-- Ayam Cincang: 1 porsi (stok 80 -> max 80 porsi)
-- Bakso Halus: 2 biji (stok 250 -> max 125 porsi)
-- Bakso Urat: 1 biji (stok 100 -> max 100 porsi)
-- Bumbu Rahasia: 25 gram (stok 5000g -> max 200 porsi)
-- Pangsit Goreng: 1 biji (stok 150 -> max 150 porsi)
-- -> Batas bottleneck = Ayam Cincang (80 porsi)!
INSERT INTO `menu_ingredients` (`id`, `menu_id`, `item_id`, `jumlah_per_porsi`, `satuan`) VALUES
(1, 1, 5, 1.00, 'porsi'),
(2, 1, 1, 1.00, 'porsi'),
(3, 1, 2, 2.00, 'biji'),
(4, 1, 3, 1.00, 'biji'),
(5, 1, 4, 25.00, 'gram'),
(6, 1, 6, 1.00, 'biji'),

-- Untuk 1 Porsi "Bakso Kuah Spesial Ko+Lab":
-- Bakso Halus: 4 biji
-- Bakso Urat: 2 biji
-- Bumbu Rahasia: 30 gram
(7, 2, 2, 4.00, 'biji'),
(8, 2, 3, 2.00, 'biji'),
(9, 2, 4, 30.00, 'gram'),

-- Untuk "Kopi Susu Aren Ko+Lab":
(10, 3, 9, 1.00, 'botol')
ON DUPLICATE KEY UPDATE `jumlah_per_porsi` = VALUES(`jumlah_per_porsi`);
