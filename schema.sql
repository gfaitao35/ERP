-- =====================================================
-- ERP MULTI-TENANT - SCHEMA POSTGRESQL
-- =====================================================
-- Execute este arquivo para criar o banco de dados
-- psql -U postgres -d seu_banco -f schema.sql

-- ============ EXTENSÕES ============
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============ TENANTS (EMPRESAS) ============
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  logo TEXT,
  plan VARCHAR(50) NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
  timezone VARCHAR(100) NOT NULL DEFAULT 'America/Sao_Paulo',
  date_format VARCHAR(50) NOT NULL DEFAULT 'DD/MM/YYYY',
  fiscal_year_start INTEGER NOT NULL DEFAULT 1,
  modules TEXT[] NOT NULL DEFAULT ARRAY['all'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ USERS ============
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'ADMINISTRATIVO' CHECK (role IN (
    'MASTER', 'ADMINISTRATIVO', 'VENDAS', 'ESTOQUE', 'PRODUCAO',
    'RH', 'FINANCEIRO', 'COMPRAS', 'TI', 'MARKETING'
  )),
  permissions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  department VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

-- ============ SAAS ADMIN (super admin global) ============
CREATE TABLE IF NOT EXISTS saas_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ AUDIT LOG ============
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ TICKETS TI ============
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ticket_number VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  requester_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ IT ASSETS ============
CREATE TABLE IF NOT EXISTS it_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('computer', 'laptop', 'monitor', 'printer', 'phone', 'server', 'other')),
  serial_number VARCHAR(255),
  manufacturer VARCHAR(255),
  model VARCHAR(255),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  location VARCHAR(255),
  purchase_date DATE,
  warranty_expiration DATE,
  status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ ÍNDICES ============
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tickets_tenant ON tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_it_assets_tenant ON it_assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_logs(tenant_id);

-- ============ FUNÇÃO UPDATED_AT ============
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============ SEED: SAAS ADMIN PADRÃO ============
-- Senha: admin123 (bcrypt hash)
INSERT INTO saas_admins (email, password_hash, name)
VALUES (
  'admin@saas.com',
  '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptPS/MolqS6ry2gq6',
  'Super Admin'
) ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE tenants IS 'Empresas/clientes do SaaS ERP';
COMMENT ON TABLE users IS 'Usuários por empresa com controle de acesso RBAC';
COMMENT ON TABLE saas_admins IS 'Administradores globais do SaaS (fora de qualquer tenant)';
