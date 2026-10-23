import { userModel } from '../models/userModel.js';

export const authController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username dan password wajib diisi!' });
      }

      const user = await userModel.findByUsername(username);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Username atau password salah!' });
      }

      // Verifikasi password (dalam seed disimpan admin123 / staff123)
      if (user.password !== password) {
        return res.status(401).json({ success: false, message: 'Username atau password salah!' });
      }

      const userPayload = {
        id: user.id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        role: user.role
      };

      res.json({
        success: true,
        message: 'Login berhasil',
        user: userPayload
      });
    } catch (error) {
      console.error('Error login:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
