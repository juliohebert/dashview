import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers - permitir todas origens
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { codigo, playlist } = req.body;

      if (!codigo || !playlist) {
        return res.status(400).json({ error: 'Código e playlist são obrigatórios' });
      }

      console.log(`📝 Criando link compartilhado: ${codigo}`);

      // Inserir link SEM autenticação - totalmente público
      await sql`
        INSERT INTO links_compartilhamento (codigo_curto, dados_playlist)
        VALUES (${codigo}, ${JSON.stringify(playlist)})
        ON CONFLICT (codigo_curto) DO UPDATE 
        SET dados_playlist = ${JSON.stringify(playlist)},
            data_criacao = NOW()
      `;

      console.log(`✅ Link criado com sucesso: ${codigo}`);

      return res.status(201).json({ 
        codigoCurto: codigo,
        success: true 
      });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (error) {
    console.error('❌ Erro na API /links:', error);
    
    return res.status(500).json({ 
      error: 'Erro ao processar requisição',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}


