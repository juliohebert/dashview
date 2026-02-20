import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { neon } from '@neondatabase/serverless';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // Plugin customizado para simular funções serverless localmente
        {
          name: 'api-middleware',
          configureServer(server) {
            // Inicializa cliente SQL aqui, depois que env já está carregado
            let sql: any = null;
            
            server.middlewares.use(async (req, res, next) => {
              if (!req.url?.startsWith('/api')) {
                return next();
              }

              // Inicializa SQL lazy (apenas na primeira chamada de API)
              if (!sql) {
                const dbUrl = env.DATABASE_URL || process.env.DATABASE_URL;
                if (!dbUrl) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'DATABASE_URL não configurada' }));
                  return;
                }
                sql = neon(dbUrl);
              }

              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

              // Função auxiliar para obter tenant ID do token
              const getTenantId = (): number | null => {
                const authHeader = req.headers.authorization as string;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                  return null;
                }
                try {
                  const token = authHeader.substring(7);
                  const decoded = Buffer.from(token, 'base64').toString('utf-8');
                  const sessionData = JSON.parse(decoded);
                  if (sessionData.exp < Date.now()) return null;
                  return sessionData.tenantId;
                } catch {
                  return null;
                }
              };

              if (req.method === 'OPTIONS') {
                res.statusCode = 200;
                res.end();
                return;
              }

              try {
                // GET /api/midias
                if (req.url === '/api/midias' && req.method === 'GET') {
                  const tenantId = getTenantId();
                  if (!tenantId) {
                    res.statusCode = 401;
                    res.end(JSON.stringify({ error: 'Token não fornecido ou inválido' }));
                    return;
                  }
                  
                  const result = await sql`
                    SELECT 
                      id::text,
                      titulo as title,
                      anunciante as advertiser,
                      tipo as type,
                      duracao as duration,
                      status,
                      url_midia as "mediaUrl",
                      thumbnail,
                      agendamento as schedule
                    FROM midias
                    WHERE tenant_id = ${tenantId}
                    ORDER BY data_criacao DESC
                  `;
                  
                  const midias = result.map((row: any) => ({
                    id: row.id,
                    title: row.title,
                    advertiser: row.advertiser,
                    type: row.type,
                    duration: row.duration,
                    status: row.status,
                    mediaUrl: row.mediaUrl,
                    thumbnail: row.thumbnail,
                    schedule: row.schedule || undefined
                  }));
                  
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(midias));
                  return;
                }

                // POST /api/midias
                if (req.url === '/api/midias' && req.method === 'POST') {
                  const tenantId = getTenantId();
                  if (!tenantId) {
                    res.statusCode = 401;
                    res.end(JSON.stringify({ error: 'Token não fornecido ou inválido' }));
                    return;
                  }
                  
                  let body = '';
                  req.on('data', chunk => body += chunk);
                  req.on('end', async () => {
                    const { title, advertiser, type, duration, mediaUrl, thumbnail, schedule } = JSON.parse(body);
                    
                    const result = await sql`
                      INSERT INTO midias (
                        tenant_id, titulo, anunciante, tipo, duracao, url_midia, thumbnail, agendamento
                      ) VALUES (
                        ${tenantId},
                        ${title},
                        ${advertiser},
                        ${type},
                        ${duration},
                        ${mediaUrl},
                        ${thumbnail || null},
                        ${schedule ? JSON.stringify(schedule) : null}
                      )
                      RETURNING 
                        id::text,
                        titulo as title,
                        anunciante as advertiser,
                        tipo as type,
                        duracao as duration,
                        status,
                        url_midia as "mediaUrl",
                        thumbnail,
                        agendamento as schedule
                    `;
                    
                    const newMidia = {
                      id: result[0].id,
                      title: result[0].title,
                      advertiser: result[0].advertiser,
                      type: result[0].type,
                      duration: result[0].duration,
                      status: result[0].status,
                      mediaUrl: result[0].mediaUrl,
                      thumbnail: result[0].thumbnail,
                      schedule: result[0].schedule || undefined
                    };
                    
                    res.statusCode = 201;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(newMidia));
                  });
                  return;
                }

                //PUT /api/midias/[id]
                const putMidiaMatch = req.url.match(/^\/api\/midias\/(.+)$/);
                if (putMidiaMatch && req.method === 'PUT') {
                  const tenantId = getTenantId();
                  if (!tenantId) {
                    res.statusCode = 401;
                    res.end(JSON.stringify({ error: 'Token não fornecido ou inválido' }));
                    return;
                  }
                  
                  const id = putMidiaMatch[1];
                  let body = '';
                  req.on('data', chunk => body += chunk);
                  req.on('end', async () => {
                    const { title, advertiser, type, duration, status, mediaUrl, thumbnail, schedule } = JSON.parse(body);
                    
                    const result = await sql`
                      UPDATE midias SET
                        titulo = ${title},
                        anunciante = ${advertiser},
                        tipo = ${type},
                        duracao = ${duration},
                        status = ${status},
                        url_midia = ${mediaUrl},
                        thumbnail = ${thumbnail || null},
                        agendamento = ${schedule ? JSON.stringify(schedule) : null},
                        data_atualizacao = NOW()
                      WHERE id = ${id} AND tenant_id = ${tenantId}
                      RETURNING 
                        id::text,
                        titulo as title,
                        anunciante as advertiser,
                        tipo as type,
                        duracao as duration,
                        status,
                        url_midia as "mediaUrl",
                        thumbnail,
                        agendamento as schedule
                    `;
                    
                    if (result.length === 0) {
                      res.statusCode = 404;
                      res.end(JSON.stringify({ error: 'Mídia não encontrada' }));
                      return;
                    }
                    
                    const updatedMidia = {
                      id: result[0].id,
                      title: result[0].title,
                      advertiser: result[0].advertiser,
                      type: result[0].type,
                      duration: result[0].duration,
                      status: result[0].status,
                      mediaUrl: result[0].mediaUrl,
                      thumbnail: result[0].thumbnail,
                      schedule: result[0].schedule || undefined
                    };
                    
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(updatedMidia));
                  });
                  return;
                }

                // DELETE /api/midias/[id]
                const deleteMidiaMatch = req.url.match(/^\/api\/midias\/(.+)$/);
                if (deleteMidiaMatch && req.method === 'DELETE') {
                  const tenantId = getTenantId();
                  if (!tenantId) {
                    res.statusCode = 401;
                    res.end(JSON.stringify({ error: 'Token não fornecido ou inválido' }));
                    return;
                  }
                  
                  const id = deleteMidiaMatch[1];
                  
                  const result = await sql`
                    DELETE FROM midias WHERE id = ${id} AND tenant_id = ${tenantId}
                    RETURNING id
                  `;
                  
                  if (result.length === 0) {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ error: 'Mídia não encontrada' }));
                    return;
                  }
                  
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true }));
                  return;
                }

                // POST /api/links
                if (req.url === '/api/links' && req.method === 'POST') {
                  const tenantId = getTenantId();
                  if (!tenantId) {
                    res.statusCode = 401;
                    res.end(JSON.stringify({ error: 'Token não fornecido ou inválido' }));
                    return;
                  }
                  
                  let body = '';
                  req.on('data', chunk => body += chunk);
                  req.on('end', async () => {
                    const { codigo, playlist } = JSON.parse(body);
                    
                    await sql`
                      INSERT INTO links_compartilhamento (codigo_curto, dados_playlist, tenant_id)
                      VALUES (${codigo}, ${JSON.stringify(playlist)}, ${tenantId})
                      ON CONFLICT (codigo_curto) DO UPDATE 
                      SET dados_playlist = ${JSON.stringify(playlist)},
                          criado_em = NOW()
                    `;
                    
                    res.statusCode = 201;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ codigoCurto: codigo, success: true }));
                  });
                  return;
                }

                // GET /api/links/[codigo]
                const getLinkMatch = req.url.match(/^\/api\/links\/(.+)$/);
                if (getLinkMatch && req.method === 'GET') {
                  const codigo = getLinkMatch[1];
                  
                  const result = await sql`
                    SELECT dados_playlist
                    FROM links_compartilhamento
                    WHERE codigo_curto = ${codigo}
                    LIMIT 1
                  `;
                  
                  if (result.length === 0) {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ error: 'Link não encontrado' }));
                    return;
                  }
                  
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ playlist: result[0].dados_playlist }));
                  return;
                }

                // POST /api/auth/login
                if (req.url === '/api/auth/login' && req.method === 'POST') {
                  let body = '';
                  req.on('data', chunk => body += chunk);
                  req.on('end', async () => {
                    const { email, senha } = JSON.parse(body);
                    const bcrypt = await import('bcryptjs');
                    
                    // Buscar usuário
                    const result = await sql`
                      SELECT 
                        u.id, u.nome, u.email, u.senha_hash, u.role, u.ativo,
                        t.id as tenant_id, t.nome as tenant_nome, t.slug as tenant_slug
                      FROM usuarios u
                      INNER JOIN tenants t ON u.tenant_id = t.id
                      WHERE u.email = ${email}
                      LIMIT 1
                    `;
                    
                    if (result.length === 0) {
                      res.statusCode = 401;
                      res.end(JSON.stringify({ error: 'Email ou senha inválidos' }));
                      return;
                    }
                    
                    const usuario = result[0];
                    
                    // Verificar senha
                    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
                    if (!senhaValida) {
                      res.statusCode = 401;
                      res.end(JSON.stringify({ error: 'Email ou senha inválidos' }));
                      return;
                    }
                    
                    // Criar sessão
                    const sessionData = {
                      userId: usuario.id,
                      tenantId: usuario.tenant_id,
                      email: usuario.email,
                      role: usuario.role,
                      exp: Date.now() + 7 * 24 * 60 * 60 * 1000
                    };
                    
                    const token = Buffer.from(JSON.stringify(sessionData)).toString('base64');
                    
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      token,
                      usuario: {
                        id: usuario.id,
                        nome: usuario.nome,
                        email: usuario.email,
                        role: usuario.role,
                        tenantId: usuario.tenant_id,
                        tenantNome: usuario.tenant_nome,
                        tenantSlug: usuario.tenant_slug
                      }
                    }));
                  });
                  return;
                }

                // POST /api/auth/register
                if (req.url === '/api/auth/register' && req.method === 'POST') {
                  let body = '';
                  req.on('data', chunk => body += chunk);
                  req.on('end', async () => {
                    const { nomeEmpresa, nomeUsuario, email, senha } = JSON.parse(body);
                    const bcrypt = await import('bcryptjs');
                    
                    // Gerar slug
                    const slug = nomeEmpresa.toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/[^a-z0-9\s-]/g, '')
                      .trim()
                      .replace(/\s+/g, '-');
                    
                    // Criar tenant
                    const tenantResult = await sql`
                      INSERT INTO tenants (nome, email_contato, slug, ativo)
                      VALUES (${nomeEmpresa}, ${email}, ${slug}, true)
                      RETURNING id, nome, slug
                    `;
                    
                    const tenant = tenantResult[0];
                    
                    // Hash senha
                    const senhaHash = await bcrypt.hash(senha, 10);
                    
                    // Criar usuário
                    const usuarioResult = await sql`
                      INSERT INTO usuarios (tenant_id, nome, email, senha_hash, role, ativo)
                      VALUES (${tenant.id}, ${nomeUsuario}, ${email}, ${senhaHash}, 'admin', true)
                      RETURNING id, nome, email, role
                    `;
                    
                    const usuario = usuarioResult[0];
                    
                    // Criar sessão
                    const sessionData = {
                      userId: usuario.id,
                      tenantId: tenant.id,
                      email: usuario.email,
                      role: usuario.role,
                      exp: Date.now() + 7 * 24 * 60 * 60 * 1000
                    };
                    
                    const token = Buffer.from(JSON.stringify(sessionData)).toString('base64');
                    
                    res.statusCode = 201;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: true,
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
                    }));
                  });
                  return;
                }

                // GET /api/auth/validate
                if (req.url === '/api/auth/validate' && req.method === 'GET') {
                  const authHeader = req.headers.authorization as string;
                  
                  if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    res.statusCode = 401;
                    res.end(JSON.stringify({ error: 'Token não fornecido' }));
                    return;
                  }
                  
                  const token = authHeader.substring(7);
                  
                  try {
                    const decoded = Buffer.from(token, 'base64').toString('utf-8');
                    const sessionData = JSON.parse(decoded);
                    
                    if (sessionData.exp < Date.now()) {
                      res.statusCode = 401;
                      res.end(JSON.stringify({ error: 'Sessão expirada' }));
                      return;
                    }
                    
                    // Buscar dados atualizados
                    const result = await sql`
                      SELECT 
                        u.id, u.nome, u.email, u.role, u.ativo,
                        u.tenant_id,
                        t.nome as tenant_nome,
                        t.slug as tenant_slug,
                        t.ativo as tenant_ativo
                      FROM usuarios u
                      INNER JOIN tenants t ON u.tenant_id = t.id
                      WHERE u.id = ${sessionData.userId}
                      LIMIT 1
                    `;
                    
                    if (result.length === 0) {
                      res.statusCode = 401;
                      res.end(JSON.stringify({ error: 'Usuário não encontrado' }));
                      return;
                    }
                    
                    const usuario = result[0];
                    
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
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
                    }));
                  } catch (error) {
                    res.statusCode = 401;
                    res.end(JSON.stringify({ error: 'Token inválido' }));
                  }
                  return;
                }

                // Rota não encontrada
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Rota API não encontrada' }));
              } catch (error) {
                console.error('Erro na API:', error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ 
                  error: 'Erro interno do servidor',
                  details: error instanceof Error ? error.message : 'Erro desconhecido'
                }));
              }
            });
          }
        }
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
