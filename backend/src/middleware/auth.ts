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
    console.log("Tentando verificar token:", token.substring(0, 20) + "...");
    console.log("Segredo configurado no ENV:", process.env.SUPABASE_JWT_SECRET ? "sim" : "não");

    // Note: Supabase JWT secret should be in SUPABASE_JWT_SECRET env var
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Erro na verificação do JWT:", error);
    return res.status(401).json({ message: 'Invalid token', error: (error as Error).message });
  }
};
