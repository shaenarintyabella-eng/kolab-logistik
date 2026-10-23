import dbPool from '../config/db.js';

export const userModel = {
  async findByUsername(username) {
    const [rows] = await dbPool.query(
      `SELECT id, username, password, nama_lengkap, role FROM users WHERE username = ?`,
      [username]
    );
    return rows[0] || null;
  },

  async getById(id) {
    const [rows] = await dbPool.query(
      `SELECT id, username, nama_lengkap, role FROM users WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }
};
