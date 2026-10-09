import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Attach a unique requestId to every API call for traceability (SRS §17.1).
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers['x-request-id'] as string) || `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  req.headers['x-request-id'] = id;
  res.setHeader('X-Request-Id', id);
  next();
}
