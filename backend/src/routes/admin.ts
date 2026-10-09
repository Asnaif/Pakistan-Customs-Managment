import { Router } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { writeAuditLog } from '../services/auditService';

const router = Router();

/**
 * GET /api/v1/admin/users
 * List users (SRS FR-ADM-001).
 */
router.get('/admin/users',
  authenticate,
  authorize('System Administrator'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT u.user_id, u.email, u.role_id, r.role_name, u.status, u.created_at
         FROM users u
         JOIN roles r ON r.role_id = u.role_id
         ORDER BY u.user_id`
      );
      res.json(rows);
    } catch (err) {
      console.error('Admin users list error:', err);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
    }
  }
);

/**
 * POST /api/v1/admin/users
 * Create user (SRS FR-ADM-001).
 */
router.post('/admin/users',
  authenticate,
  authorize('System Administrator'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { email, password, role_id, ports } = req.body;
      if (!email || !password || !role_id) {
        res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Email, password, and role_id are required.' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const [result] = await pool.execute(
        `INSERT INTO users (email, password_hash, role_id) VALUES (?, ?, ?)`,
        [email, passwordHash, role_id]
      );

      const userId = (result as any).insertId;

      // Assign ports if provided (SRS FR-ADM-003)
      if (ports && Array.isArray(ports)) {
        for (const portId of ports) {
          await pool.execute(`INSERT INTO user_ports (user_id, port_id) VALUES (?, ?)`, [userId, portId]);
        }
      }

      await writeAuditLog(req.user!.userId, 'USER_CREATED', 'USER', String(userId), { email, role_id, ports }, (req.ip as string) || null);

      res.status(201).json({ message: 'User created.', user_id: userId });
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(409).json({ code: 'CONFLICT', message: 'Email already exists.' });
        return;
      }
      console.error('Admin user create error:', err);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
    }
  }
);

/**
 * PATCH /api/v1/admin/users/:id
 * Update user (SRS FR-ADM-001, FR-ADM-002).
 */
router.patch('/admin/users/:id',
  authenticate,
  authorize('System Administrator'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.params.id;
      const { role_id, status, ports } = req.body;

      if (role_id !== undefined) {
        await pool.execute(`UPDATE users SET role_id = ? WHERE user_id = ?`, [role_id, userId]);
      }
      if (status !== undefined) {
        await pool.execute(`UPDATE users SET status = ? WHERE user_id = ?`, [status, userId]);
      }
      if (ports && Array.isArray(ports)) {
        await pool.execute(`DELETE FROM user_ports WHERE user_id = ?`, [userId]);
        for (const portId of ports) {
          await pool.execute(`INSERT INTO user_ports (user_id, port_id) VALUES (?, ?)`, [userId, portId]);
        }
      }

      await writeAuditLog(req.user!.userId, 'USER_UPDATED', 'USER', String(userId), req.body, (req.ip as string) || null);
      res.json({ message: 'User updated.' });
    } catch (err) {
      console.error('Admin user update error:', err);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
    }
  }
);

/**
 * GET /api/v1/admin/audit-logs
 * Audit log list (SRS FR-ADM-006, §12.2).
 */
router.get('/admin/audit-logs',
  authenticate,
  authorize('System Administrator', 'National Auditor'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { page = '1', pageSize = '25', action, userId: filterUserId } = req.query;
      const pg = Math.max(1, Number(page));
      const ps = Math.min(100, Math.max(1, Number(pageSize)));
      const offset = (pg - 1) * ps;

      let where = 'WHERE 1=1';
      const params: any[] = [];

      if (action) {
        where += ` AND al.action = ?`;
        params.push(action);
      }
      if (filterUserId) {
        where += ` AND al.user_id = ?`;
        params.push(filterUserId);
      }

      const [countRows] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) AS totalRows FROM audit_logs al ${where}`, params
      );

      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT al.*, u.email AS user_email
         FROM audit_logs al
         LEFT JOIN users u ON u.user_id = al.user_id
         ${where}
         ORDER BY al.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, ps, offset]
      );

      res.json({
        data: rows,
        totalRows: Number(countRows[0].totalRows),
        page: pg,
        pageSize: ps,
      });
    } catch (err) {
      console.error('Audit log list error:', err);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
    }
  }
);

export default router;
