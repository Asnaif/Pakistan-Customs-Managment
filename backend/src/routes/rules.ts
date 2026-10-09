import { Router } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth';
import { writeAuditLog } from '../services/auditService';

const router = Router();

/**
 * GET /api/v1/rules
 * List rules (SRS FR-RULE-001, §15.5).
 */
router.get('/rules', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM kpi_rules ORDER BY rule_id`
    );
    res.json(rows);
  } catch (err) {
    console.error('Rules list error:', err);
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
  }
});

/**
 * POST /api/v1/rules
 * Create rule (SRS FR-RULE-001, FR-RULE-008).
 */
router.post('/rules',
  authenticate,
  authorize('National Auditor', 'System Administrator'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { rule_id, metric_code, operator, threshold_value, scope_type, scope_id, severity, active_from, active_to, enabled } = req.body;

      if (!rule_id || !metric_code || !operator || threshold_value === undefined || !scope_type || !severity) {
        res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Missing required fields.' });
        return;
      }

      await pool.execute(
        `INSERT INTO kpi_rules (rule_id, metric_code, operator, threshold_value, scope_type, scope_id, severity, active_from, active_to, enabled)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [rule_id, metric_code, operator, threshold_value, scope_type, scope_id || null, severity, active_from || null, active_to || null, enabled !== false]
      );

      await writeAuditLog(req.user!.userId, 'RULE_CREATED', 'KPI_RULE', String(rule_id), req.body, (req.ip as string) || null);

      res.status(201).json({ message: 'Rule created.', rule_id });
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(409).json({ code: 'CONFLICT', message: 'Rule ID already exists.' });
        return;
      }
      console.error('Rule create error:', err);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
    }
  }
);

/**
 * PATCH /api/v1/rules/:id
 * Update rule (SRS FR-RULE-008).
 */
router.patch('/rules/:id',
  authenticate,
  authorize('National Auditor', 'System Administrator'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const ruleId = req.params.id;
      const fields = req.body;
      const allowedFields = ['metric_code', 'operator', 'threshold_value', 'scope_type', 'scope_id', 'severity', 'active_from', 'active_to', 'enabled'];
      const updates: string[] = [];
      const params: any[] = [];

      for (const key of allowedFields) {
        if (fields[key] !== undefined) {
          updates.push(`${key} = ?`);
          params.push(fields[key]);
        }
      }

      if (updates.length === 0) {
        res.status(400).json({ code: 'VALIDATION_ERROR', message: 'No valid fields to update.' });
        return;
      }

      params.push(ruleId);
      const [result] = await pool.execute(
        `UPDATE kpi_rules SET ${updates.join(', ')} WHERE rule_id = ?`,
        params
      );

      await writeAuditLog(req.user!.userId, 'RULE_UPDATED', 'KPI_RULE', String(ruleId), fields, (req.ip as string) || null);

      res.json({ message: 'Rule updated.' });
    } catch (err) {
      console.error('Rule update error:', err);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
    }
  }
);

/**
 * DELETE /api/v1/rules/:id
 * Disable/delete rule (SRS §15.5).
 */
router.delete('/rules/:id',
  authenticate,
  authorize('National Auditor', 'System Administrator'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const ruleId = req.params.id;
      await pool.execute(`UPDATE kpi_rules SET enabled = FALSE WHERE rule_id = ?`, [ruleId]);
      await writeAuditLog(req.user!.userId, 'RULE_DISABLED', 'KPI_RULE', String(ruleId), {}, (req.ip as string) || null);
      res.json({ message: 'Rule disabled.' });
    } catch (err) {
      console.error('Rule delete error:', err);
      res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
    }
  }
);

/**
 * GET /api/v1/alerts
 * List alerts (SRS FR-RULE-010, §15.5).
 */
router.get('/alerts', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { status, severity, page = '1', pageSize = '25' } = req.query;
    let where = 'WHERE 1=1';
    const params: any[] = [];

    if (status) {
      where += ` AND a.status = ?`;
      params.push(status);
    }
    if (severity) {
      where += ` AND a.severity = ?`;
      params.push(severity);
    }

    const pg = Math.max(1, Number(page));
    const ps = Math.min(100, Math.max(1, Number(pageSize)));
    const offset = (pg - 1) * ps;

    const [countRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS totalRows FROM alerts a ${where}`, params
    );

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT a.*, r.metric_code AS rule_metric
       FROM alerts a
       LEFT JOIN kpi_rules r ON r.rule_id = a.rule_id
       ${where}
       ORDER BY a.created_at DESC
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
    console.error('Alerts list error:', err);
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
  }
});

/**
 * PATCH /api/v1/alerts/:id/acknowledge
 * Acknowledge alert (SRS FR-RULE-005).
 */
router.patch('/alerts/:id/acknowledge', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const alertId = req.params.id;
    await pool.execute(
      `UPDATE alerts SET status = 'ACKNOWLEDGED', acknowledged_at = NOW() WHERE alert_id = ? AND status = 'NEW'`,
      [alertId]
    );

    await writeAuditLog(req.user!.userId, 'ALERT_ACKNOWLEDGED', 'ALERT', String(alertId), {}, (req.ip as string) || null);
    res.json({ message: 'Alert acknowledged.' });
  } catch (err) {
    console.error('Alert acknowledge error:', err);
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
  }
});

export default router;
