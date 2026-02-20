import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carrega variáveis de ambiente
config({ path: join(__dirname, '../.env') });

const sql = neon(process.env.DATABASE_URL!);

async function migrateAuth() {
  try {
    console.log('🔐 Iniciando migração de autenticação e multitenancy...\n');

    // Criar tabelas
    console.log('📋 Criando tabelas de tenants e usuários...');
    
    // Tabela de Tenants
    await sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email_contato VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(100) UNIQUE NOT NULL,
        ativo BOOLEAN DEFAULT true,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Tabela de Usuários
    await sql`
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
      )
    `;
    
    console.log('✅ Tabelas criadas com sucesso!');
    
    // Adicionar tenant_id nas tabelas existentes
    console.log('\n📝 Adicionando tenant_id nas tabelas...');
    
    await sql`ALTER TABLE midias ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE`;
    await sql`ALTER TABLE links_compartilhamento ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE`;
    
    console.log('✅ Colunas adicionadas!');
    
    // Criar índices
    console.log('\n⚡ Criando índices...');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_usuarios_tenant ON usuarios(tenant_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_midias_tenant ON midias(tenant_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_links_tenant ON links_compartilhamento(tenant_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug)`;
    
    console.log('✅ Índices criados!');
    
    // Criar function e triggers
    console.log('\n🔄 Criando triggers...');
    
    // Criar function separadamente
    await sql`CREATE OR REPLACE FUNCTION atualizar_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.data_atualizacao = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql`;
    
    // Drop triggers se existirem
    try {
      await sql`DROP TRIGGER IF EXISTS trigger_tenants_atualizacao ON tenants`;
    } catch (e) {
      // Ignorar erro se trigger não existir
    }
    
    try {
      await sql`DROP TRIGGER IF EXISTS trigger_usuarios_atualizacao ON usuarios`;
    } catch (e) {
      // Ignorar erro se trigger não existir
    }
    
    // Criar triggers
    await sql`CREATE TRIGGER trigger_tenants_atualizacao BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp()`;
    await sql`CREATE TRIGGER trigger_usuarios_atualizacao BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp()`;
    
    console.log('✅ Triggers criados!');
    
    // Criar tenant admin padrão
    console.log('\n👤 Criando tenant e usuário admin padrão...');
    
    const tenantResult = await sql`
      INSERT INTO tenants (nome, email_contato, slug, ativo)
      VALUES ('DashView Admin', 'admin@email.com', 'dashview-admin', true)
      ON CONFLICT (email_contato) DO UPDATE 
      SET nome = EXCLUDED.nome
      RETURNING id
    `;
    
    const tenantId = tenantResult[0].id;
    console.log(`✅ Tenant criado com ID: ${tenantId}`);
    
    // Hash da senha admin@123
    const senhaHash = await bcrypt.hash('admin@123', 10);
    
    await sql`
      INSERT INTO usuarios (tenant_id, nome, email, senha_hash, role, ativo)
      VALUES (${tenantId}, 'Administrador', 'admin@email.com', ${senhaHash}, 'admin', true)
      ON CONFLICT (tenant_id, email) DO UPDATE
      SET senha_hash = EXCLUDED.senha_hash
    `;
    
    console.log('✅ Usuário admin criado!');
    console.log('   📧 Email: admin@email.com');
    console.log('   🔑 Senha: admin@123');
    
    // Atualizar mídias existentes para o tenant admin
    console.log('\n🔄 Associando mídias existentes ao tenant admin...');
    
    const updateResult = await sql`
      UPDATE midias 
      SET tenant_id = ${tenantId}
      WHERE tenant_id IS NULL
    `;
    
    console.log(`✅ ${updateResult.length} mídias associadas ao tenant admin`);
    
    // Estatísticas finais
    console.log('\n📊 Estatísticas:');
    
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM tenants) as total_tenants,
        (SELECT COUNT(*) FROM usuarios) as total_usuarios,
        (SELECT COUNT(*) FROM midias WHERE tenant_id IS NOT NULL) as midias_com_tenant
    `;
    
    console.log(`   Tenants: ${stats[0].total_tenants}`);
    console.log(`   Usuários: ${stats[0].total_usuarios}`);
    console.log(`   Mídias associadas: ${stats[0].midias_com_tenant}`);
    
    console.log('\n🎉 Migração de autenticação concluída com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro na migração:', error);
    process.exit(1);
  }
}

migrateAuth();
