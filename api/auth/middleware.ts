import type { VercelRequest } from '@vercel/node';

export interface SessionData {
  userId: number;
  tenantId: number;
  email: string;
  role: 'admin' | 'user';
  exp: number;
}

export function validateToken(req: VercelRequest): SessionData {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token não fornecido');
  }

  const token = authHeader.substring(7); // Remove "Bearer "

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const sessionData: SessionData = JSON.parse(decoded);

    // Verificar expiração
    if (sessionData.exp < Date.now()) {
      throw new Error('Sessão expirada');
    }

    return sessionData;
  } catch (error) {
    throw new Error('Token inválido');
  }
}
