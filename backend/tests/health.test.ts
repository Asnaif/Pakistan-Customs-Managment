import request from 'supertest';
import express from 'express';
import healthRoutes from '../src/routes/health';

const app = express();
app.use('/api/v1', healthRoutes);

describe('Health Check API', () => {
  it('should return 200 OK with status and timestamp', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});
