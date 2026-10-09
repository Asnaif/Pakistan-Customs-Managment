import { Router } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import { authenticate, AuthenticatedRequest, getPortScope } from '../middleware/auth';

const router = Router();

/**
 * Build the port-scope WHERE clause fragment.
 */
function buildPortFilter(portIds: number[] | null, alias: string = 's'): { clause: string; params: any[] } {
  if (!portIds) return { clause: '', params: [] };
  const placeholders = portIds.map(() => '?').join(',');
  return { clause: `AND ${alias}.port_id IN (${placeholders})`, params: portIds };
}

/**
 * GET /api/v1/metrics/summary
 * Executive KPI summary (SRS FR-DASH-001, FR-DASH-007, §15.3).
 */
router.get('/metrics/summary', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { startDate, endDate, portId } = req.query;
    const scope = getPortScope(req.user!, portId ? Number(portId) : undefined);
    if (scope.error) {
      res.status(403).json({ code: scope.error, message: 'Port scope violation.' });
      return;
    }

    const port = buildPortFilter(scope.portIds);
    const dateParams = [startDate || '2025-01-01', endDate || '2026-12-31'];

    // Total revenue
    const [revRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(s.tax_collected), 0) AS totalRevenue
       FROM shipments s
       WHERE s.arrival_time >= ? AND s.arrival_time < ? ${port.clause}`,
      [...dateParams, ...port.params]
    );

    // Average clearance time
    const [trsRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(AVG(TIMESTAMPDIFF(MINUTE, s.arrival_time, s.release_time)) / 60, 0) AS avgHours
       FROM shipments s
       WHERE s.release_time IS NOT NULL
         AND s.arrival_time <= s.release_time
         AND s.arrival_time >= ? AND s.arrival_time < ? ${port.clause}`,
      [...dateParams, ...port.params]
    );

    // Shipment volume
    const [volRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS shipmentVolume
       FROM shipments s
       WHERE s.arrival_time >= ? AND s.arrival_time < ? ${port.clause}`,
      [...dateParams, ...port.params]
    );

    // Anomaly count (deviation >= 30% default threshold)
    const [anomRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS anomalyCount
       FROM shipments s
       JOIN hs_codes h ON h.hs_code = s.hs_code
       WHERE ((h.historical_avg_value - s.declared_value) / NULLIF(h.historical_avg_value, 0)) * 100 >= 30
         AND s.arrival_time >= ? AND s.arrival_time < ? ${port.clause}`,
      [...dateParams, ...port.params]
    );

    // Flagged / Seized counts
    const [enfRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         SUM(CASE WHEN s.inspection_status = 'Flagged' THEN 1 ELSE 0 END) AS flaggedCount,
         SUM(CASE WHEN s.inspection_status = 'Seized' THEN 1 ELSE 0 END) AS seizureCount
       FROM shipments s
       WHERE s.arrival_time >= ? AND s.arrival_time < ? ${port.clause}`,
      [...dateParams, ...port.params]
    );

    // Analytical revenue gap
    const [gapRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(
         GREATEST(0, (h.historical_avg_value * h.standard_tax_rate / 100) - s.tax_collected)
       ), 0) AS analyticalRevenueGap
       FROM shipments s
       JOIN hs_codes h ON h.hs_code = s.hs_code
       WHERE s.arrival_time >= ? AND s.arrival_time < ? ${port.clause}`,
      [...dateParams, ...port.params]
    );

    // Open alerts
    const [alertRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS openAlertCount FROM alerts WHERE status IN ('NEW', 'ACKNOWLEDGED')`
    );

    res.json({
      filters: { startDate: startDate || '2025-01-01', endDate: endDate || '2026-12-31', portId: portId ? Number(portId) : null },
      totalRevenue: Number(revRows[0].totalRevenue),
      averageClearanceHours: Number(Number(trsRows[0].avgHours).toFixed(2)),
      shipmentVolume: Number(volRows[0].shipmentVolume),
      anomalyCount: Number(anomRows[0].anomalyCount),
      flaggedCount: Number(enfRows[0].flaggedCount),
      seizureCount: Number(enfRows[0].seizureCount),
      analyticalRevenueGap: Number(Number(gapRows[0].analyticalRevenueGap).toFixed(2)),
      openAlertCount: Number(alertRows[0].openAlertCount),
    });
  } catch (err) {
    console.error('Metrics summary error:', err);
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
  }
});

/**
 * GET /api/v1/metrics/trs
 * Monthly TRS metrics (SRS FR-TRS-001 through FR-TRS-008, §15.3).
 */
router.get('/metrics/trs', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { startDate, endDate, portId } = req.query;
    const scope = getPortScope(req.user!, portId ? Number(portId) : undefined);
    if (scope.error) {
      res.status(403).json({ code: scope.error, message: 'Port scope violation.' });
      return;
    }

    const port = buildPortFilter(scope.portIds);
    const dateParams = [startDate || '2025-01-01', endDate || '2026-12-31'];

    // Summary stats
    const [summaryRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         AVG(TIMESTAMPDIFF(MINUTE, s.arrival_time, s.release_time)) / 60 AS averageHours,
         MIN(TIMESTAMPDIFF(MINUTE, s.arrival_time, s.release_time)) / 60 AS minHours,
         MAX(TIMESTAMPDIFF(MINUTE, s.arrival_time, s.release_time)) / 60 AS maxHours,
         COUNT(*) AS total
       FROM shipments s
       WHERE s.release_time IS NOT NULL
         AND s.arrival_time <= s.release_time
         AND s.arrival_time >= ? AND s.arrival_time < ? ${port.clause}`,
      [...dateParams, ...port.params]
    );

    // Median and P90 (using sorted durations — for prototype, acceptable approach)
    const [durationRows] = await pool.execute<RowDataPacket[]>(
      `SELECT TIMESTAMPDIFF(MINUTE, s.arrival_time, s.release_time) / 60 AS hours
       FROM shipments s
       WHERE s.release_time IS NOT NULL
         AND s.arrival_time <= s.release_time
         AND s.arrival_time >= ? AND s.arrival_time < ? ${port.clause}
       ORDER BY hours`,
      [...dateParams, ...port.params]
    );

    const durations = durationRows.map((r: any) => Number(r.hours));
    const medianHours = durations.length > 0 ? durations[Math.floor(durations.length * 0.5)] : 0;
    const p90Hours = durations.length > 0 ? durations[Math.floor(durations.length * 0.9)] : 0;

    // Target compliance (< 72 hours)
    const withinTarget = durations.filter(d => d <= 72).length;
    const targetCompliancePct = durations.length > 0 ? (withinTarget / durations.length) * 100 : 0;

    // Monthly series
    const [seriesRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         DATE_FORMAT(s.arrival_time, '%Y-%m') AS month,
         AVG(TIMESTAMPDIFF(MINUTE, s.arrival_time, s.release_time)) / 60 AS averageHours,
         COUNT(*) AS shipmentCount
       FROM shipments s
       WHERE s.release_time IS NOT NULL
         AND s.arrival_time <= s.release_time
         AND s.arrival_time >= ? AND s.arrival_time < ? ${port.clause}
       GROUP BY DATE_FORMAT(s.arrival_time, '%Y-%m')
       ORDER BY month`,
      [...dateParams, ...port.params]
    );

    // Bottleneck ranking — per-port average release time (FR-TRS-004, FR-TRS-008)
    const [bottleneckRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         s.port_id, p.port_name,
         AVG(TIMESTAMPDIFF(MINUTE, s.arrival_time, s.release_time)) / 60 AS averageHours,
         COUNT(*) AS shipmentCount
       FROM shipments s
       JOIN ports p ON p.port_id = s.port_id
       WHERE s.release_time IS NOT NULL
         AND s.arrival_time <= s.release_time
         AND s.arrival_time >= ? AND s.arrival_time < ? ${port.clause}
       GROUP BY s.port_id, p.port_name
       ORDER BY averageHours DESC`,
      [...dateParams, ...port.params]
    );

    // Distribution buckets (SRS FR-TRS-007)
    const buckets = [
      { label: '<6h', min: 0, max: 6 },
      { label: '6-24h', min: 6, max: 24 },
      { label: '24-72h', min: 24, max: 72 },
      { label: '>72h', min: 72, max: Infinity },
    ];
    const distribution = buckets.map(b => {
      const count = durations.filter(d => d >= b.min && (b.max === Infinity ? true : d < b.max)).length;
      return { label: b.label, count, percentage: durations.length > 0 ? Number(((count / durations.length) * 100).toFixed(2)) : 0 };
    });

    res.json({
      filters: { startDate: startDate || '2025-01-01', endDate: endDate || '2026-12-31', portId: portId ? Number(portId) : null },
      summary: {
        averageHours: Number(Number(summaryRows[0].averageHours || 0).toFixed(2)),
        medianHours: Number(medianHours.toFixed(2)),
        p90Hours: Number(p90Hours.toFixed(2)),
        minHours: Number(Number(summaryRows[0].minHours || 0).toFixed(2)),
        maxHours: Number(Number(summaryRows[0].maxHours || 0).toFixed(2)),
        targetCompliancePct: Number(targetCompliancePct.toFixed(2)),
      },
      series: seriesRows.map((r: any) => ({
        month: r.month,
        averageHours: Number(Number(r.averageHours).toFixed(2)),
        medianHours: 0,
        shipmentCount: r.shipmentCount,
      })),
      distribution,
      bottleneckRanking: bottleneckRows.map((r: any) => ({
        portId: r.port_id,
        portName: r.port_name,
        averageHours: Number(Number(r.averageHours).toFixed(2)),
        shipmentCount: Number(r.shipmentCount),
        exceedsTarget: Number(r.averageHours) > 72,
      })),
    });
  } catch (err) {
    console.error('TRS metrics error:', err);
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
  }
});

