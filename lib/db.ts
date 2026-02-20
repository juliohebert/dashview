import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.VITE_DATABASE_URL || process.env.DATABASE_URL;

console.log('🔐 Verificando conexão com banco de dados...');
console.log('Database URL configurada:', databaseUrl ? 'SIM ✅' : 'NÃO ❌');

if (!databaseUrl) {
  throw new Error('VITE_DATABASE_URL não está configurada nas variáveis de ambiente');
}

export const sql = neon(databaseUrl);

console.log('✅ Cliente Neon inicializado com sucesso');

// Helper para executar queries
export async function query(text: string, params?: any[]) {
  try {
    const result = await sql(text, params);
    return result;
  } catch (error) {
    console.error('Erro na query do banco de dados:', error);
    throw error;
  }
}

export default sql;
