import FederationProtocol, { DataPackage } from '../federation/protocol';
import InstanceRegistry from '../federation/registry';

describe('Federation Protocol', () => {
  let protocol: FederationProtocol;
  const testInstanceId = 'test-instance-1';
  const testPrivateKey = 'test-private-key-12345';
  const testPublicKey = 'test-public-key-12345';

  beforeEach(() => {
    protocol = new FederationProtocol(testInstanceId, testPrivateKey, testPublicKey);
  });

  describe('Checksum Generation', () => {
    test('should generate consistent SHA-256 checksum', () => {
      const data = { users: [], transactions: [] };
      const checksum1 = protocol.generateChecksum(data);
      const checksum2 = protocol.generateChecksum(data);

      expect(checksum1).toBe(checksum2);
      expect(checksum1).toMatch(/^[a-f0-9]{64}$/);
    });

    test('should generate different checksums for different data', () => {
      const data1 = { users: [{ id: '1', name: 'Alice' }] };
      const data2 = { users: [{ id: '2', name: 'Bob' }] };

      const checksum1 = protocol.generateChecksum(data1);
      const checksum2 = protocol.generateChecksum(data2);

      expect(checksum1).not.toBe(checksum2);
    });
  });

  describe('Package Signing', () => {
    test('should sign data package', () => {
      const data = { users: [], transactions: [] };
      const checksum = protocol.generateChecksum(data);
      const signature = protocol.signPackage(data, checksum);

      expect(signature).toBeDefined();
      expect(signature).toMatch(/^[a-f0-9]{64}$/);
    });

    test('should generate consistent signatures for same data', () => {
      const data = { users: [], transactions: [] };
      const checksum = protocol.generateChecksum(data);

      const sig1 = protocol.signPackage(data, checksum);
      const sig2 = protocol.signPackage(data, checksum);

      expect(sig1).toBe(sig2);
    });
  });

  describe('Data Package Creation', () => {
    test('should create valid data package', () => {
      const users = [{ id: '1', username: 'alice', email: 'alice@example.com' }];
      const transactions = [{ id: 'tx1', amount: 100 }];
      const charities = [{ id: 'ch1', name: 'Red Cross' }];
      const challenges = [{ id: 'chal1', title: 'Prediction Challenge' }];
      const predictions = [{ id: 'pred1', confidence: 0.75 }];

      const pkg = protocol.createDataPackage(
        users as any,
        transactions as any,
        charities as any,
        challenges as any,
        predictions as any
      );

      expect(pkg.version).toBe('1.0');
      expect(pkg.instanceId).toBe(testInstanceId);
      expect(pkg.checksum).toBeDefined();
      expect(pkg.signature).toBeDefined();
      expect(pkg.data.users).toHaveLength(1);
      expect(pkg.data.transactions).toHaveLength(1);
    });

    test('should include exportedAt timestamp', () => {
      const pkg = protocol.createDataPackage([], [], [], [], []);
      const exportTime = new Date(pkg.exportedAt);

      expect(exportTime).toBeInstanceOf(Date);
      expect(exportTime.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Package Validation', () => {
    test('should validate correct package', () => {
      const users = [{ id: '1', username: 'alice', email: 'alice@example.com' }];
      const pkg = protocol.createDataPackage(users as any, [], [], [], []);

      const validation = protocol.validatePackage(pkg, testPublicKey);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should reject package with wrong version', () => {
      const users = [{ id: '1', username: 'alice', email: 'alice@example.com' }];
      const pkg = protocol.createDataPackage(users as any, [], [], [], []);
      
      const invalidPkg = { ...pkg, version: '2.0' } as any;

      const validation = protocol.validatePackage(invalidPkg, testPublicKey);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain(expect.stringContaining('Unsupported version'));
    });

    test('should reject package with corrupted checksum', () => {
      const users = [{ id: '1', username: 'alice', email: 'alice@example.com' }];
      const pkg = protocol.createDataPackage(users as any, [], [], [], []);

      const invalidPkg = { ...pkg, checksum: 'invalid' + pkg.checksum.slice(7) };

      const validation = protocol.validatePackage(invalidPkg, testPublicKey);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain(expect.stringContaining('Checksum mismatch'));
    });
  });

  describe('Conflict Detection', () => {
    test('should detect user ID conflicts', () => {
      const localUsers = [
        { id: '1', username: 'alice' },
        { id: '2', username: 'bob' },
      ];
      const remoteUsers = [
        { id: '2', username: 'bob' },
        { id: '3', username: 'charlie' },
      ];

      const conflicts = protocol.detectConflicts(localUsers as any, remoteUsers as any);

      expect(conflicts).toContain(expect.stringContaining('2'));
      expect(conflicts).toHaveLength(1);
    });

    test('should not detect conflicts for non-overlapping users', () => {
      const localUsers = [{ id: '1', username: 'alice' }];
      const remoteUsers = [{ id: '2', username: 'bob' }];

      const conflicts = protocol.detectConflicts(localUsers as any, remoteUsers as any);

      expect(conflicts).toHaveLength(0);
    });
  });
});

describe('Instance Registry', () => {
  let registry: InstanceRegistry;

  beforeEach(() => {
    registry = new InstanceRegistry(60000);
  });

  describe('Instance Registration', () => {
    test('should register new instance', () => {
      const instance = {
        id: 'instance-1',
        name: 'Test Instance 1',
        url: 'http://localhost:3001',
        publicKey: 'key123',
        supportedVersions: ['1.0'],
        createdAt: new Date(),
      };

      const entry = registry.registerInstance(instance);

      expect(entry.instance).toEqual(instance);
      expect(entry.status).toBe('active');
      expect(entry.healthScore).toBe(100);
    });

    test('should retrieve registered instance', () => {
      const instance = {
        id: 'instance-1',
        name: 'Test Instance',
        url: 'http://localhost:3001',
        publicKey: 'key123',
        supportedVersions: ['1.0'],
        createdAt: new Date(),
      };

      registry.registerInstance(instance);
      const retrieved = registry.getInstance('instance-1');

      expect(retrieved).toEqual(instance);
    });

    test('should return undefined for non-existent instance', () => {
      const retrieved = registry.getInstance('non-existent');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('Instance Queries', () => {
    test('should get all active instances', () => {
      const instance1 = {
        id: 'instance-1',
        name: 'Instance 1',
        url: 'http://localhost:3001',
        publicKey: 'key1',
        supportedVersions: ['1.0'],
        createdAt: new Date(),
      };

      const instance2 = {
        id: 'instance-2',
        name: 'Instance 2',
        url: 'http://localhost:3002',
        publicKey: 'key2',
        supportedVersions: ['1.0'],
        createdAt: new Date(),
      };

      registry.registerInstance(instance1);
      registry.registerInstance(instance2);

      const active = registry.getActiveInstances();

      expect(active).toHaveLength(2);
    });

    test('should search instances by name', () => {
      const instance1 = {
        id: 'instance-1',
        name: 'Test Alpha',
        url: 'http://localhost:3001',
        publicKey: 'key1',
        supportedVersions: ['1.0'],
        createdAt: new Date(),
      };

      const instance2 = {
        id: 'instance-2',
        name: 'Beta Test',
        url: 'http://localhost:3002',
        publicKey: 'key2',
        supportedVersions: ['1.0'],
        createdAt: new Date(),
      };

      registry.registerInstance(instance1);
      registry.registerInstance(instance2);

      const results = registry.searchInstances('Alpha');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Test Alpha');
    });
  });

  describe('Registry Statistics', () => {
    test('should calculate registry stats', () => {
      const instance = {
        id: 'instance-1',
        name: 'Test',
        url: 'http://localhost:3001',
        publicKey: 'key1',
        supportedVersions: ['1.0'],
        createdAt: new Date(),
      };

      registry.registerInstance(instance);

      const stats = registry.getStats();

      expect(stats.total).toBe(1);
      expect(stats.active).toBe(1);
      expect(stats.averageHealth).toBe(100);
    });
  });

  describe('Registry Operations', () => {
    test('should remove instance from registry', () => {
      const instance = {
        id: 'instance-1',
        name: 'Test',
        url: 'http://localhost:3001',
        publicKey: 'key1',
        supportedVersions: ['1.0'],
        createdAt: new Date(),
      };

      registry.registerInstance(instance);
      const removed = registry.removeInstance('instance-1');

      expect(removed).toBe(true);
      expect(registry.getInstance('instance-1')).toBeUndefined();
    });

    test('should export and import registry', () => {
      const instance = {
        id: 'instance-1',
        name: 'Test',
        url: 'http://localhost:3001',
        publicKey: 'key1',
        supportedVersions: ['1.0'],
        createdAt: new Date(),
      };

      registry.registerInstance(instance);
      const exported = registry.exportRegistry();

      const newRegistry = new InstanceRegistry();
      newRegistry.importRegistry(exported);

      expect(newRegistry.getInstance('instance-1')).toBeDefined();
    });

    test('should clear registry', () => {
      const instance = {
        id: 'instance-1',
        name: 'Test',
        url: 'http://localhost:3001',
        publicKey: 'key1',
        supportedVersions: ['1.0'],
        createdAt: new Date(),
      };

      registry.registerInstance(instance);
      registry.clear();

      expect(registry.getAllInstances()).toHaveLength(0);
    });
  });
});
          
