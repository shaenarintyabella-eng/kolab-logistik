import { movementModel } from '../models/movementModel.js';

export const movementController = {
  async create(req, res) {
    try {
      const {
        item_id,
        jenis,
        jumlah,
        warehouse_asal_id,
        warehouse_tujuan_id,
        metode,
        petugas,
        catatan
      } = req.body;

      if (!item_id || !jenis || !jumlah || !petugas) {
        return res.status(400).json({
          success: false,
          message: 'Barang, Jenis Transaksi, Jumlah, dan Nama Petugas wajib diisi!'
        });
      }

      let lampiran_foto = null;
      if (req.file) {
        lampiran_foto = `/uploads/${req.file.filename}`;
      }

      const result = await movementModel.createTransaction({
        item_id: Number(item_id),
        jenis,
        jumlah: Number(jumlah),
        warehouse_asal_id: warehouse_asal_id ? Number(warehouse_asal_id) : null,
        warehouse_tujuan_id: warehouse_tujuan_id ? Number(warehouse_tujuan_id) : null,
        metode: metode || 'Manual',
        petugas,
        catatan,
        lampiran_foto
      });

      res.status(201).json({
        success: true,
        message: `Transaksi ${jenis} untuk '${result.nama_barang}' berhasil disimpan!`,
        data: result
      });
    } catch (error) {
      console.error('Error create movement:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const result = await movementModel.getAll(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error getAll movements:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async exportCsv(req, res) {
    try {
      // Ambil seluruh data tanpa limit untuk ekspor
      const result = await movementModel.getAll({ ...req.query, page: 1, limit: 10000 });
      const rows = result.data;

      let csv = 'Kode Transaksi,Waktu,Barang,SKU,Jenis,Jumlah,Satuan,Stok Sebelum,Stok Sesudah,Gudang Asal,Gudang Tujuan,Metode,Petugas,Catatan\n';

      for (const r of rows) {
        const waktu = new Date(r.created_at).toLocaleString('id-ID');
        const catatan = (r.catatan || '').replace(/"/g, '""');
        csv += `"${r.kode_transaksi}","${waktu}","${r.item_nama}","${r.item_sku}","${r.jenis}",${r.jumlah},"${r.item_satuan}",${r.stok_sebelum},${r.stok_sesudah},"${r.warehouse_asal_nama || '-'}","${r.warehouse_tujuan_nama || '-'}","${r.metode}","${r.petugas}","${catatan}"\n`;
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=riwayat_mutasi_kolab.csv');
      res.send(csv);
    } catch (error) {
      console.error('Error exportCsv:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
