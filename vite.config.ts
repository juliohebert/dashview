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
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

              if (req.method === 'OPTIONS') {
                res.statusCode = 200;
                res.end();
                return;
              }

              try {
                // GET /api/midias
                if (req.url === '/api/midias' && req.method === 'GET') {
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
                  let body = '';
                  req.on('data', chunk => body += chunk);
                  req.on('end', async () => {
                    const { title, advertiser, type, duration, mediaUrl, thumbnail, schedule } = JSON.parse(body);
                    
                    const result = await sql`
                      INSERT INTO midias (
                        titulo, anunciante, tipo, duracao, url_midia, thumbnail, agendamento
                      ) VALUES (
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
                      WHERE id = ${id}
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
                  const id = deleteMidiaMatch[1];
                  
                  const result = await sql`
                    DELETE FROM midias WHERE id = ${id}
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
                  let body = '';
                  req.on('data', chunk => body += chunk);
                  req.on('end', async () => {
                    const { codigo, playlist } = JSON.parse(body);
                    
                    await sql`
                      INSERT INTO links_compartilhamento (codigo_curto, dados_playlist)
                      VALUES (${codigo}, ${JSON.stringify(playlist)})
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
