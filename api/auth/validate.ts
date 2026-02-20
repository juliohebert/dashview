import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Decodificar token
    let sessionData;
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      sessionData = JSON.parse(decoded);
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Verificar expiração
    if (sessionData.exp < Date.now()) {
      return res.status(401).json({ error: 'Sessão expirada' });
    }

    // Buscar dados atualizados do usuário
    const usuarioResult = await sql`
      SELECT 
        u.id, 
        u.nome, 
        u.email, 
        u.role, 
        u.ativo,
        u.tenant_id,
        t.nome as tenant_nome,
        t.slug as tenant_slug,
        t.ativo as tenant_ativo
      FROM usuarios u
      INNER JOIN tenants t ON u.tenant_id = t.id
      WHERE u.id = ${sessionData.userId}
      LIMIT 1
    `;

    if (usuarioResult.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const usuario = usuarioResult[0];

    // Verificar se usuário e tenant estão ativos
    if (!usuario.ativo || !usuario.tenant_ativo) {
      return res.status(403).json({ error: 'Conta inativa' });
    }

    return res.status(200).json({
      valid: true,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        tenantId: usuario.tenant_id,
        tenantNome: usuario.tenant_nome,
        tenantSlug: usuario.tenant_slug
      }
    });

  } catch (error) {
    console.error('Erro na validação:', error);
    return res.status(500).json({ 
      error: 'Erro ao validar sessão',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