/**
 * GET /api/v1/metrics/revenue
 * Revenue and valuation analytics (SRS FR-REV-001 through FR-REV-007, §15.3).
 */
router.get('/metrics/revenue', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { startDate, endDate, portId } = req.query;
    const scope = getPortScope(req.user!, portId ? Number(portId) : undefined);
    if (scope.error) {
      res.status(403).json({ code: scope.error, message: 'Port scope violation.' });
      return;
    }

    const port = buildPortFilter(scope.portIds);
    const dateParams = [startDate || '2025-01-01', endDate || '2026-12-31'];

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         COALESCE(SUM(s.tax_collected), 0) AS totalActualRevenue,
         COALESCE(SUM(h.historical_avg_value * h.standard_tax_rate / 100), 0) AS totalTheoreticalRevenue,
         COALESCE(SUM(GREATEST(0, (h.historical_avg_value * h.standard_tax_rate / 100) - s.tax_collected)), 0) AS analyticalRevenueGap,
         COUNT(CASE WHEN ((h.historical_avg_value - s.declared_value) / NULLIF(h.historical_avg_value, 0)) * 100 >= 30 THEN 1 END) AS anomalyCount
       FROM shipments s
       JOIN hs_codes h ON h.hs_code = s.hs_code
       WHERE s.arrival_time >= ? AND s.arrival_time < ? ${port.clause}`,
      [...dateParams, ...port.params]
    );

    // Monthly revenue series (FR-DASH-002)
    const [seriesRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         DATE_FORMAT(s.arrival_time, '%Y-%m') AS month,
         COALESCE(SUM(s.tax_collected), 0) AS actualRevenue,
         COALESCE(SUM(h.historical_avg_value * h.standard_tax_rate / 100), 0) AS theoreticalRevenue,
         COALESCE(SUM(GREATEST(0, (h.historical_avg_value * h.standard_tax_rate / 100) - s.tax_collected)), 0) AS revenueGap,
         COUNT(*) AS shipmentCount
       FROM shipments s
       JOIN hs_codes h ON h.hs_code = s.hs_code
       WHERE s.arrival_time >= ? AND s.arrival_time < ? ${port.clause}
       GROUP BY DATE_FORMAT(s.arrival_time, '%Y-%m')
       ORDER BY month`,
      [...dateParams, ...port.params]
    );

    // Top 10 HS codes by revenue gap (FR-REV-007)
    const [topHsRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         s.hs_code, h.description AS hs_description,
         COALESCE(SUM(GREATEST(0, (h.historical_avg_value * h.standard_tax_rate / 100) - s.tax_collected)), 0) AS totalGap,
         COUNT(*) AS shipmentCount
       FROM shipments s
       JOIN hs_codes h ON h.hs_code = s.hs_code
       WHERE s.arrival_time >= ? AND s.arrival_time < ? ${port.clause}
       GROUP BY s.hs_code, h.description
       ORDER BY totalGap DESC
       LIMIT 10`,
      [...dateParams, ...port.params]
    );

    // Top 10 ports by revenue gap (FR-REV-007)
    const [topPortRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         s.port_id, p.port_name,
         COALESCE(SUM(GREATEST(0, (h.historical_avg_value * h.standard_tax_rate / 100) - s.tax_collected)), 0) AS totalGap,
         COUNT(*) AS shipmentCount
       FROM shipments s
       JOIN hs_codes h ON h.hs_code = s.hs_code
       JOIN ports p ON p.port_id = s.port_id
       WHERE s.arrival_time >= ? AND s.arrival_time < ? ${port.clause}
       GROUP BY s.port_id, p.port_name
       ORDER BY totalGap DESC
       LIMIT 10`,
      [...dateParams, ...port.params]
    );

    const actual = Number(rows[0].totalActualRevenue);
    const theoretical = Number(rows[0].totalTheoreticalRevenue);
    const gap = Number(rows[0].analyticalRevenueGap);

    res.json({
      filters: { startDate: startDate || '2025-01-01', endDate: endDate || '2026-12-31', portId: portId ? Number(portId) : null },
      summary: {
        totalActualRevenue: Number(actual.toFixed(2)),
        totalTheoreticalRevenue: Number(theoretical.toFixed(2)),
        analyticalRevenueGap: Number(gap.toFixed(2)),
        revenueGapPct: theoretical > 0 ? Number(((gap / theoretical) * 100).toFixed(2)) : 0,
        anomalyCount: Number(rows[0].anomalyCount),
      },
      series: seriesRows.map((r: any) => ({
        month: r.month,
        actualRevenue: Number(Number(r.actualRevenue).toFixed(2)),
        theoreticalRevenue: Number(Number(r.theoreticalRevenue).toFixed(2)),
        revenueGap: Number(Number(r.revenueGap).toFixed(2)),
        shipmentCount: Number(r.shipmentCount),
      })),
      topHsCodes: topHsRows.map((r: any) => ({
        hsCode: r.hs_code,
        description: r.hs_description,
        totalGap: Number(Number(r.totalGap).toFixed(2)),
        shipmentCount: Number(r.shipmentCount),
      })),
      topPorts: topPortRows.map((r: any) => ({
        portId: r.port_id,
        portName: r.port_name,
        totalGap: Number(Number(r.totalGap).toFixed(2)),
        shipmentCount: Number(r.shipmentCount),
      })),
    });
  } catch (err) {
    console.error('Revenue metrics error:', err);
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
  }
});

