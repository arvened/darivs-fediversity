import { createApp } from '../app';
import { FastifyInstance } from 'fastify';

describe('DARIVS Application', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://darivs:changeme@localhost:5432/darivs_test';
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Checks', () => {
    test('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('status', 'ok');
      expect(body).toHaveProperty('instance');
      expect(body).toHaveProperty('timestamp');
    });
  });

  describe('API Version', () => {
    test('should return API version', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/version',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('version', '0.1.0');
      expect(body).toHaveProperty('environment', 'test');
      expect(body).toHaveProperty('instance');
    });
  });

  describe('Root Route', () => {
    test('should return API info', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('name', 'DARIVS Fediversity');
      expect(body).toHaveProperty('description');
      expect(body).toHaveProperty('version', '0.1.0');
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 errors', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/nonexistent',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
