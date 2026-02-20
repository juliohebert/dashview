-- ============================================
-- SCHEMA MULTITENANCY + AUTENTICAÇÃO
-- ============================================

-- Tabela de Empresas (Tenants)
CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email_contato VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(100) UNIQUE NOT NULL,
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  ativo BOOLEAN DEFAULT true,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, email)
);

-- Adicionar tenant_id nas tabelas existentes
ALTER TABLE midias ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE links_compartilhamento ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_tenant ON usuarios(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_midias_tenant ON midias(tenant_id);
CREATE INDEX IF NOT EXISTS idx_links_tenant ON links_compartilhamento(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

-- Triggers para atualização automática
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_atualizacao = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tenants_atualizacao
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_usuarios_atualizacao
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

-- Inserir tenant e usuário admin padrão
INSERT INTO tenants (nome, email_contato, slug, ativo)
VALUES ('DashView Admin', 'admin@email.com', 'dashview-admin', true)
ON CONFLICT (email_contato) DO NOTHING;

-- Senha: admin@123 (hash bcrypt)
-- $2b$10$YourHashHere... será gerado via código
INSERT INTO usuarios (tenant_id, nome, email, senha_hash, role, ativo)
SELECT 
  t.id,
  'Administrador',
  'admin@email.com',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- admin@123
  'admin',
  true
FROM tenants t
WHERE t.email_contato = 'admin@email.com'
ON CONFLICT (tenant_id, email) DO NOTHING;

-- Comentários
COMMENT ON TABLE tenants IS 'Empresas/organizações (multitenancy)';
COMMENT ON TABLE usuarios IS 'Usuários do sistema com autenticação';
COMMENT ON COLUMN usuarios.senha_hash IS 'Hash bcrypt da senha';
COMMENT ON COLUMN usuarios.role IS 'Papel do usuário: admin ou user';
