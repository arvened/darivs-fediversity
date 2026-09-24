/**
 * Federation Module
 * Exports all federation-related classes and types
 */

export { FederationProtocol, DataPackage, ExportResult, ImportResult } from './protocol';
export type { FederationInstance, DataPackage } from './protocol';

export { InstanceRegistry } from './registry';
export type { RegistryEntry, HealthCheckResult } from './registry';

export { default as FederationProtocol } from './protocol';
export { default as InstanceRegistry } from './registry';
