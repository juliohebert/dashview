import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada no arquivo .env.local');
  process.exit(1);
}

async function migrate() {
  console.log('🚀 Iniciando migração do banco de dados...\n');

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Ler o arquivo SQL de schema
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Executar o schema completo
    console.log('📝 Executando criação de tabelas...');
    await pool.query(schema);
    console.log('✅ Tabelas criadas com sucesso!\n');

    // Verificar se existem mídias
    const midiasResult = await pool.query('SELECT COUNT(*) as total FROM midias');
    const totalMidias = parseInt(midiasResult.rows[0].total);

    console.log(`📊 Total de mídias no banco: ${totalMidias}\n`);

    if (totalMidias === 0) {
      console.log('📦 Inserindo dados de exemplo...');
      
      // Inserir algumas mídias de exemplo
      await pool.query(`
        INSERT INTO midias (titulo, anunciante, tipo, duracao, dias_exibicao, url_midia, thumbnail, status, ordem)
        VALUES 
          ('Promoção de Verão 2026', 'Loja ABC', 'Image', '30s', 7, 'https://picsum.photos/seed/promo1/1920/1080', 'https://picsum.photos/seed/promo1/800/450', 'Ativo', 1),
          ('Campanha Black Friday', 'Magazine XYZ', 'Video', '15s', 14, 'https://picsum.photos/seed/promo2/1920/1080', 'https://picsum.photos/seed/promo2/800/450', 'Ativo', 2),
          ('Menu do Dia', 'Restaurante Gourmet', 'Image', '45s', 1, 'https://picsum.photos/seed/menu/1920/1080', 'https://picsum.photos/seed/menu/800/450', 'Ativo', 3)
      `);

      console.log('✅ Dados de exemplo inseridos!\n');
    }

    console.log('🎉 Migração concluída com sucesso!');
    console.log('✨ Banco de dados pronto para uso!\n');

    // Mostrar estatísticas
    const statsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM midias) as total_midias,
        (SELECT COUNT(*) FROM agendamentos) as total_agendamentos,
        (SELECT COUNT(*) FROM links_compartilhamento) as total_links
    `);
    
    const stats = statsResult.rows[0];

    console.log('📈 Estatísticas do banco de dados:');
    console.log(`   - Mídias: ${stats.total_midias}`);
    console.log(`   - Agendamentos: ${stats.total_agendamentos}`);
    console.log(`   - Links compartilhados: ${stats.total_links}`);

    await pool.end();

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    await pool.end();
    process.exit(1);
  }
}

migrate();
