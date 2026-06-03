import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { promisify } from 'util';

const client = jwksClient({
  jwksUri: 'https://xdrcbtmtbnnsizuhtqwl.supabase.co/.well-known/jwks.json',
  cache: true,
  rateLimit: true,
});

const getSigningKey = promisify(client.getSigningKey);

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn("⚠️ [Auth] Acesso negado: sem token de autorização.");
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedHeader = jwt.decode(token, { complete: true }) as any;
    if (!decodedHeader || !decodedHeader.header.kid) {
      throw new Error('Token inválido ou sem KID');
    }

    const key = await getSigningKey(decodedHeader.header.kid);

    // Check if key exists and has the required property
    if (!key) {
        throw new Error('Não foi possível encontrar a chave de assinatura');
    }

    const publicKey = ('getPublicKey' in key)
        ? (key as any).getPublicKey()
        : (key as any).rsaPublicKey;

    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: 'https://xdrcbtmtbnnsizuhtqwl.supabase.co/auth/v1',
    });

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Erro na verificação do JWT:", error);
    return res.status(401).json({ message: 'Invalid token', error: (error as Error).message });
  }
};
