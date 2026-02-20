import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const usuarios = await sql`
      SELECT 
        u.id,
        u.tenant_id,
        u.nome,
        u.email,
        u.senha_hash,
        u.role,
        u.ativo,
        t.nome as tenant_nome,
        t.slug as tenant_slug
      FROM usuarios u
      INNER JOIN tenants t ON u.tenant_id = t.id
      WHERE u.email = ${email}
      AND u.ativo = true
      AND t.ativo = true
      LIMIT 1
    `;

    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const usuario = usuarios[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Criar sessão (token simples codificado em base64)
    const sessionData = {
      userId: usuario.id,
      tenantId: usuario.tenant_id,
      email: usuario.email,
      role: usuario.role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 dias
    };

    const token = Buffer.from(JSON.stringify(sessionData)).toString('base64');

    // Retornar usuário e token
    return res.status(200).json({
      success: true,
      token,
      usuario: {
        id: usuario.id,
        tenantId: usuario.tenant_id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        tenantNome: usuario.tenant_nome,
        tenantSlug: usuario.tenant_slug
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ 
      error: 'Erro ao processar login',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
