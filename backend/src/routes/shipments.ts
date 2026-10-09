import { Router } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import { authenticate, AuthenticatedRequest, getPortScope } from '../middleware/auth';

const router = Router();

/**
 * GET /api/v1/shipments/anomalies
 * List valuation anomaly candidates with server-side pagination (SRS FR-REV-005, FR-REV-006, §15.4).
 */
router.get('/shipments/anomalies', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { startDate, endDate, portId, hsCode, page = '1', pageSize = '25', sortBy = 'deviation_pct', sortDir = 'desc' } = req.query;
    const scope = getPortScope(req.user!, portId ? Number(portId) : undefined);
    if (scope.error) {
      res.status(403).json({ code: scope.error, message: 'Port scope violation.' });
      return;
    }

    const params: any[] = [];
    let portClause = '';
    if (scope.portIds) {
      const placeholders = scope.portIds.map(() => '?').join(',');
      portClause = `AND s.port_id IN (${placeholders})`;
      params.push(...scope.portIds);
    }

    let hsClause = '';
    if (hsCode) {
      hsClause = `AND s.hs_code = ?`;
      params.push(hsCode);
    }

    const sd = (startDate as string) || '2025-01-01';
    const ed = (endDate as string) || '2026-12-31';
    const threshold = 30; // configurable default

    const baseWhere = `
      WHERE ((h.historical_avg_value - s.declared_value) / NULLIF(h.historical_avg_value, 0)) * 100 >= ${threshold}
        AND s.arrival_time >= ? AND s.arrival_time < ?
        ${portClause}
        ${hsClause}
    `;
    const baseParams = [...params, sd, ed];

    // Reorder params: portIds first (in portClause), then dates, then hsCode already pushed
    // Actually let's rebuild cleanly
    const whereParams: any[] = [sd, ed];
    let where = `WHERE ((h.historical_avg_value - s.declared_value) / NULLIF(h.historical_avg_value, 0)) * 100 >= ${threshold}
        AND s.arrival_time >= ? AND s.arrival_time < ?`;
    if (scope.portIds) {
      where += ` AND s.port_id IN (${scope.portIds.map(() => '?').join(',')})`;
      whereParams.push(...scope.portIds);
    }
    if (hsCode) {
      where += ` AND s.hs_code = ?`;
      whereParams.push(hsCode);
    }

    // Count
    const [countRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS totalRows
       FROM shipments s
       JOIN hs_codes h ON h.hs_code = s.hs_code
       ${where}`,
      whereParams
    );

    const totalRows = Number(countRows[0].totalRows);
    const pg = Math.max(1, Number(page));
    const ps = Math.min(100, Math.max(1, Number(pageSize)));
    const offset = (pg - 1) * ps;

    // Validate sortBy
    const allowedSorts: Record<string, string> = {
      deviation_pct: 'deviation_pct',
      declared_value: 's.declared_value',
      revenue_gap: 'revenue_gap',
      arrival_time: 's.arrival_time',
      port_name: 'p.port_name',
    };
    const orderCol = allowedSorts[sortBy as string] || 'deviation_pct';
    const orderDir = (sortDir as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         s.shipment_id, s.port_id, p.port_name, s.hs_code, h.description AS hs_description,
         s.declared_value, h.historical_avg_value AS reference_value,
         ROUND(((h.historical_avg_value - s.declared_value) / NULLIF(h.historical_avg_value, 0)) * 100, 2) AS deviation_pct,
         s.tax_collected,
         ROUND(h.historical_avg_value * h.standard_tax_rate / 100, 2) AS theoretical_revenue,
         ROUND(GREATEST(0, (h.historical_avg_value * h.standard_tax_rate / 100) - s.tax_collected), 2) AS revenue_gap,
         s.arrival_time
       FROM shipments s
       JOIN hs_codes h ON h.hs_code = s.hs_code
       JOIN ports p ON p.port_id = s.port_id
       ${where}
       ORDER BY ${orderCol} ${orderDir}
       LIMIT ? OFFSET ?`,
      [...whereParams, ps, offset]
    );

    res.json({
      data: rows,
      totalRows,
      page: pg,
      pageSize: ps,
    });
  } catch (err) {
    console.error('Anomalies error:', err);
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
  }
});

/**
 * GET /api/v1/shipments/:id
 * Shipment detail (SRS §15.4).
 */
router.get('/shipments/:id', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const scope = getPortScope(req.user!);

    let portClause = '';
    const params: any[] = [req.params.id];
    if (scope.portIds) {
      portClause = `AND s.port_id IN (${scope.portIds.map(() => '?').join(',')})`;
      params.push(...scope.portIds);
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT s.*, p.port_name, h.description AS hs_description, h.historical_avg_value, h.standard_tax_rate
       FROM shipments s
       JOIN ports p ON p.port_id = s.port_id
       JOIN hs_codes h ON h.hs_code = s.hs_code
       WHERE s.shipment_id = ? ${portClause}`,
      params
    );

    if (rows.length === 0) {
      res.status(404).json({ code: 'NOT_FOUND', message: 'Shipment not found or not authorized.' });
      return;
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Shipment detail error:', err);
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
  }
});

/**
 * GET /api/v1/ports
 * Authorized port list (SRS §15.4).
 */
router.get('/ports', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const scope = getPortScope(req.user!);

    let query = `SELECT * FROM ports WHERE is_active = TRUE`;
    const params: any[] = [];

    if (scope.portIds) {
      query += ` AND port_id IN (${scope.portIds.map(() => '?').join(',')})`;
      params.push(...scope.portIds);
    }

    query += ` ORDER BY port_name`;
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    res.json(rows);
  } catch (err) {
    console.error('Ports error:', err);
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
  }
});

/**
 * GET /api/v1/hs-codes
 * HS master search (SRS §15.4).
 */
router.get('/hs-codes', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { search } = req.query;
    let query = `SELECT * FROM hs_codes WHERE is_active = TRUE`;
    const params: any[] = [];

    if (search) {
      query += ` AND (hs_code LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY hs_code LIMIT 100`;
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    res.json(rows);
  } catch (err) {
    console.error('HS codes error:', err);
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
  }
});

export default router;
