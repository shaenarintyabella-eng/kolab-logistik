import dbPool from '../config/db.js';

export const movementModel = {
  /**
   * Catat transaksi mutasi stok dengan Database Transaction (Atomic)
   */
  async createTransaction({
    item_id,
    jenis,
    jumlah,
    warehouse_asal_id = null,
    warehouse_tujuan_id = null,
    metode = 'Manual',
    petugas,
    catatan = '',
    lampiran_foto = null
  }) {
    const connection = await dbPool.getConnection();
    await connection.beginTransaction();

    try {
      const numJumlah = Number(jumlah);
      if (isNaN(numJumlah) || numJumlah <= 0) {
        throw new Error('Jumlah mutasi harus berupa angka lebih besar dari 0.');
      }

      // 1. Kunci baris item untuk update (SELECT FOR UPDATE)
      const [items] = await connection.query(
        `SELECT id, nama, stok, warehouse_id FROM items WHERE id = ? FOR UPDATE`,
        [item_id]
      );

      if (items.length === 0) {
        throw new Error('Barang tidak ditemukan.');
      }

      const currentItem = items[0];
      const stokSebelum = Number(currentItem.stok);
      let stokSesudah = stokSebelum;
      let newWarehouseId = currentItem.warehouse_id;

      if (jenis === 'Barang Masuk') {
        stokSesudah = stokSebelum + numJumlah;
        if (warehouse_tujuan_id) {
          newWarehouseId = warehouse_tujuan_id;
        }
      } else if (jenis === 'Barang Keluar') {
        if (stokSebelum < numJumlah) {
          throw new Error(
            `Stok tidak mencukupi untuk Barang Keluar! Stok saat ini: ${stokSebelum}, diminta: ${numJumlah}.`
          );
        }
        stokSesudah = stokSebelum - numJumlah;
      } else if (jenis === 'Penyesuaian') {
        // Pada penyesuaian, 'jumlah' adalah nilai stok fisik aktual baru yang dihitung ulang
        stokSesudah = numJumlah;
      } else if (jenis === 'Transfer Gudang') {
        if (!warehouse_asal_id || !warehouse_tujuan_id) {
          throw new Error('Transfer Gudang memerlukan Gudang Asal dan Gudang Tujuan yang jelas.');
        }
        if (warehouse_asal_id === warehouse_tujuan_id) {
          throw new Error('Gudang Asal dan Gudang Tujuan tidak boleh sama.');
        }
        if (stokSebelum < numJumlah) {
          throw new Error(
            `Stok tidak mencukupi untuk Transfer Gudang! Stok saat ini: ${stokSebelum}, diminta: ${numJumlah}.`
          );
        }
        // Dalam model per-barang, perpindahan gudang mengupdate lokasi gudang default barang
        newWarehouseId = warehouse_tujuan_id;
        // Stok total barang tetap sama, tercatat pergerakan transfer
        stokSesudah = stokSebelum;
      } else {
        throw new Error(`Jenis transaksi '${jenis}' tidak valid.`);
      }

      if (stokSesudah < 0) {
        throw new Error('Stok barang tidak boleh bernilai negatif!');
      }

      // 2. Generate kode transaksi unik
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.floor(100 + Math.random() * 900);
      const kodeTransaksi = `TRX-${jenis.slice(0, 3).toUpperCase()}-${timestamp}${random}`;

      // 3. Simpan ke stock_movements
      const [insertResult] = await connection.query(
        `INSERT INTO stock_movements 
        (kode_transaksi, item_id, jenis, jumlah, stok_sebelum, stok_sesudah, warehouse_asal_id, warehouse_tujuan_id, metode, petugas, catatan, lampiran_foto)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          kodeTransaksi,
          item_id,
          jenis,
          numJumlah,
          stokSebelum,
          stokSesudah,
          warehouse_asal_id || null,
          warehouse_tujuan_id || null,
          metode,
          petugas,
          catatan || null,
          lampiran_foto || null
        ]
      );

      // 4. Update stok pada tabel items
      await connection.query(
        `UPDATE items SET stok = ?, warehouse_id = ? WHERE id = ?`,
        [stokSesudah, newWarehouseId, item_id]
      );

      // Commit transaksi jika seluruh tahapan sukses
      await connection.commit();

      return {
        id: insertResult.insertId,
        kode_transaksi: kodeTransaksi,
        stok_sebelum: stokSebelum,
        stok_sesudah: stokSesudah,
        nama_barang: currentItem.nama
      };
    } catch (error) {
      // Rollback database jika terjadi error apa pun
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async getAll({
    search = '',
    jenis = '',
    warehouse_id = '',
    petugas = '',
    start_date = '',
    end_date = '',
    page = 1,
    limit = 20
  }) {
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ` AND (i.nama LIKE ? OR i.sku LIKE ? OR sm.kode_transaksi LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    if (jenis) {
      whereClause += ` AND sm.jenis = ?`;
      params.push(jenis);
    }

    if (warehouse_id) {
      whereClause += ` AND (sm.warehouse_asal_id = ? OR sm.warehouse_tujuan_id = ?)`;
      params.push(warehouse_id, warehouse_id);
    }

    if (petugas) {
      whereClause += ` AND sm.petugas LIKE ?`;
      params.push(`%${petugas}%`);
    }

    if (start_date) {
      whereClause += ` AND DATE(sm.created_at) >= ?`;
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ` AND DATE(sm.created_at) <= ?`;
      params.push(end_date);
    }

    // Hitung total data
    const [countRows] = await dbPool.query(
      `SELECT COUNT(*) as total 
       FROM stock_movements sm 
       LEFT JOIN items i ON sm.item_id = i.id 
       ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    // Ambil data dengan pagination
    const offset = (Number(page) - 1) * Number(limit);
    const query = `
      SELECT 
        sm.*,
        i.nama AS item_nama,
        i.sku AS item_sku,
        i.satuan AS item_satuan,
        wa.nama AS warehouse_asal_nama,
        wt.nama AS warehouse_tujuan_nama
      FROM stock_movements sm
      LEFT JOIN items i ON sm.item_id = i.id
      LEFT JOIN warehouses wa ON sm.warehouse_asal_id = wa.id
      LEFT JOIN warehouses wt ON sm.warehouse_tujuan_id = wt.id
      ${whereClause}
      ORDER BY sm.id DESC
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, Number(limit), Number(offset)];
    const [rows] = await dbPool.query(query, queryParams);

    return {
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }
};
