import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateToken } from '../auth/middleware';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    // Validar autenticação
    const session = validateToken(req);
    const tenantId = session.tenantId;

    if (req.method === 'PUT') {
      // Atualizar mídia (apenas se pertencer ao tenant)
      const { title, advertiser, type, duration, status, mediaUrl, thumbnail, schedule } = req.body;

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
        return res.status(404).json({ error: 'Mídia não encontrada' });
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

      return res.status(200).json(updatedMidia);
    }

    if (req.method === 'DELETE') {
      // Deletar mídia (apenas se pertencer ao tenant)
      const result = await sql`
        DELETE FROM midias WHERE id = ${id} AND tenant_id = ${tenantId}
        RETURNING id
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Mídia não encontrada' });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro na API /midias/[id]:', error);
    
    // Erro de autenticação
    if (error instanceof Error && (error.message.includes('Token') || error.message.includes('Sessão'))) {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(500).json({ 
      error: 'Erro ao processar requisição',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

