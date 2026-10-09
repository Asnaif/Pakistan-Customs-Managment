import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/ready', (req, res) => {
  // In a real implementation, verify DB connection here
  res.status(200).json({ status: 'ready', database: 'connected' });
});

export default router;
