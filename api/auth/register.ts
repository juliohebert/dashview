import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

// Função para gerar slug a partir do nome da empresa
function gerarSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-'); // Remove hífens duplicados
}

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
    const { nomeEmpresa, nomeUsuario, email, senha } = req.body;

    // Validações
    if (!nomeEmpresa || !nomeUsuario || !email || !senha) {
      return res.status(400).json({ 
        error: 'Todos os campos são obrigatórios',
        fields: { nomeEmpresa, nomeUsuario, email, senha: '***' }
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres' });
    }

    // Verificar se email já existe
    const emailExistente = await sql`
      SELECT id FROM usuarios WHERE email = ${email} LIMIT 1
    `;

    if (emailExistente.length > 0) {
      return res.status(400).json({ error: 'Este email já está cadastrado' });
    }

    // Gerar slug único para o tenant
    let slug = gerarSlug(nomeEmpresa);
    let slugFinal = slug;
    let contador = 1;

    // Garantir que o slug seja único
    while (true) {
      const slugExistente = await sql`
        SELECT id FROM tenants WHERE slug = ${slugFinal} LIMIT 1
      `;

      if (slugExistente.length === 0) break;

      slugFinal = `${slug}-${contador}`;
      contador++;
    }

    // Criar tenant
    const tenantResult = await sql`
      INSERT INTO tenants (nome, email_contato, slug, ativo)
      VALUES (${nomeEmpresa}, ${email}, ${slugFinal}, true)
      RETURNING id, nome, slug
    `;

    const tenant = tenantResult[0];
    console.log('Tenant criado:', tenant);

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário admin para o tenant
    const usuarioResult = await sql`
      INSERT INTO usuarios (tenant_id, nome, email, senha_hash, role, ativo)
      VALUES (${tenant.id}, ${nomeUsuario}, ${email}, ${senhaHash}, 'admin', true)
      RETURNING id, nome, email, role
    `;

    const usuario = usuarioResult[0];
    console.log('Usuário criado:', usuario);

    // Criar sessão
    const sessionData = {
      userId: usuario.id,
      tenantId: tenant.id,
      email: usuario.email,
      role: usuario.role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 dias
    };

    const token = Buffer.from(JSON.stringify(sessionData)).toString('base64');

    return res.status(201).json({
      success: true,
      message: 'Conta criada com sucesso!',
      token,
      usuario: {
        id: usuario.id,
        tenantId: tenant.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        tenantNome: tenant.nome,
        tenantSlug: tenant.slug
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ 
      error: 'Erro ao criar conta',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
