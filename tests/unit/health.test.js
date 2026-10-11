import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/main/app.js';

describe('App & Health check', () => {
  it('should return 200 and status ok on /health', async () => {
    const app = createApp();
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should serve swagger docs at /docs', async () => {
    const app = createApp();
    const response = await request(app).get('/docs/');

    expect(response.status).toBe(200);
  });
});
