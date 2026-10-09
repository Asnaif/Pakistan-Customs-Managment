import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

function normalizeIp(ip: string | null): string | null {
  if (!ip) return null;
  if (ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1';
  if (ip.startsWith('::ffff:')) return ip.replace('::ffff:', '');
  return ip;
}

/**
 * Write an entry to the audit_logs table (SRS §8.8 FR-ADM-006, §17).
 */
export async function writeAuditLog(
  userId: number | null,
  action: string,
  entityType: string,
  entityId: string | null,
  metadataJson: any,
  ipAddress: string | null
): Promise<void> {
  const cleanIp = normalizeIp(ipAddress);
  await pool.execute(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata_json, ip_address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, action, entityType, entityId, JSON.stringify(metadataJson), cleanIp]
  );
}
