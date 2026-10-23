import { itemModel } from '../models/itemModel.js';

export const itemController = {
  async getAll(req, res) {
    try {
      const items = await itemModel.getAll(req.query);
      res.json({ success: true, data: items });
    } catch (error) {
      console.error('Error getAll items:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const item = await itemModel.getById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Barang tidak ditemukan' });
      }
      res.json({ success: true, data: item });
    } catch (error) {
      console.error('Error getById item:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async searchByCode(req, res) {
    try {
      const { code } = req.query;
      if (!code) {
        return res.status(400).json({ success: false, message: 'Kode atau barcode wajib diisi' });
      }
      const item = await itemModel.getByCode(code);
      if (!item) {
        return res.status(404).json({ success: false, message: `Barang dengan kode '${code}' tidak ditemukan` });
      }
      res.json({ success: true, data: item });
    } catch (error) {
      console.error('Error searchByCode item:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async create(req, res) {
    try {
      const { sku, barcode, nama, category_id, satuan, stok, min_stok, batas_kritis, status, warehouse_id, supplier_id } = req.body;

      if (!nama || !sku || !category_id || !satuan) {
        return res.status(400).json({
          success: false,
          message: 'Nama, SKU, Kategori, dan Satuan wajib diisi!'
        });
      }

      // Validasi duplikat SKU & barcode
      const duplicates = await itemModel.checkDuplicate(sku, barcode);
      if (duplicates.length > 0) {
        return res.status(400).json({ success: false, message: duplicates.join(' ') });
      }

      let foto = null;
      if (req.file) {
        foto = `/uploads/${req.file.filename}`;
      }

      const id = await itemModel.create({
        sku,
        barcode: barcode || null,
        nama,
        category_id: Number(category_id),
        satuan,
        stok: stok ? Number(stok) : 0,
        min_stok: min_stok ? Number(min_stok) : 10,
        batas_kritis: batas_kritis ? Number(batas_kritis) : 5,
        status: status || 'aktif',
        warehouse_id: warehouse_id ? Number(warehouse_id) : null,
        supplier_id: supplier_id ? Number(supplier_id) : null,
        foto
      });

      const newItem = await itemModel.getById(id);
      res.status(201).json({
        success: true,
        message: 'Barang berhasil ditambahkan',
        data: newItem
      });
    } catch (error) {
      console.error('Error create item:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { sku, barcode, nama, category_id, satuan, stok, min_stok, batas_kritis, status, warehouse_id, supplier_id } = req.body;

      const existing = await itemModel.getById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Barang tidak ditemukan' });
      }

      // Validasi duplikat dengan mengecualikan ID ini
      const duplicates = await itemModel.checkDuplicate(sku, barcode, id);
      if (duplicates.length > 0) {
        return res.status(400).json({ success: false, message: duplicates.join(' ') });
      }

      let foto = undefined;
      if (req.file) {
        foto = `/uploads/${req.file.filename}`;
      }

      await itemModel.update(id, {
        sku,
        barcode: barcode || null,
        nama,
        category_id: Number(category_id),
        satuan,
        stok: stok !== undefined ? Number(stok) : undefined,
        min_stok: Number(min_stok),
        batas_kritis: Number(batas_kritis),
        status,
        warehouse_id: warehouse_id ? Number(warehouse_id) : null,
        supplier_id: supplier_id ? Number(supplier_id) : null,
        foto
      });

      const updated = await itemModel.getById(id);
      res.json({
        success: true,
        message: 'Barang berhasil diperbarui',
        data: updated
      });
    } catch (error) {
      console.error('Error update item:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await itemModel.delete(id);
      res.json({ success: true, message: 'Barang berhasil dihapus' });
    } catch (error) {
      console.error('Error delete item:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
};
