import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Buscar todas as mídias
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

      return res.status(200).json(midias);
    }

    if (req.method === 'POST') {
      // Criar nova mídia
      const { title, advertiser, type, duration, mediaUrl, thumbnail, schedule } = req.body;

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

      return res.status(201).json(newMidia);
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro na API /midias:', error);
    return res.status(500).json({ 
      error: 'Erro ao processar requisição',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
