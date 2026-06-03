import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// Inicializa cliente admin do Supabase para validar tokens
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Necessário role de serviço para validar usuários
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

    req.user = user;
    next();
  } catch (error) {
    console.error("Erro na verificação do JWT:", error);
    return res.status(401).json({ message: 'Token inválido', error: (error as Error).message });
  }
};
