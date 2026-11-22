import dbPool from '../config/db.js';

export const userModel = {
  async findByUsername(username) {
    if (!username) return null;

    // 1. Akun Demo bawaan
    if (username === 'admin') {
      return { id: 1, username: 'admin', password: 'admin123', password_plain: 'admin123', nama_lengkap: 'Administrator Ko+Lab', role: 'admin' };
    }
    if (username === 'staff_gudang') {
      return { id: 2, username: 'staff_gudang', password: 'staff123', password_plain: 'staff123', nama_lengkap: 'Staff Logistik', role: 'gudang' };
    }

    // 2. Query tabel staff terpusat di ngola_geasture_adm
    try {
      const [staffRows] = await dbPool.query(
        `SELECT id, name AS nama_lengkap, email AS username, role, password_hash, password_plain, status 
         FROM staff 
         WHERE (email = ? OR id = ? OR name = ?) AND (status = 'active' OR status IS NULL)
         LIMIT 1`,
        [username, username, username]
      );
      if (staffRows.length > 0) {
        const s = staffRows[0];
        return {
          id: s.id,
          username: s.username,
          password: s.password_plain || s.password_hash,
          password_plain: s.password_plain,
          password_hash: s.password_hash,
          nama_lengkap: s.nama_lengkap,
          role: s.role
        };
      }
    } catch (err) {
      console.warn('[userModel] Warning querying staff table:', err.message);
    }

    // 3. Query tabel users terpusat di ngola_geasture_adm
    try {
      const [userRows] = await dbPool.query(
        `SELECT id, nama AS nama_lengkap, email AS username, role, password_hash, password_plain 
         FROM users 
         WHERE (email = ? OR id = ? OR nama = ?)
         LIMIT 1`,
        [username, username, username]
      );
      if (userRows.length > 0) {
        const u = userRows[0];
        return {
          id: u.id,
          username: u.username,
          password: u.password_plain || u.password_hash,
          password_plain: u.password_plain,
          password_hash: u.password_hash,
          nama_lengkap: u.nama_lengkap,
          role: u.role
        };
      }
    } catch (err) {
      console.warn('[userModel] Warning querying users table:', err.message);
    }

    return null;
  },

  async getById(id) {
    if (!id) return null;
    if (id === 1 || id === '1') {
      return { id: 1, username: 'admin', nama_lengkap: 'Administrator Ko+Lab', role: 'admin' };
    }
    if (id === 2 || id === '2') {
      return { id: 2, username: 'staff_gudang', nama_lengkap: 'Staff Logistik', role: 'gudang' };
    }

    try {
      const [staffRows] = await dbPool.query(
        `SELECT id, name AS nama_lengkap, email AS username, role FROM staff WHERE id = ? LIMIT 1`,
        [id]
      );
      if (staffRows.length > 0) return staffRows[0];
    } catch (e) {}

    try {
      const [userRows] = await dbPool.query(
        `SELECT id, nama AS nama_lengkap, email AS username, role FROM users WHERE id = ? LIMIT 1`,
        [id]
      );
      if (userRows.length > 0) return userRows[0];
    } catch (e) {}

    return null;
  }
};
