# Ko+Lab Logistik Retail & F&B

Aplikasi manajemen inventori dan logistik terpadu untuk operasional retail, bahan baku, makanan, minuman, gudang, dan kalkulasi resep menu **Ko+Lab**.

Aplikasi ini dibangun menggunakan arsitektur modern full-stack:
* **Frontend**: React.js (Vite) dengan palet visual profesional Ko+Lab (Oranye `#FF8A00`, Biru aksen `#2563EB`, Navy `#0F172A`, dan Putih).
* **Backend Utama**: Node.js dengan Express.js menerapkan pola arsitektur **MVC** (*Models, Controllers, Routes*) dengan driver `mysql2/promise` (prepared statements, multi-step atomic database transactions, dan upload file).
* **Backend Pendamping (PHP PDO)**: Folder `api_php/` yang mendukung standar PHP Data Objects (PDO) untuk memenuhi verifikasi/pengujian lingkungan Apache PHP di XAMPP.
* **Database**: MySQL terkelola (dapat diakses via phpMyAdmin).

---

## 🚀 Fitur Utama

1. **Ringkasan (Dashboard)**:
   * 6 Kartu Status Stok Real-time dari MySQL: **Total Item**, **Aman**, **Menipis**, **Kritis**, **Habis**, dan **Perlu Dibeli** (Reorder Point).
   * Grafik visual pergerakan stok 7 hari terakhir (Barang Masuk vs Barang Keluar).
   * Daftar bahan baku prioritas restock segera.
   * Ringkasan 5 mutasi terkini.
   * Empty state yang informatif jika data kosong.

2. **Master Barang**:
   * Data lengkap: ID, Nama Barang, SKU, Barcode, Kategori (*Retail*, *Bahan Resep*, *Makanan*, *Minuman*), Satuan (*porsi, biji, gram, kg, liter, botol, pcs*), Stok saat ini, Batas minimum, Batas kritis, Status aktif/nonaktif, Gudang, dan Supplier.
   * Pencarian fleksibel nama/SKU/barcode serta filter kategori, gudang, dan status stok.
   * Tambah, lihat detail, edit, dan hapus barang dengan konfirmasi aman (data dengan riwayat mutasi/resep terlindungi).
   * Validasi SKU dan Barcode unik.
   * Seed data awal: Ayam Cincang, Bakso Halus, Bakso Urat, Bumbu Rahasia, Mie Basah, Pangsit Goreng, dll.

3. **Input & Scan (2 Panel)**:
   * **Panel Kiri (Scan/Cari)**: Input manual barcode/SKU, pencarian cepat, dropdown list, kamera barcode scanner, dan upload foto lampiran/surat jalan (maks. 3MB).
   * **Panel Kanan (Catat Mutasi)**: Jenis mutasi (*Barang Masuk*, *Barang Keluar*, *Penyesuaian*, *Transfer Gudang*), validasi stok negatif, jumlah > 0, alokasi gudang asal & tujuan, nama petugas, metode, dan catatan.
   * Transaksi database bersifat **Atomic Transaction** (`START TRANSACTION`, `COMMIT`, `ROLLBACK`) sehingga data stok tidak akan korup/berubah sebagian jika terjadi kegagalan.

4. **Resep Menu**:
   * Katalog menu masakan dan minuman lengkap dengan kode, harga, foto, dan deskripsi.
   * Form komposisi bahan baku per 1 porsi menu.
   * **Kalkulator Kapasitas Porsi**: Menghitung porsi maksimal yang bisa diproduksi berdasarkan stok riil bahan baku di MySQL dan mengidentifikasi bahan yang menjadi *bottleneck*.
   * Simulator kebutuhan bahan untuk perencanaan produksi porsi tertentu.
   * Stok tidak terpotong otomatis saat menu dilihat; hanya melalui mutasi produksi resmi.