/**
 * GET /api/v1/metrics/enforcement
 * Flag/seizure counts and rates (SRS FR-ENF-001 through FR-ENF-006, §15.3).
 */
router.get('/metrics/enforcement', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { startDate, endDate, portId } = req.query;
    const scope = getPortScope(req.user!, portId ? Number(portId) : undefined);
    if (scope.error) {
      res.status(403).json({ code: scope.error, message: 'Port scope violation.' });
      return;
    }

    const port = buildPortFilter(scope.portIds);
    const dateParams = [startDate || '2025-01-01', endDate || '2026-12-31'];

    // Summary
    const [summaryRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         COUNT(*) AS totalShipments,
         SUM(CASE WHEN s.inspection_status = 'Cleared' THEN 1 ELSE 0 END) AS clearedCount,
         SUM(CASE WHEN s.inspection_status = 'Flagged' THEN 1 ELSE 0 END) AS flaggedCount,
         SUM(CASE WHEN s.inspection_status = 'Seized' THEN 1 ELSE 0 END) AS seizedCount
       FROM shipments s
       WHERE s.arrival_time >= ? AND s.arrival_time < ? ${port.clause}`,
      [...dateParams, ...port.params]
    );

    const total = Number(summaryRows[0].totalShipments);
    const flagged = Number(summaryRows[0].flaggedCount);
    const seized = Number(summaryRows[0].seizedCount);
    const hitRate = flagged > 0 ? Number(((seized / flagged) * 100).toFixed(2)) : 0;

    // Monthly trend
    const [seriesRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         DATE_FORMAT(s.arrival_time, '%Y-%m') AS month,
         SUM(CASE WHEN s.inspection_status = 'Cleared' THEN 1 ELSE 0 END) AS clearedCount,
         SUM(CASE WHEN s.inspection_status = 'Flagged' THEN 1 ELSE 0 END) AS flaggedCount,
         SUM(CASE WHEN s.inspection_status = 'Seized' THEN 1 ELSE 0 END) AS seizedCount,
         COUNT(*) AS total
       FROM shipments s
       WHERE s.arrival_time >= ? AND s.arrival_time < ? ${port.clause}
       GROUP BY DATE_FORMAT(s.arrival_time, '%Y-%m')
       ORDER BY month`,
      [...dateParams, ...port.params]
    );

    // Per-port enforcement comparison (FR-ENF-005, FR-ENF-006)
    const [portRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         s.port_id, p.port_name,
         COUNT(*) AS totalShipments,
         SUM(CASE WHEN s.inspection_status = 'Flagged' THEN 1 ELSE 0 END) AS flaggedCount,
         SUM(CASE WHEN s.inspection_status = 'Seized' THEN 1 ELSE 0 END) AS seizedCount
       FROM shipments s
       JOIN ports p ON p.port_id = s.port_id
       WHERE s.arrival_time >= ? AND s.arrival_time < ? ${port.clause}
       GROUP BY s.port_id, p.port_name
       ORDER BY totalShipments DESC`,
      [...dateParams, ...port.params]
    );

    res.json({
      filters: { startDate: startDate || '2025-01-01', endDate: endDate || '2026-12-31', portId: portId ? Number(portId) : null },
      summary: {
        totalShipments: total,
        clearedCount: Number(summaryRows[0].clearedCount),
        flaggedCount: flagged,
        seizedCount: seized,
        flagRate: total > 0 ? Number(((flagged / total) * 100).toFixed(2)) : 0,
        seizureRate: total > 0 ? Number(((seized / total) * 100).toFixed(2)) : 0,
        hitRate,
      },
      series: seriesRows.map((r: any) => {
        const t = Number(r.total);
        return {
          month: r.month,
          clearedCount: Number(r.clearedCount),
          flaggedCount: Number(r.flaggedCount),
          seizedCount: Number(r.seizedCount),
          flagRate: t > 0 ? Number(((Number(r.flaggedCount) / t) * 100).toFixed(2)) : 0,
          seizureRate: t > 0 ? Number(((Number(r.seizedCount) / t) * 100).toFixed(2)) : 0,
        };
      }),
      portComparison: portRows.map((r: any) => {
        const pt = Number(r.totalShipments);
        return {
          portId: r.port_id,
          portName: r.port_name,
          totalShipments: pt,
          flaggedCount: Number(r.flaggedCount),
          seizedCount: Number(r.seizedCount),
          flagRate: pt > 0 ? Number(((Number(r.flaggedCount) / pt) * 100).toFixed(2)) : 0,
          seizureRate: pt > 0 ? Number(((Number(r.seizedCount) / pt) * 100).toFixed(2)) : 0,
        };
      }),
    });
  } catch (err) {
    console.error('Enforcement metrics error:', err);
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
  }
});

/**
 * GET /api/v1/metrics/org
 * Organizational KPI scorecard (SRS FR-ORG-001 through FR-ORG-005, §15.3).
 */
router.get('/metrics/org', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    const { startDate, endDate, portId } = req.query;
    const scope = getPortScope(req.user!, portId ? Number(portId) : undefined);
    if (scope.error) {
      res.status(403).json({ code: scope.error, message: 'Port scope violation.' });
      return;
    }

    const port = buildPortFilter(scope.portIds, 'om');
    const start = (startDate as string || '2025-01').substring(0, 7);
    const end = (endDate as string || '2026-12').substring(0, 7);

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT om.*, p.port_name
       FROM org_metrics om
       JOIN ports p ON p.port_id = om.port_id
       WHERE om.metric_month >= ? AND om.metric_month <= ? ${port.clause}
       ORDER BY om.metric_month, om.port_id`,
      [start, end, ...port.params]
    );

    res.json({
      filters: { startDate: start, endDate: end, portId: portId ? Number(portId) : null },
      metrics: rows,
    });
  } catch (err) {
    console.error('Org metrics error:', err);
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' });
  }
});

export default router;
