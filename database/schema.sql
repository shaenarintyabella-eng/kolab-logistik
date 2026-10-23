-- Database: kolab_logistik
-- Dibuat untuk Aplikasi Inventori dan Logistik Ko+Lab Retail & F&B

CREATE DATABASE IF NOT EXISTS `kolab_logistik` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kolab_logistik`;

-- 1. Tabel users
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nama_lengkap` VARCHAR(100) NOT NULL,
  `role` ENUM('admin', 'staff', 'gudang') DEFAULT 'staff',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(100) NOT NULL,
  `tipe` ENUM('Retail', 'Bahan Resep', 'Makanan', 'Minuman') NOT NULL DEFAULT 'Retail',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel warehouses
CREATE TABLE IF NOT EXISTS `warehouses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode` VARCHAR(20) NOT NULL UNIQUE,
  `nama` VARCHAR(100) NOT NULL,
  `lokasi` VARCHAR(255) NOT NULL,
  `keterangan` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabel suppliers
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode` VARCHAR(20) NOT NULL UNIQUE,
  `nama` VARCHAR(100) NOT NULL,
  `kontak` VARCHAR(100) NULL,
  `telepon` VARCHAR(30) NULL,
  `alamat` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabel items
CREATE TABLE IF NOT EXISTS `items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sku` VARCHAR(50) NOT NULL UNIQUE,
  `barcode` VARCHAR(100) NULL UNIQUE,
  `nama` VARCHAR(150) NOT NULL,
  `category_id` INT NOT NULL,
  `satuan` VARCHAR(30) NOT NULL,
  `stok` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `min_stok` DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
  `batas_kritis` DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
  `status` ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
  `warehouse_id` INT NULL,
  `supplier_id` INT NULL,
  `foto` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_item_nama` (`nama`),
  INDEX `idx_item_sku` (`sku`),
  INDEX `idx_item_barcode` (`barcode`),
  CONSTRAINT `fk_items_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_items_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_items_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabel stock_movements
CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_transaksi` VARCHAR(50) NOT NULL UNIQUE,
  `item_id` INT NOT NULL,
  `jenis` ENUM('Barang Masuk', 'Barang Keluar', 'Penyesuaian', 'Transfer Gudang') NOT NULL,
  `jumlah` DECIMAL(10, 2) NOT NULL,
  `stok_sebelum` DECIMAL(10, 2) NOT NULL,
  `stok_sesudah` DECIMAL(10, 2) NOT NULL,
  `warehouse_asal_id` INT NULL,
  `warehouse_tujuan_id` INT NULL,
  `metode` VARCHAR(50) DEFAULT 'Manual',
  `petugas` VARCHAR(100) NOT NULL,
  `catatan` TEXT NULL,
  `lampiran_foto` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_movements_waktu` (`created_at`),
  INDEX `idx_movements_jenis` (`jenis`),
  CONSTRAINT `fk_movement_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_movement_wh_asal` FOREIGN KEY (`warehouse_asal_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_movement_wh_tujuan` FOREIGN KEY (`warehouse_tujuan_id`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Tabel menus
CREATE TABLE IF NOT EXISTS `menus` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_menu` VARCHAR(50) NOT NULL UNIQUE,
  `nama_menu` VARCHAR(150) NOT NULL,
  `kategori` VARCHAR(50) NOT NULL DEFAULT 'Makanan',
  `foto` VARCHAR(255) NULL,
  `status_manual` ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
  `deskripsi` TEXT NULL,
  `harga` DECIMAL(12, 2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_menu_nama` (`nama_menu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Tabel menu_ingredients
CREATE TABLE IF NOT EXISTS `menu_ingredients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `menu_id` INT NOT NULL,
  `item_id` INT NOT NULL,
  `jumlah_per_porsi` DECIMAL(10, 2) NOT NULL,
  `satuan` VARCHAR(30) NOT NULL,
  CONSTRAINT `fk_recipe_menu` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recipe_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
