import { Router, Request, Response, NextFunction } from 'express';
import { askGeminiCustomsChat, getLiveCustomsContext } from '../services/aiService';
import { AuthPayload } from '../middleware/auth';
import { writeAuditLog } from '../services/auditService';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

/**
 * Helper to optionally extract user from token without blocking unauthenticated requests
 */
function optionalAuth(req: Request & { user?: AuthPayload }, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET) as AuthPayload;
    } catch {
      // Ignore token decode errors for optional auth
    }
  }
  next();
}

/**
 * GET /api/v1/ai/status
 * Check AI copilot health and capabilities
 */
router.get('/ai/status', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY || 'AIzaSyD22K2ZG41ovftxbqix7DWtjCU9FuKhQNc');
  res.status(200).json({
    status: 'online',
    model: 'gemini-2.5-flash',
    configured: hasKey,
    features: ['TRS Analysis', 'Revenue Insights', 'Risk Selectivity', 'Urdu & English support', 'Live Context Awareness']
  });
});

/**
 * GET /api/v1/ai/context
 * Retrieve live customs snapshot injected into AI
 */
router.get('/ai/context', async (req, res) => {
  try {
    const context = await getLiveCustomsContext();
    res.status(200).json({ context });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/v1/ai/chat
 * Multi-turn or single query conversational intelligence
 */
router.post('/ai/chat', optionalAuth, async (req: Request & { user?: AuthPayload }, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ error: 'Message is required and must be non-empty.' });
      return;
    }

    const userRole = req.user?.roleName || 'Customs Officer / User';
    const result = await askGeminiCustomsChat(message, history || [], userRole);

    // Optional audit log
    if (req.user?.userId) {
      writeAuditLog(
        req.user.userId,
        'AI_COPILOT_QUERY',
        'AI_CHAT',
        null,
        { querySnippet: message.slice(0, 100), model: result.model },
        req.ip || '127.0.0.1'
      ).catch(() => {});
    }

    res.status(200).json({
      success: true,
      reply: result.reply,
      model: result.model,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[AI Chat Error]:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while communicating with Gemini AI.',
    });
  }
});

export default router;
