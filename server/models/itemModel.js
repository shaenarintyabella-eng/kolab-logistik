import dbPool from '../config/db.js';

export const itemModel = {
  async getAll({ search = '', category_id = '', warehouse_id = '', status = '', stock_status = '' }) {
    let query = `
      SELECT 
        i.*,
        c.nama AS kategori_nama,
        c.tipe AS kategori_tipe,
        w.nama AS warehouse_nama,
        w.kode AS warehouse_kode,
        s.nama AS supplier_nama,
        CASE
          WHEN i.stok <= 0 THEN 'habis'
          WHEN i.stok <= i.batas_kritis THEN 'kritis'
          WHEN i.stok <= i.min_stok THEN 'menipis'
          ELSE 'aman'
        END AS status_stok
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN warehouses w ON i.warehouse_id = w.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (i.nama LIKE ? OR i.sku LIKE ? OR i.barcode LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    if (category_id) {
      query += ` AND i.category_id = ?`;
      params.push(category_id);
    }

    if (warehouse_id) {
      query += ` AND i.warehouse_id = ?`;
      params.push(warehouse_id);
    }

    if (status) {
      query += ` AND i.status = ?`;
      params.push(status);
    }

    if (stock_status) {
      if (stock_status === 'habis') {
        query += ` AND i.stok <= 0`;
      } else if (stock_status === 'kritis') {
        query += ` AND i.stok > 0 AND i.stok <= i.batas_kritis`;
      } else if (stock_status === 'menipis') {
        query += ` AND i.stok > i.batas_kritis AND i.stok <= i.min_stok`;
      } else if (stock_status === 'aman') {
        query += ` AND i.stok > i.min_stok`;
      } else if (stock_status === 'perlu_dibeli') {
        query += ` AND i.stok <= i.min_stok`;
      }
    }

    query += ` ORDER BY i.id DESC`;

    const [rows] = await dbPool.query(query, params);
    return rows;
  },

  async getById(id) {
    const query = `
      SELECT 
        i.*,
        c.nama AS kategori_nama,
        c.tipe AS kategori_tipe,
        w.nama AS warehouse_nama,
        w.kode AS warehouse_kode,
        s.nama AS supplier_nama,
        CASE
          WHEN i.stok <= 0 THEN 'habis'
          WHEN i.stok <= i.batas_kritis THEN 'kritis'
          WHEN i.stok <= i.min_stok THEN 'menipis'
          ELSE 'aman'
        END AS status_stok
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN warehouses w ON i.warehouse_id = w.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      WHERE i.id = ?
    `;
    const [rows] = await dbPool.query(query, [id]);
    return rows[0] || null;
  },

  async getByCode(code) {
    const query = `
      SELECT 
        i.*,
        c.nama AS kategori_nama,
        w.nama AS warehouse_nama,
        CASE
          WHEN i.stok <= 0 THEN 'habis'
          WHEN i.stok <= i.batas_kritis THEN 'kritis'
          WHEN i.stok <= i.min_stok THEN 'menipis'
          ELSE 'aman'
        END AS status_stok
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN warehouses w ON i.warehouse_id = w.id
      WHERE i.barcode = ? OR i.sku = ?
      LIMIT 1
    `;
    const [rows] = await dbPool.query(query, [code, code]);
    return rows[0] || null;
  },

  async checkDuplicate(sku, barcode, excludeId = null) {
    const errors = [];
    if (sku) {
      let q = `SELECT id FROM items WHERE sku = ?`;
      const p = [sku];
      if (excludeId) {
        q += ` AND id != ?`;
        p.push(excludeId);
      }
      const [rows] = await dbPool.query(q, p);
      if (rows.length > 0) errors.push(`SKU '${sku}' sudah digunakan oleh barang lain.`);
    }

    if (barcode) {
      let q = `SELECT id FROM items WHERE barcode = ?`;
      const p = [barcode];
      if (excludeId) {
        q += ` AND id != ?`;
        p.push(excludeId);
      }
      const [rows] = await dbPool.query(q, p);
      if (rows.length > 0) errors.push(`Barcode '${barcode}' sudah digunakan oleh barang lain.`);
    }

    return errors;
  },

  async create(data) {
    const {
      sku, barcode, nama, category_id, satuan,
      stok = 0, min_stok = 10, batas_kritis = 5,
      status = 'aktif', warehouse_id = null, supplier_id = null, foto = null
    } = data;

    const query = `
      INSERT INTO items 
      (sku, barcode, nama, category_id, satuan, stok, min_stok, batas_kritis, status, warehouse_id, supplier_id, foto)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await dbPool.query(query, [
      sku, barcode || null, nama, category_id, satuan,
      stok, min_stok, batas_kritis, status, warehouse_id || null, supplier_id || null, foto || null
    ]);
    return result.insertId;
  },

  async update(id, data) {
    const {
      sku, barcode, nama, category_id, satuan,
      stok, min_stok, batas_kritis, status,
      warehouse_id, supplier_id, foto
    } = data;

    const query = `
      UPDATE items SET
        sku = ?,
        barcode = ?,
        nama = ?,
        category_id = ?,
        satuan = ?,
        stok = COALESCE(?, stok),
        min_stok = ?,
        batas_kritis = ?,
        status = ?,
        warehouse_id = ?,
        supplier_id = ?,
        foto = COALESCE(?, foto)
      WHERE id = ?
    `;
    const [result] = await dbPool.query(query, [
      sku, barcode || null, nama, category_id, satuan,
      stok, min_stok, batas_kritis, status,
      warehouse_id || null, supplier_id || null, foto || null,
      id
    ]);
    return result.affectedRows > 0;
  },

  async delete(id) {
    // Periksa apakah ada riwayat mutasi
    const [movements] = await dbPool.query(
      `SELECT COUNT(*) AS total FROM stock_movements WHERE item_id = ?`,
      [id]
    );

    // Periksa apakah terdaftar di resep menu
    const [recipes] = await dbPool.query(
      `SELECT COUNT(*) AS total FROM menu_ingredients WHERE item_id = ?`,
      [id]
    );

    if (movements[0].total > 0 || recipes[0].total > 0) {
      throw new Error(
        `Barang tidak dapat dihapus permanen karena memiliki ${movements[0].total} riwayat mutasi dan/atau digunakan dalam resep menu. Anda dapat menonaktifkan status barang.`
      );
    }

    const [result] = await dbPool.query(`DELETE FROM items WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }
};
