import { Router } from 'express';
import pool from '../config/database';
import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2';
import { authenticate, generateToken, AuthenticatedRequest, AuthPayload } from '../middleware/auth';
import { writeAuditLog } from '../services/auditService';

const router = Router();

/**
 * POST /api/v1/auth/login
 * Authenticate and issue access token (SRS FR-AUTH-001, FR-AUTH-002).
 */
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Email and password are required.' });
      return;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT u.user_id, u.email, u.password_hash, u.role_id, u.status,
              r.role_name
       FROM users u
       JOIN roles r ON r.role_id = u.role_id
       WHERE u.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid credentials.' });
      return;
    }

    const user = rows[0];
    if (user.status !== 'ACTIVE') {
      res.status(403).json({ code: 'ACCOUNT_INACTIVE', message: 'Account is deactivated.' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      await writeAuditLog(null, 'LOGIN_FAILED', 'USER', null, { email_hash: 'redacted' }, req.ip || null);
      res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid credentials.' });
      return;
    }

    // Load port scope
    const [portRows] = await pool.execute<RowDataPacket[]>(
      `SELECT port_id FROM user_ports WHERE user_id = ?`,
      [user.user_id]
    );
    const ports = portRows.map((r: any) => r.port_id);

    const payload: AuthPayload = {
      userId: user.user_id,
      email: user.email,
      roleId: user.role_id,
      roleName: user.role_name,
      ports,
    };

    const token = generateToken(payload);

    await writeAuditLog(user.user_id, 'LOGIN_SUCCESS', 'USER', String(user.user_id), {}, req.ip || null);

    res.json({
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name,
        status: user.status,
        ports,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    const isDbError = err?.code === 'ER_ACCESS_DENIED_ERROR' || err?.code === 'ECONNREFUSED';
    const message = isDbError
      ? `Database connection error (${err.code}). Please verify MySQL credentials in backend/.env.`
      : 'An unexpected error occurred.';
    res.status(500).json({ code: 'INTERNAL_ERROR', message });
  }
});

/**
 * GET /api/v1/auth/me
 * Return current authenticated user and role/scope (SRS §15.2).
 */
router.get('/auth/me', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT u.user_id, u.email, u.role_id, r.role_name, u.status
       FROM users u
       JOIN roles r ON r.role_id = u.role_id
       WHERE u.user_id = ?`,
      [user.userId]
    );

    if (rows.length === 0) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'User not found.' });
      return;
    }

    const [portRows] = await pool.execute<RowDataPacket[]>(
      `SELECT port_id FROM user_ports WHERE user_id = ?`,
      [user.userId]
    );

    res.json({
      user: {
        ...rows[0],
        ports: portRows.map((r: any) => r.port_id),
      },
    });
  } catch (err) {
    console.error('Auth/me error:', err);
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
  }
});

/**
 * POST /api/v1/auth/logout
 * Client/session termination (SRS FR-AUTH-005).
 */
router.post('/auth/logout', authenticate, (req: AuthenticatedRequest, res) => {
  // Token invalidation is client-side for prototype. Log the event.
  writeAuditLog(req.user!.userId, 'LOGOUT', 'USER', String(req.user!.userId), {}, req.ip || null);
  res.json({ message: 'Logged out successfully.' });
});

export default router;
