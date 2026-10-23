import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root project directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kolab_logistik',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Helper untuk verifikasi koneksi database
export async function testDbConnection() {
  try {
    const connection = await dbPool.getConnection();
    console.log('✅ Berhasil terhubung ke database MySQL:', process.env.DB_NAME || 'kolab_logistik');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Gagal terhubung ke MySQL:', error.message);
    return false;
  }
}

export default dbPool;
