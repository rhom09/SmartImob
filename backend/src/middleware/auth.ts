import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import prisma from '../lib/prisma';

dotenv.config();

// Inicializa cliente admin do Supabase para validar tokens
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Validação robusta via SDK do Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new Error(error?.message || 'Usuário não encontrado');
    }

    // Busca o usuário no banco para pegar o imobiliariaId
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: { id: true, imobiliariaId: true }
    });

    if (!dbUser) {
      return res.status(401).json({ message: 'Usuário não registrado no sistema' });
    }

    req.user = {
      ...user,
      id: dbUser.id,
      imobiliariaId: dbUser.imobiliariaId
    };

    next();
  } catch (error) {
    console.error("Erro na verificação do JWT:", error);
    return res.status(401).json({ message: 'Token inválido', error: (error as Error).message });
  }
};
