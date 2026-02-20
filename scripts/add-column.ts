import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Carrega variáveis de ambiente
config({ path: '../.env' });

const sql = neon(process.env.DATABASE_URL!);

async function addAgendamentoColumn() {
  try {
    console.log('🔄 Adicionando coluna agendamento à tabela midias...');
    
    // Adiciona coluna agendamento como JSONB
    await sql`
      ALTER TABLE midias 
      ADD COLUMN IF NOT EXISTS agendamento JSONB;
    `;
    
    console.log('✅ Coluna agendamento adicionada com sucesso!');
    
    // Verifica estrutura da tabela
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'midias'
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Estrutura atual da tabela midias:');
    result.forEach((col: any) => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

addAgendamentoColumn();
