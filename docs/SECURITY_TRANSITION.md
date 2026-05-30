# Guia de Transição: Autenticação Mock -> Real (Supabase)

Este documento descreve as alterações temporárias feitas para permitir o desenvolvimento da **Fase 6 (Notificações)** antes da implementação da UI de Login.

## 🔴 Pontos de Atenção (REVERTER NO LOGIN)

Para ativar a segurança real do Supabase, siga este checklist:

### 1. Backend: Middleware de Autenticação
**Arquivo:** `backend/src/middleware/auth.ts`
- **O que foi feito:** Se não houver token no Header, o código injeta um `req.user` mockado e permite o `next()`.
- **Como reverter:** Remova o bloco `if (!authHeader || !authHeader.startsWith('Bearer '))` que faz a injeção do mock. O middleware deve retornar 401 se o token estiver ausente.

### 2. Frontend: Componente de Notificações
**Arquivo:** `frontend/src/components/NotificationBell.tsx`
- **O que foi feito:** A função `fetchNotifications` e `markAsRead` enviam a requisição mesmo sem token.
- **Como reverter:** Restaurar as travas de segurança para que o fetch só ocorra se `token` for verdadeiro.

## 🔐 Configurações de Produção (Render/Vercel)

Certifique-se de que as seguintes variáveis de ambiente estejam configuradas:

| Variável | Descrição | Onde encontrar |
| :--- | :--- | :--- |
| `RESEND_API_KEY` | Chave de API do Resend | resend.com |
| `EMAIL_FROM` | E-mail de disparo (ex: onboarding@resend.dev) | resend.com |
| `SUPABASE_JWT_SECRET` | Segredo para validar tokens do frontend | supabase.com (Project Settings > API) |
| `FRONTEND_URL` | URL da Vercel (para links nos e-mails) | Vercel Dashboard |

## 📊 Estrutura de Notificações (Prisma)
Novos modelos adicionados:
- `Alert`: Armazena os alertas físicos no banco.
- `NotificationPreference`: Armazena se o usuário quer receber e-mail/push por tipo de alerta.
