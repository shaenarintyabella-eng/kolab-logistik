import dbPool from '../config/db.js';

export const masterModel = {
  // --- METRIK DASHBOARD / RINGKASAN ---
  async getDashboardSummary() {
    // 1. Hitung status stok barang dari data MySQL
    const [statusStats] = await dbPool.query(`
      SELECT 
        COUNT(*) AS total_item,
        SUM(CASE WHEN stok > min_stok THEN 1 ELSE 0 END) AS aman,
        SUM(CASE WHEN stok > batas_kritis AND stok <= min_stok THEN 1 ELSE 0 END) AS menipis,
        SUM(CASE WHEN stok > 0 AND stok <= batas_kritis THEN 1 ELSE 0 END) AS kritis,
        SUM(CASE WHEN stok <= 0 THEN 1 ELSE 0 END) AS habis,
        SUM(CASE WHEN stok <= min_stok THEN 1 ELSE 0 END) AS perlu_dibeli
      FROM items
      WHERE status = 'aktif'
    `);

    // 2. Hitung total volume barang masuk & keluar (30 hari terakhir)
    const [movementStats] = await dbPool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN jenis = 'Barang Masuk' THEN jumlah ELSE 0 END), 0) AS total_masuk,
        COALESCE(SUM(CASE WHEN jenis = 'Barang Keluar' THEN jumlah ELSE 0 END), 0) AS total_keluar
      FROM stock_movements
      WHERE created_at >= NOW() - INTERVAL 30 DAY
    `);

    // 3. Pergerakan mutasi 7 hari terakhir untuk grafik
    const [chartData] = await dbPool.query(`
      SELECT 
        DATE_FORMAT(d.date, '%d %b') AS tanggal,
        DATE(d.date) as raw_date,
        COALESCE(SUM(CASE WHEN sm.jenis = 'Barang Masuk' THEN sm.jumlah ELSE 0 END), 0) AS masuk,
        COALESCE(SUM(CASE WHEN sm.jenis = 'Barang Keluar' THEN sm.jumlah ELSE 0 END), 0) AS keluar
      FROM (
        SELECT CURDATE() - INTERVAL 6 DAY AS date UNION ALL
        SELECT CURDATE() - INTERVAL 5 DAY UNION ALL
        SELECT CURDATE() - INTERVAL 4 DAY UNION ALL
        SELECT CURDATE() - INTERVAL 3 DAY UNION ALL
        SELECT CURDATE() - INTERVAL 2 DAY UNION ALL
        SELECT CURDATE() - INTERVAL 1 DAY UNION ALL
        SELECT CURDATE()
      ) d
      LEFT JOIN stock_movements sm ON DATE(sm.created_at) = d.date
      GROUP BY d.date
      ORDER BY d.date ASC
    `);

    // 4. Daftar barang yang perlu dibeli / stok menipis (max 5)
    const [urgentItems] = await dbPool.query(`
      SELECT 
        i.id, i.nama, i.sku, i.satuan, i.stok, i.min_stok, i.batas_kritis,
        c.nama AS kategori_nama,
        w.nama AS warehouse_nama,
        CASE
          WHEN i.stok <= 0 THEN 'habis'
          WHEN i.stok <= i.batas_kritis THEN 'kritis'
          ELSE 'menipis'
        END AS status_stok
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN warehouses w ON i.warehouse_id = w.id
      WHERE i.status = 'aktif' AND i.stok <= i.min_stok
      ORDER BY i.stok ASC
      LIMIT 6
    `);

    // 5. 5 Aktivitas mutasi terakhir
    const [recentMovements] = await dbPool.query(`
      SELECT 
        sm.id, sm.kode_transaksi, sm.jenis, sm.jumlah, sm.metode, sm.petugas, sm.created_at,
        i.nama AS item_nama, i.satuan AS item_satuan, i.sku AS item_sku
      FROM stock_movements sm
      JOIN items i ON sm.item_id = i.id
      ORDER BY sm.created_at DESC
      LIMIT 5
    `);

    const stats = statusStats[0] || {};

    return {
      total_item: Number(stats.total_item) || 0,
      aman: Number(stats.aman) || 0,
      menipis: Number(stats.menipis) || 0,
      kritis: Number(stats.kritis) || 0,
      habis: Number(stats.habis) || 0,
      perlu_dibeli: Number(stats.perlu_dibeli) || 0,
      total_masuk: Number(movementStats[0]?.total_masuk) || 0,
      total_keluar: Number(movementStats[0]?.total_keluar) || 0,
      chart: chartData,
      urgent_items: urgentItems,
      recent_movements: recentMovements
    };
  },

  // --- KATEGORI ---
  async getCategories() {
    const [rows] = await dbPool.query(`SELECT * FROM categories ORDER BY nama ASC`);
    return rows;
  },

  // --- GUDANG ---
  async getWarehouses() {
    const [rows] = await dbPool.query(`SELECT * FROM warehouses ORDER BY nama ASC`);
    return rows;
  },
  async createWarehouse(data) {
    const { kode, nama, lokasi, keterangan } = data;
    const [res] = await dbPool.query(
      `INSERT INTO warehouses (kode, nama, lokasi, keterangan) VALUES (?, ?, ?, ?)`,
      [kode, nama, lokasi, keterangan || null]
    );
    return res.insertId;
  },
  async updateWarehouse(id, data) {
    const { kode, nama, lokasi, keterangan } = data;
    const [res] = await dbPool.query(
      `UPDATE warehouses SET kode = ?, nama = ?, lokasi = ?, keterangan = ? WHERE id = ?`,
      [kode, nama, lokasi, keterangan || null, id]
    );
    return res.affectedRows > 0;
  },
  async deleteWarehouse(id) {
    const [items] = await dbPool.query(`SELECT COUNT(*) as c FROM items WHERE warehouse_id = ?`, [id]);
    if (items[0].c > 0) {
      throw new Error(`Gudang tidak dapat dihapus karena masih ada ${items[0].c} barang di dalamnya.`);
    }
    const [res] = await dbPool.query(`DELETE FROM warehouses WHERE id = ?`, [id]);
    return res.affectedRows > 0;
  },

  // --- SUPPLIER ---
  async getSuppliers() {
    const [rows] = await dbPool.query(`SELECT * FROM suppliers ORDER BY nama ASC`);
    return rows;
  },
  async createSupplier(data) {
    const { kode, nama, kontak, telepon, alamat } = data;
    const [res] = await dbPool.query(
      `INSERT INTO suppliers (kode, nama, kontak, telepon, alamat) VALUES (?, ?, ?, ?, ?)`,
      [kode, nama, kontak || null, telepon || null, alamat || null]
    );
    return res.insertId;
  },
  async updateSupplier(id, data) {
    const { kode, nama, kontak, telepon, alamat } = data;
    const [res] = await dbPool.query(
      `UPDATE suppliers SET kode = ?, nama = ?, kontak = ?, telepon = ?, alamat = ? WHERE id = ?`,
      [kode, nama, kontak || null, telepon || null, alamat || null, id]
    );
    return res.affectedRows > 0;
  },
  async deleteSupplier(id) {
    const [items] = await dbPool.query(`SELECT COUNT(*) as c FROM items WHERE supplier_id = ?`, [id]);
    if (items[0].c > 0) {
      throw new Error(`Supplier tidak dapat dihapus karena masih terhubung dengan ${items[0].c} barang.`);
    }
    const [res] = await dbPool.query(`DELETE FROM suppliers WHERE id = ?`, [id]);
    return res.affectedRows > 0;
  }
};
