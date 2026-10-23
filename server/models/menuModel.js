import dbPool from '../config/db.js';

export const menuModel = {
  /**
   * Ambil semua menu beserta bahan dan kalkulasi kapasitas porsi
   */
  async getAllWithAvailability({ search = '', kategori = '', status_filter = '' }) {
    let menuQuery = `
      SELECT m.*
      FROM menus m
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      menuQuery += ` AND (m.nama_menu LIKE ? OR m.kode_menu LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (kategori) {
      menuQuery += ` AND m.kategori = ?`;
      params.push(kategori);
    }

    menuQuery += ` ORDER BY m.id DESC`;

    const [menus] = await dbPool.query(menuQuery, params);

    // Ambil seluruh ingredients untuk menu-menu ini
    const [ingredients] = await dbPool.query(`
      SELECT 
        mi.*,
        i.nama AS item_nama,
        i.sku AS item_sku,
        i.stok AS item_stok,
        i.satuan AS item_satuan,
        i.min_stok AS item_min_stok,
        i.batas_kritis AS item_batas_kritis
      FROM menu_ingredients mi
      JOIN items i ON mi.item_id = i.id
    `);

    // Kelompokkan ingredients berdasarkan menu_id
    const ingredientsMap = {};
    for (const ing of ingredients) {
      if (!ingredientsMap[ing.menu_id]) {
        ingredientsMap[ing.menu_id] = [];
      }
      
      const stokTersedia = Number(ing.item_stok);
      const butuhPerPorsi = Number(ing.jumlah_per_porsi);
      const kapasitasPorsi = butuhPerPorsi > 0 ? Math.floor(stokTersedia / butuhPerPorsi) : 0;
      
      ingredientsMap[ing.menu_id].push({
        id: ing.id,
        item_id: ing.item_id,
        item_nama: ing.item_nama,
        item_sku: ing.item_sku,
        item_satuan: ing.item_satuan,
        jumlah_per_porsi: butuhPerPorsi,
        satuan: ing.satuan,
        item_stok: stokTersedia,
        kapasitas_porsi: kapasitasPorsi,
        is_sufficient: kapasitasPorsi > 0
      });
    }

    // Hitung status ketersediaan untuk setiap menu
    const result = menus.map(menu => {
      const resep = ingredientsMap[menu.id] || [];
      
      let maxPorsi = 0;
      let bottleneckIngredient = null;

      if (resep.length > 0) {
        maxPorsi = Math.min(...resep.map(r => r.kapasitas_porsi));
        // Cari bahan yang paling membatasi (bottleneck)
        bottleneckIngredient = resep.reduce((prev, curr) => 
          curr.kapasitas_porsi < prev.kapasitas_porsi ? curr : prev
        , resep[0]);
      } else {
        // Jika menu belum punya komposisi resep
        maxPorsi = 999; 
      }

      let ketersediaan = 'tersedia';
      if (menu.status_manual === 'nonaktif') {
        ketersediaan = 'nonaktif_manual';
      } else if (resep.length > 0 && maxPorsi <= 0) {
        ketersediaan = 'stok_habis';
      } else if (resep.length > 0 && maxPorsi <= 10) {
        ketersediaan = 'menipis';
      }

      return {
        ...menu,
        resep,
        kapasitas_maksimal_porsi: maxPorsi === 999 ? 0 : maxPorsi,
        has_recipe: resep.length > 0,
        bottleneck: bottleneckIngredient,
        status_ketersediaan: ketersediaan
      };
    });

    // Filter status jika diminta
    if (status_filter) {
      return result.filter(m => m.status_ketersediaan === status_filter);
    }

    return result;
  },

  async getById(id) {
    const [menus] = await dbPool.query(`SELECT * FROM menus WHERE id = ?`, [id]);
    if (menus.length === 0) return null;

    const [ingredients] = await dbPool.query(`
      SELECT 
        mi.*,
        i.nama AS item_nama,
        i.sku AS item_sku,
        i.stok AS item_stok,
        i.satuan AS item_satuan
      FROM menu_ingredients mi
      JOIN items i ON mi.item_id = i.id
      WHERE mi.menu_id = ?
    `, [id]);

    const resep = ingredients.map(ing => {
      const stokTersedia = Number(ing.item_stok);
      const butuhPerPorsi = Number(ing.jumlah_per_porsi);
      return {
        ...ing,
        jumlah_per_porsi: butuhPerPorsi,
        item_stok: stokTersedia,
        kapasitas_porsi: butuhPerPorsi > 0 ? Math.floor(stokTersedia / butuhPerPorsi) : 0
      };
    });

    const maxPorsi = resep.length > 0 ? Math.min(...resep.map(r => r.kapasitas_porsi)) : 0;

    return {
      ...menus[0],
      resep,
      kapasitas_maksimal_porsi: maxPorsi
    };
  },

  async create(data, ingredients = []) {
    const connection = await dbPool.getConnection();
    await connection.beginTransaction();

    try {
      const { kode_menu, nama_menu, kategori = 'Makanan', foto = null, status_manual = 'aktif', deskripsi = '', harga = 0 } = data;

      const [resMenu] = await connection.query(
        `INSERT INTO menus (kode_menu, nama_menu, kategori, foto, status_manual, deskripsi, harga)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [kode_menu, nama_menu, kategori, foto, status_manual, deskripsi, harga]
      );

      const menuId = resMenu.insertId;

      if (Array.isArray(ingredients) && ingredients.length > 0) {
        for (const ing of ingredients) {
          if (ing.item_id && ing.jumlah_per_porsi) {
            await connection.query(
              `INSERT INTO menu_ingredients (menu_id, item_id, jumlah_per_porsi, satuan)
               VALUES (?, ?, ?, ?)`,
              [menuId, ing.item_id, ing.jumlah_per_porsi, ing.satuan || 'porsi']
            );
          }
        }
      }

      await connection.commit();
      return menuId;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  async update(id, data, ingredients = null) {
    const connection = await dbPool.getConnection();
    await connection.beginTransaction();

    try {
      const { kode_menu, nama_menu, kategori, foto, status_manual, deskripsi, harga } = data;

      await connection.query(
        `UPDATE menus SET
          kode_menu = ?,
          nama_menu = ?,
          kategori = ?,
          foto = COALESCE(?, foto),
          status_manual = ?,
          deskripsi = ?,
          harga = ?
        WHERE id = ?`,
        [kode_menu, nama_menu, kategori, foto, status_manual, deskripsi, harga, id]
      );

      // Jika ingredients dikirim ulang, perbarui seluruh resep
      if (Array.isArray(ingredients)) {
        await connection.query(`DELETE FROM menu_ingredients WHERE menu_id = ?`, [id]);
        for (const ing of ingredients) {
          if (ing.item_id && ing.jumlah_per_porsi) {
            await connection.query(
              `INSERT INTO menu_ingredients (menu_id, item_id, jumlah_per_porsi, satuan)
               VALUES (?, ?, ?, ?)`,
              [id, ing.item_id, ing.jumlah_per_porsi, ing.satuan || 'porsi']
            );
          }
        }
      }

      await connection.commit();
      return true;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  async toggleStatusManual(id, status_manual) {
    const [result] = await dbPool.query(
      `UPDATE menus SET status_manual = ? WHERE id = ?`,
      [status_manual, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await dbPool.query(`DELETE FROM menus WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }
};
