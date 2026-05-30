# Diretrizes do Projeto SmartImob

## 🧠 Fluxo de Trabalho e Memória
- **Memória:** Sempre verifique `MEMORY.md` antes de tomar decisões estruturais.
- **Plano:** Para qualquer alteração significativa, utilize `EnterPlanMode` para garantir alinhamento.
- **Graphify:** Utilize `/gsd-graphify` (comando GSD) para mapear dependências antes de refatorações.

## 🛠️ Regras de Desenvolvimento
- **Supabase:** Sempre utilize o cliente configurado em `@/lib/supabase` para conexões frontend.
- **UI Components:** Utilize os componentes de UI de `frontend/src/components/ui/` (shadcn/ui). Não crie novos botões ou inputs se já houver um componente no diretório `ui`.
- **Tipagem:** TypeScript estrito em todo o projeto.
- **Validação:** Utilize `Zod` para validação de dados tanto no frontend quanto no backend.
- **Clean Code:** Siga os princípios de Clean Code descritos em `.planning/PROJECT.md` (código limpo, legível, API-first).

## 🚀 Infraestrutura
- **Deploy:** Frontend na Vercel e Backend no Render.
- **Banco de Dados:** PostgreSQL via Supabase. Utilize Row Level Security (RLS) para proteger os dados.

## 🔐 Segurança e Autenticação
- **Transição:** Durante o desenvolvimento da Fase 6, foi utilizado um modo de "Mock Auth" para permitir testes sem UI de login.
- **Implementação do Login:** Quando a tela de login for implementada, é OBRIGATÓRIO seguir as instruções de reversão em `docs/SECURITY_TRANSITION.md` para garantir que a segurança do Supabase seja restaurada corretamente no backend e frontend.
