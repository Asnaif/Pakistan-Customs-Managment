import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  userId: number;
  email: string;
  roleId: number;
  roleName: string;
  ports: number[]; // empty = national scope
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

/**
 * Middleware: Verify JWT and attach user payload to request.
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing or invalid token.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Token is expired or invalid.' });
  }
}

/**
 * Middleware factory: Restrict access to specific role names.
 */
export function authorize(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ code: 'UNAUTHORIZED', message: 'Not authenticated.' });
      return;
    }
    if (!allowedRoles.includes(req.user.roleName)) {
      res.status(403).json({ code: 'FORBIDDEN', message: 'Insufficient permissions.' });
      return;
    }
    next();
  };
}

/**
 * Derives the SQL port constraint for the current user.
 * National-scope users (empty ports array) get no port filter.
 * Port-scoped users get their assigned ports.
 * If a specific portId query param is requested, validate it against scope.
 */
export function getPortScope(user: AuthPayload, requestedPortId?: number): {
  portIds: number[] | null; // null = national (all ports)
  error: string | null;
} {
  const isNational = user.ports.length === 0;

  if (requestedPortId) {
    if (!isNational && !user.ports.includes(requestedPortId)) {
      return { portIds: null, error: 'PORT_SCOPE_VIOLATION' };
    }
    return { portIds: [requestedPortId], error: null };
  }

  if (isNational) {
    return { portIds: null, error: null }; // null = no port filter
  }

  return { portIds: user.ports, error: null };
}

/**
 * Generate a JWT token for the given payload.
 */
export function generateToken(payload: AuthPayload): string {
  return jwt.sign({ ...payload }, JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as string,
  } as jwt.SignOptions);
}
