// Core domain types

export interface User {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  passwordHash: string;
  publicKey: string | null;
  jurisdiction: string | null;
  dataPortable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Charity {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  registryId: string | null;
  jurisdiction: string;
  verified: boolean;
  publicKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Challenge {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: string | null;
  startDate: Date;
  endDate: Date;
  minBet: number;
  maxBet: number;
  resolutionSource: string | null;
  status: 'pending' | 'active' | 'resolved' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Prediction {
  id: string;
  userId: string;
  challengeId: string;
  predictionValue: number;
  confidence: number;
  amount: number;
  jurisdiction: string | null;
  status: 'pending' | 'active' | 'won' | 'lost' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  predictionId: string | null;
  amount: number;
  userWin: number | null;
  charityAllocation: number;
  platformFee: number;
  jurisdiction: string;
  legalClassification: string;
  paymentMethod: string | null;
  paymentId: string | null;
  status: 'pending' | 'validated' | 'settled' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceAuditLog {
  id: string;
  transactionId: string;
  phase: 'INITIATED' | 'VALIDATED' | 'SETTLED' | 'REPORTED' | 'ARCHIVED' | 'AUDITED';
  previousHash: string | null;
  currentHash: string;
  timestamp: Date;
  data: Record<string, unknown>;
  signature: string | null;
}

export interface HashChain {
  id: string;
  transactionId: string;
  previousHash: string | null;
  currentHash: string;
  createdAt: Date;
}

export interface FederationInstance {
  id: string;
  name: string;
  url: string;
  publicKey: string;
  supportedVersions: string[];
  status: 'active' | 'inactive' | 'error';
  lastHealthCheck: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataPackage {
  version: '1.0';
  instanceId: string;
  exportedAt: string;
  data: {
    users: User[];
    transactions: Transaction[];
    charities: Charity[];
    challenges: Challenge[];
    predictions: Prediction[];
  };
  checksum: string;
  signature: string;
}

export interface DataExport {
  id: string;
  instanceId: string;
  exportedAt: Date;
  checksum: string;
  dataSize: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface DataImport {
  id: string;
  sourceInstanceId: string | null;
  importedAt: Date;
  totalRecords: number;
  conflicts: number;
  status: 'pending' | 'completed' | 'failed' | 'rejected';
  createdAt: Date;
}

export interface UserMigration {
  id: string;
  userId: string;
  fromInstanceId: string | null;
  toInstanceId: string;
  migratedAt: Date;
  dataVerified: boolean;
  createdAt: Date;
}

export interface JurisdictionRules {
  id: string;
  jurisdictionCode: string;
  minAge: number;
  taxRate: number;
  reportingFrequency: 'monthly' | 'quarterly' | 'annual';
  geoBlocked: boolean;
  tAndCVersion: string;
  updatedAt: Date;
}

export interface TaxReport {
  id: string;
  userId: string;
  jurisdiction: string;
  periodStart: Date;
  periodEnd: Date;
  totalAmount: number | null;
  taxOwed: number | null;
  reportType: string | null;
  generatedAt: Date;
  createdAt: Date;
}

export interface CreateChallengeRequest {
  title: string;
  description: string;
  category?: string;
  startDate: string;
  endDate: string;
  minBet?: number;
  maxBet?: number;
  resolutionSource?: string;
}

export interface CreatePredictionRequest {
  challengeId: string;
  predictionValue: number;
  confidence: number;
  amount: number;
}

export interface CreateTransactionRequest {
  amount: number;
  paymentMethod: string;
  paymentId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
  };
}