5. **Riwayat Mutasi**:
   * Tabel audit trail lengkap: Waktu, Kode Transaksi, Nama Barang, Jenis, Jumlah Perubahan (+/-), Stok Sebelum, Stok Sesudah, Metode, Petugas, Gudang, dan Lampiran Foto.
   * Filter rentang tanggal, jenis mutasi, gudang, dan petugas.
   * Pagination data dinamis.
   * Fitur **Ekspor CSV** untuk keperluan laporan dan arsip logistik.

6. **Ketersediaan Menu/Logistik**:
   * Ringkasan: Total Menu, Tersedia, Nonaktif Manual, dan Stok Habis.
   * Pemisahan tegas antara status **Nonaktif Manual** (dimatikan sengaja oleh manajer) dan **Stok Habis** (bahan baku habis otomatis).
   * Sakelar interaktif (*Toggle Switch*) Aktif/Nonaktif Manual yang tersimpan langsung di MySQL.

7. **Master Gudang & Supplier**:
   * Manajemen lokasi penyimpanan (*Gudang Utama, Dapur & Cold Storage, Display Retail*).
   * Manajemen kontak rekanan supplier.

---

## 🛠️ Persyaratan Sistem

* **XAMPP** (dengan Apache dan MySQL/MariaDB) di `c:\xampp8.2`
* **Node.js** (v18 ke atas) & **npm**

---

## 📦 Panduan Instalasi & Konfigurasi

### 1. Konfigurasi Database MySQL via phpMyAdmin

1. Buka browser dan akses phpMyAdmin: `http://localhost/phpmyadmin`
2. Buat database baru bernama: `kolab_logistik` dengan collation `utf8mb4_unicode_ci`.
3. Klik tab **Import**, pilih file:
   * [database/schema.sql](file:///c:/xampp8.2/htdocs/kolab-logistik/database/schema.sql) lalu klik **Import**.
   * [database/seed.sql](file:///c:/xampp8.2/htdocs/kolab-logistik/database/seed.sql) lalu klik **Import**.
4. Atau jalankan langsung via terminal MySQL XAMPP:
   ```bash
   c:\xampp8.2\mysql\bin\mysql.exe -u root -e "source c:/xampp8.2/htdocs/kolab-logistik/database/schema.sql"
   c:\xampp8.2\mysql\bin\mysql.exe -u root -e "source c:/xampp8.2/htdocs/kolab-logistik/database/seed.sql"
   ```

### 2. Konfigurasi Environment Variable (`.env`)

File `.env` sudah disediakan pada root project:
```env
PORT=5000
NODE_ENV=development

# MySQL Database XAMPP
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=kolab_logistik
DB_PORT=3306

CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api
```

### 3. Menjalankan Aplikasi

Buka dua terminal PowerShell di direktori `c:\xampp8.2\htdocs\kolab-logistik`:

**Terminal 1: Menjalankan Backend Node.js Express**
```powershell
npm run server
```
*Server API aktif di: `http://localhost:5000` (Healthcheck: `http://localhost:5000/api/health`)*

**Terminal 2: Menjalankan Frontend React (Vite)**
```powershell
npm run dev
```
*Akses antarmuka aplikasi melalui browser di: `http://localhost:5173`*

---

## 🔐 Akun Demo Pengujian

| Role | Username | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Akses penuh ke seluruh fitur dan master data |
| **Staff Logistik** | `staff_gudang` | `staff123` | Akses operasional logistik dan mutasi |

---

## 🌐 Catatan Implementasi PHP PDO

Untuk memenuhi kriteria evaluasi akademis jika penguji menguji via modul PHP Apache:
* File konfigurasi PDO: [api_php/config.php](file:///c:/xampp8.2/htdocs/kolab-logistik/api_php/config.php)
* File endpoint PDO: [api_php/items.php](file:///c:/xampp8.2/htdocs/kolab-logistik/api_php/items.php)
* Dapat diuji langsung via browser/curl melalui URL Apache:
  `http://localhost/kolab-logistik/api_php/items.php`