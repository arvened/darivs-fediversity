import { FederationInstance, DataPackage } from './protocol';

export interface RegistryEntry {
  id: string;
  instance: FederationInstance;
  lastSeen: Date;
  status: 'active' | 'inactive' | 'error';
  healthScore: number;
}

export interface HealthCheckResult {
  healthy: boolean;
  latency: number;
  statusCode: number;
  timestamp: Date;
}

/**
 * Instance Registry - manages federation discovery
 * Maintains list of known DARIVS instances
 */
export class InstanceRegistry {
  private instances: Map<string, RegistryEntry>;
  private healthCheckInterval: number; // milliseconds

  constructor(healthCheckIntervalMs: number = 300000) {
    this.instances = new Map();
    this.healthCheckInterval = healthCheckIntervalMs;
  }

  /**
   * Register new federation instance
   */
  registerInstance(instance: FederationInstance): RegistryEntry {
    const entry: RegistryEntry = {
      id: instance.id,
      instance,
      lastSeen: new Date(),
      status: 'active',
      healthScore: 100,
    };

    this.instances.set(instance.id, entry);
    return entry;
  }

  /**
   * Get instance by ID
   */
  getInstance(id: string): FederationInstance | undefined {
    return this.instances.get(id)?.instance;
  }

  /**
   * Get all active instances
   */
  getActiveInstances(): FederationInstance[] {
    return Array.from(this.instances.values())
      .filter((entry) => entry.status === 'active')
      .map((entry) => entry.instance);
  }

  /**
   * Get all registered instances
   */
  getAllInstances(): RegistryEntry[] {
    return Array.from(this.instances.values());
  }

  /**
   * Check instance health via HTTP
   */
  async checkInstanceHealth(url: string): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        timeout: 5000,
      });

      const latency = Date.now() - startTime;

      return {
        healthy: response.ok,
        latency,
        statusCode: response.status,
        timestamp: new Date(),
      };
    } catch (error) {
      const latency = Date.now() - startTime;

      return {
        healthy: false,
        latency,
        statusCode: 0,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Update instance health status
   */
  async updateInstanceHealth(instanceId: string): Promise<void> {
    const entry = this.instances.get(instanceId);
    if (!entry) return;

    const health = await this.checkInstanceHealth(entry.instance.url);

    if (health.healthy) {
      entry.status = 'active';
      entry.healthScore = Math.max(entry.healthScore - 5, 100); // Improve score
    } else {
      entry.healthScore = Math.max(entry.healthScore - 20, 0); // Degrade score

      if (entry.healthScore <= 0) {
        entry.status = 'error';
      }
    }

    entry.lastSeen = new Date();
  }

  /**
   * Search instances by name or URL
   */
  searchInstances(query: string): FederationInstance[] {
    const lowerQuery = query.toLowerCase();

    return Array.from(this.instances.values())
      .filter(
        (entry) =>
          entry.instance.name.toLowerCase().includes(lowerQuery) ||
          entry.instance.url.toLowerCase().includes(lowerQuery)
      )
      .map((entry) => entry.instance);
  }

  /**
   * Remove instance from registry
   */
  removeInstance(instanceId: string): boolean {
    return this.instances.delete(instanceId);
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    total: number;
    active: number;
    inactive: number;
    error: number;
    averageHealth: number;
  } {
    const entries = Array.from(this.instances.values());
    const total = entries.length;
    const active = entries.filter((e) => e.status === 'active').length;
    const inactive = entries.filter((e) => e.status === 'inactive').length;
    const error = entries.filter((e) => e.status === 'error').length;
    const averageHealth =
      entries.length > 0
        ? entries.reduce((sum, e) => sum + e.healthScore, 0) / entries.length
        : 0;

    return {
      total,
      active,
      inactive,
      error,
      averageHealth,
    };
  }

  /**
   * Export registry as JSON
   */
  exportRegistry(): RegistryEntry[] {
    return Array.from(this.instances.values());
  }

  /**
   * Import registry from JSON
   */
  importRegistry(entries: RegistryEntry[]): void {
    for (const entry of entries) {
      this.instances.set(entry.id, entry);
    }
  }

  /**
   * Periodically health-check all instances
   */
  startHealthChecks(): NodeJS.Timer {
    return setInterval(async () => {
      for (const instanceId of this.instances.keys()) {
        await this.updateInstanceHealth(instanceId);
      }
    }, this.healthCheckInterval);
  }

  /**
   * Stop periodic health checks
   */
  stopHealthChecks(timer: NodeJS.Timer): void {
    clearInterval(timer);
  }

  /**
   * Clear registry
   */
  clear(): void {
    this.instances.clear();
  }
}

export default InstanceRegistry;
