-- DARIVS Fediversity Database Schema
-- PostgreSQL 15+

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255) NOT NULL,
  public_key TEXT,
  jurisdiction VARCHAR(2),
  data_portable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Charities/Organizations table
CREATE TABLE charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website VARCHAR(512),
  registry_id VARCHAR(255) UNIQUE,
  jurisdiction VARCHAR(2) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  public_key TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Predictions/Challenges
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  min_bet DECIMAL(12,2) DEFAULT 1.00,
  max_bet DECIMAL(12,2) DEFAULT 10000.00,
  resolution_source VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Predictions by users
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  challenge_id UUID NOT NULL REFERENCES challenges(id),
  prediction_value DECIMAL(10,2) NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  amount DECIMAL(12,2) NOT NULL,
  jurisdiction VARCHAR(2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions (immutable core)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  prediction_id UUID REFERENCES predictions(id),
  amount DECIMAL(12,2) NOT NULL,
  user_win DECIMAL(12,2),
  charity_allocation DECIMAL(12,2) NOT NULL,
  platform_fee DECIMAL(12,2) NOT NULL,
  jurisdiction VARCHAR(2) NOT NULL,
  legal_classification VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50),
  payment_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT charity_minimum CHECK (charity_allocation >= amount * 0.35)
);

-- Immutable audit log
CREATE TABLE compliance_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  phase VARCHAR(50) NOT NULL,
  previous_hash VARCHAR(64),
  current_hash VARCHAR(64) NOT NULL UNIQUE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data JSONB NOT NULL,
  signature VARCHAR(512),
  INDEX idx_audit_chain (current_hash),
  INDEX idx_audit_transaction (transaction_id)
);

-- Hash chain (immutable)
CREATE TABLE hash_chain (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  previous_hash VARCHAR(64),
  current_hash VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_hash_chain (current_hash)
);

-- Federation instances
CREATE TABLE federation_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  url VARCHAR(512) NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  supported_versions TEXT[] DEFAULT ARRAY['1.0'],
  status VARCHAR(50) DEFAULT 'active',
  last_health_check TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data exports
CREATE TABLE data_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instance_id UUID NOT NULL REFERENCES federation_instances(id),
  exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  checksum VARCHAR(64) NOT NULL,
  data_size INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data imports
CREATE TABLE data_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_instance_id UUID REFERENCES federation_instances(id),
  imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_records INT NOT NULL,
  conflicts INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User migrations
CREATE TABLE user_migrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  from_instance_id UUID REFERENCES federation_instances(id),
  to_instance_id UUID NOT NULL REFERENCES federation_instances(id),
  migrated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jurisdiction rules
CREATE TABLE jurisdiction_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jurisdiction_code VARCHAR(2) NOT NULL UNIQUE,
  min_age INT NOT NULL DEFAULT 18,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  reporting_frequency VARCHAR(20) NOT NULL,
  geo_blocked BOOLEAN DEFAULT FALSE,
  t_and_c_version VARCHAR(20) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tax reports
CREATE TABLE tax_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  jurisdiction VARCHAR(2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_amount DECIMAL(12,2),
  tax_owed DECIMAL(12,2),
  report_type VARCHAR(50),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_jurisdiction ON users(jurisdiction);
CREATE INDEX idx_charities_verified ON charities(verified);
CREATE INDEX idx_challenges_creator ON challenges(creator_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_challenge ON predictions(challenge_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_audit_log_transaction ON compliance_audit_log(transaction_id);
CREATE INDEX idx_federation_status ON federation_instances(status);
CREATE INDEX idx_tax_reports_user ON tax_reports(user_id);

-- INITIAL DATA
INSERT INTO jurisdiction_rules (jurisdiction_code, min_age, tax_rate, reporting_frequency, t_and_c_version)
VALUES 
  ('UA', 18, 0.00, 'monthly', '1.0'),
  ('EU', 18, 0.00, 'quarterly', '1.0'),
  ('UK', 18, 0.00, 'quarterly', '1.0'),
  ('PL', 18, 0.00, 'monthly', '1.0'),
  ('DE', 18, 0.00, 'quarterly', '1.0'),
  ('CH', 18, 0.00, 'quarterly', '1.0')
ON CONFLICT (jurisdiction_code) DO NOTHING;
