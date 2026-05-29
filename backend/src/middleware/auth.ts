import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const secret = (process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || '').trim();

    if (!secret) {
      console.error("❌ ERRO: JWT_SECRET não configurado no ambiente!");
      return res.status(500).json({ message: 'Internal server error: auth config missing' });
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Erro na verificação do JWT:", error);
    return res.status(401).json({ message: 'Invalid token', error: (error as Error).message });
  }
};
