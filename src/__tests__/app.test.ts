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

describe('Transaction Split Calculator', () => {
  const calculateSplit = (amount: number) => {
    return {
      userWin: Math.round(amount * 0.50),
      charityAllocation: Math.round(amount * 0.35),
      platformFee: Math.round(amount * 0.15),
    };
  };

  test('should split 100 correctly', () => {
    const split = calculateSplit(100);
    expect(split.userWin).toBe(50);
    expect(split.charityAllocation).toBe(35);
    expect(split.platformFee).toBe(15);
    expect(split.userWin + split.charityAllocation + split.platformFee).toBe(100);
  });

  test('should split 1000 correctly', () => {
    const split = calculateSplit(1000);
    expect(split.userWin).toBe(500);
    expect(split.charityAllocation).toBe(350);
    expect(split.platformFee).toBe(150);
    expect(split.userWin + split.charityAllocation + split.platformFee).toBe(1000);
  });

  test('should maintain charity minimum 35%', () => {
    for (let amount = 1; amount <= 10000; amount += 100) {
      const split = calculateSplit(amount);
      const charityPercentage = (split.charityAllocation / amount) * 100;
      expect(charityPercentage).toBeGreaterThanOrEqual(34);
    }
  });

  test('should handle edge case 1', () => {
    const split = calculateSplit(1);
    expect(split.charityAllocation).toBeGreaterThanOrEqual(0);
    expect(split.userWin + split.charityAllocation + split.platformFee).toBe(1);
  });

  test('should handle edge case decimals', () => {
    const split = calculateSplit(7.50);
    const total = split.userWin + split.charityAllocation + split.platformFee;
    expect(total).toBeLessThanOrEqual(8);
  });
});

describe('Hash Chain', () => {
  const crypto = require('crypto');

  const generateHash = (data: string, previousHash?: string): string => {
    const combined = previousHash ? `${previousHash}${data}` : data;
    return crypto.createHash('sha256').update(combined).digest('hex');
  };

  test('should generate valid SHA-256 hash', () => {
    const hash = generateHash('transaction-1');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  test('should create hash chain', () => {
    const hash1 = generateHash('transaction-1');
    const hash2 = generateHash('transaction-2', hash1);
    const hash3 = generateHash('transaction-3', hash2);

    expect(hash1).not.toBe(hash2);
    expect(hash2).not.toBe(hash3);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    expect(hash2).toMatch(/^[a-f0-9]{64}$/);
    expect(hash3).toMatch(/^[a-f0-9]{64}$/);
  });

  test('should detect tampering', () => {
    const hash1 = generateHash('transaction-1');
    const hash2 = generateHash('transaction-2', hash1);

    const tamperedHash = generateHash('transaction-2-tampered', hash1);

    expect(hash2).not.toBe(tamperedHash);
  });
});

describe('Proof of Skill Validation', () => {
  const validateProofOfSkill = (accuracy: number): boolean => {
    return accuracy >= 0.6;
  };

  test('should accept 60%+ accuracy', () => {
    expect(validateProofOfSkill(0.60)).toBe(true);
    expect(validateProofOfSkill(0.75)).toBe(true);
    expect(validateProofOfSkill(1.0)).toBe(true);
  });

  test('should reject <60% accuracy', () => {
    expect(validateProofOfSkill(0.59)).toBe(false);
    expect(validateProofOfSkill(0.5)).toBe(false);
    expect(validateProofOfSkill(0.0)).toBe(false);
  });
});
