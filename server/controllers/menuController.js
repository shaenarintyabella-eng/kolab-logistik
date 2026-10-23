import { menuModel } from '../models/menuModel.js';

export const menuController = {
  async getAll(req, res) {
    try {
      const menus = await menuModel.getAllWithAvailability(req.query);
      res.json({ success: true, data: menus });
    } catch (error) {
      console.error('Error getAll menus:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const menu = await menuModel.getById(req.params.id);
      if (!menu) {
        return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
      }
      res.json({ success: true, data: menu });
    } catch (error) {
      console.error('Error getById menu:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async create(req, res) {
    try {
      const { kode_menu, nama_menu, kategori, status_manual, deskripsi, harga, ingredients } = req.body;

      if (!kode_menu || !nama_menu) {
        return res.status(400).json({ success: false, message: 'Kode menu dan nama menu wajib diisi!' });
      }

      let parsedIngredients = [];
      if (typeof ingredients === 'string') {
        try {
          parsedIngredients = JSON.parse(ingredients);
        } catch {
          parsedIngredients = [];
        }
      } else if (Array.isArray(ingredients)) {
        parsedIngredients = ingredients;
      }

      let foto = null;
      if (req.file) {
        foto = `/uploads/${req.file.filename}`;
      }

      const id = await menuModel.create({
        kode_menu,
        nama_menu,
        kategori: kategori || 'Makanan',
        foto,
        status_manual: status_manual || 'aktif',
        deskripsi: deskripsi || '',
        harga: harga ? Number(harga) : 0
      }, parsedIngredients);

      const createdMenu = await menuModel.getById(id);
      res.status(201).json({
        success: true,
        message: 'Resep menu berhasil disimpan',
        data: createdMenu
      });
    } catch (error) {
      console.error('Error create menu:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { kode_menu, nama_menu, kategori, status_manual, deskripsi, harga, ingredients } = req.body;

      let parsedIngredients = null;
      if (ingredients) {
        if (typeof ingredients === 'string') {
          try {
            parsedIngredients = JSON.parse(ingredients);
          } catch {
            parsedIngredients = [];
          }
        } else if (Array.isArray(ingredients)) {
          parsedIngredients = ingredients;
        }
      }

      let foto = undefined;
      if (req.file) {
        foto = `/uploads/${req.file.filename}`;
      }

      await menuModel.update(id, {
        kode_menu,
        nama_menu,
        kategori,
        foto,
        status_manual,
        deskripsi,
        harga: harga !== undefined ? Number(harga) : undefined
      }, parsedIngredients);

      const updated = await menuModel.getById(id);
      res.json({
        success: true,
        message: 'Resep menu berhasil diperbarui',
        data: updated
      });
    } catch (error) {
      console.error('Error update menu:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async toggleStatus(req, res) {
    try {
      const { id } = req.params;
      const { status_manual } = req.body;

      if (!['aktif', 'nonaktif'].includes(status_manual)) {
        return res.status(400).json({ success: false, message: "Status harus 'aktif' atau 'nonaktif'" });
      }

      await menuModel.toggleStatusManual(id, status_manual);
      res.json({
        success: true,
        message: `Status menu berhasil diubah menjadi ${status_manual}`
      });
    } catch (error) {
      console.error('Error toggleStatus menu:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await menuModel.delete(id);
      res.json({ success: true, message: 'Menu berhasil dihapus' });
    } catch (error) {
      console.error('Error delete menu:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
