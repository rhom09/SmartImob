import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn("⚠️ [Auth] Acesso negado: sem token de autorização.");
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    console.warn("⚠️ [Auth] Requisição recebida sem token no header Authorization.");
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    console.log(`🔑 [Auth] Validando token (Início: ${token.substring(0, 15)}... | Tamanho: ${token.length})`);

    const secret = (process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || '').trim();

    if (!secret) {
      console.error("❌ ERRO: JWT_SECRET não configurado no ambiente!");
      return res.status(500).json({ message: 'Internal server error: auth config missing' });
    }

    let decoded;
    try {
      // Tentativa 1: Validar com string direta (UTF-8)
      decoded = jwt.verify(token, secret);
    } catch (utf8Error) {
      try {
        // Tentativa 2: Se falhar, tentar como Base64 (Comum no Supabase)
        const secretBuffer = Buffer.from(secret, 'base64');
        decoded = jwt.verify(token, secretBuffer);
      } catch (base64Error) {
        // Se ambos falharem, relata o erro original
        throw utf8Error;
      }
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Erro na verificação do JWT:", error);
    return res.status(401).json({ message: 'Invalid token', error: (error as Error).message });
  }
};
