import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { codigo } = req.query;

  if (!codigo || typeof codigo !== 'string') {
    return res.status(400).json({ error: 'Código inválido' });
  }

  try {
    if (req.method === 'GET') {
      const result = await sql`
        SELECT dados_playlist
        FROM links_compartilhamento
        WHERE codigo_curto = ${codigo}
        LIMIT 1
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Link não encontrado' });
      }

      return res.status(200).json({ 
        playlist: result[0].dados_playlist 
      });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro na API /links/[codigo]:', error);
    return res.status(500).json({ 
      error: 'Erro ao processar requisição',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
