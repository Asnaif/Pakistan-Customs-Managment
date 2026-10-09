import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/pmm_dashboard';

// Parse DATABASE_URL
const url = new URL(dbUrl);

const pool = mysql.createPool({
  host: url.hostname,
  port: parseInt(url.port || '3306', 10),
  user: url.username,
  password: url.password,
  database: url.pathname.replace('/', ''),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00', // UTC per SRS §21.4
  ssl: url.hostname !== 'localhost' && url.hostname !== '127.0.0.1' ? { rejectUnauthorized: false } : undefined,
});

export default pool;
