import { userModel } from '../models/userModel.js';
import crypto from 'crypto';

export const authController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username dan password wajib diisi!' });
      }

      // 1. Fast-path untuk akun demo
      if ((username === 'admin' && password === 'admin123') || (username === 'staff_gudang' && password === 'staff123')) {
        return res.json({
          success: true,
          message: 'Login berhasil',
          user: {
            id: username === 'admin' ? 1 : 2,
            username,
            nama_lengkap: username === 'admin' ? 'Administrator Ko+Lab' : 'Staff Logistik',
            role: username === 'admin' ? 'admin' : 'gudang'
          },
          token: `logistik_token_${username}_${Date.now()}`
        });
      }

      const user = await userModel.findByUsername(username);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Username atau password salah!' });
      }

      // 2. Verifikasi password (plain, SHA-256, atau bcrypt)
      let isMatch = false;
      if (user.password_plain && user.password_plain === password) {
        isMatch = true;
      } else if (user.password === password) {
        isMatch = true;
      } else if (user.password_hash) {
        const sha256 = crypto.createHash('sha256').update(password).digest('hex');
        if (sha256 === user.password_hash) {
          isMatch = true;
        } else if (/^\$2[aby]\$/.test(user.password_hash)) {
          try {
            const bcrypt = await import('bcryptjs').catch(() => import('bcrypt'));
            if (bcrypt && bcrypt.compare) {
              isMatch = await bcrypt.compare(password, user.password_hash);
            }
          } catch (e) {}
        }
      }

      if (!isMatch) {
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
        user: userPayload,
        token: `logistik_token_${user.id}_${Date.now()}`
      });
    } catch (error) {
      console.error('Error login:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
