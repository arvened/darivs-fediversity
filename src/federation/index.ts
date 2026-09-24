/**
 * Federation Module
 * Exports all federation-related classes and types
 */

export { FederationProtocol } from './protocol';
export type { FederationInstance, DataPackage, ExportResult, ImportResult } from './protocol';

export { InstanceRegistry } from './registry';
export type { RegistryEntry, HealthCheckResult } from './registry';
