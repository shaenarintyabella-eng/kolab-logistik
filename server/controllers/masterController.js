import { masterModel } from '../models/masterModel.js';

export const masterController = {
  // Kategori
  async getCategories(req, res) {
    try {
      const data = await masterModel.getCategories();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Gudang
  async getWarehouses(req, res) {
    try {
      const data = await masterModel.getWarehouses();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  async createWarehouse(req, res) {
    try {
      const { kode, nama, lokasi, keterangan } = req.body;
      if (!kode || !nama || !lokasi) {
        return res.status(400).json({ success: false, message: 'Kode, Nama, dan Lokasi gudang wajib diisi!' });
      }
      const id = await masterModel.createWarehouse({ kode, nama, lokasi, keterangan });
      res.status(201).json({ success: true, message: 'Gudang berhasil ditambahkan', data: { id, kode, nama, lokasi } });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
  async updateWarehouse(req, res) {
    try {
      const { id } = req.params;
      const { kode, nama, lokasi, keterangan } = req.body;
      await masterModel.updateWarehouse(id, { kode, nama, lokasi, keterangan });
      res.json({ success: true, message: 'Gudang berhasil diperbarui' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
  async deleteWarehouse(req, res) {
    try {
      await masterModel.deleteWarehouse(req.params.id);
      res.json({ success: true, message: 'Gudang berhasil dihapus' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // Supplier
  async getSuppliers(req, res) {
    try {
      const data = await masterModel.getSuppliers();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  async createSupplier(req, res) {
    try {
      const { kode, nama, kontak, telepon, alamat } = req.body;
      if (!kode || !nama) {
        return res.status(400).json({ success: false, message: 'Kode dan Nama supplier wajib diisi!' });
      }
      const id = await masterModel.createSupplier({ kode, nama, kontak, telepon, alamat });
      res.status(201).json({ success: true, message: 'Supplier berhasil ditambahkan', data: { id, kode, nama } });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
  async updateSupplier(req, res) {
    try {
      const { id } = req.params;
      const { kode, nama, kontak, telepon, alamat } = req.body;
      await masterModel.updateSupplier(id, { kode, nama, kontak, telepon, alamat });
      res.json({ success: true, message: 'Supplier berhasil diperbarui' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
  async deleteSupplier(req, res) {
    try {
      await masterModel.deleteSupplier(req.params.id);
      res.json({ success: true, message: 'Supplier berhasil dihapus' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};
