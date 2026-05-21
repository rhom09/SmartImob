# SmartImob - Histórico de Estabilização do Sistema

Este documento registra a jornada de estabilização do SmartImob durante a Fase 3 e preparação para a Fase 4.

## 🛠️ Desafios Técnicos Superados

### 1. Serialização de Campos `Decimal` (Prisma + Node.js)
**Problema:** O Prisma Client v6+ retorna valores monetários como objetos `Decimal`, que o `JSON.stringify` nativo do Express/Node não consegue converter, resultando em erro 500 (Internal Server Error) em todas as rotas de detalhes.
**Solução:** Implementação global no arquivo `backend/src/lib/prisma.ts` estendendo os protótipos de `Decimal` e `BigInt` com um método `.toJSON()`.

### 2. Hydration Mismatch & SSR (Next.js 14+)
**Problema:** O Next.js tentava renderizar páginas dinâmicas (detalhes com ID) no servidor, mas a presença de extensões de navegador (MetaMask, etc) e a latência de busca de dados causavam erros de hidratação e quebras de UI.
**Solução:** 
- Uso de `export const dynamic = "force-dynamic"` para evitar cache indesejado de páginas de detalhes.
- Implementação de um estado `mounted` via `useEffect` para garantir que o React só renderize o conteúdo dinâmico após a confirmação de que está rodando no cliente.
- Adição de `suppressHydrationWarning` no `layout.tsx` para tolerar atributos inseridos por extensões.

### 3. Processos Fantasmas e Conexão de Banco
**Problema:** Instâncias antigas do backend/frontend rodando em portas 3000/3001 impediam a aplicação de novas configurações. Conexão com Supabase via Session Pooler gerava erros de "prepared statements".
**Solução:** 
- Procedimento de limpeza de processos via PID no Windows.
- Ajuste da `DATABASE_URL` com `?pgbouncer=true` para compatibilidade com o pooler do Supabase.
- Implementação do padrão **Singleton** para o `PrismaClient` evitando vazamento de conexões.

## 🎨 Evolução da Interface
- **Migração de Cards para Tabelas**: Todas as listagens principais (Imóveis, Proprietários, Clientes e Contratos) foram refatoradas de layouts de cards para tabelas profissionais, alinhadas aos protótipos do projeto.
- **Páginas de Detalhes Robustas**: Criação e proteção de todas as rotas `[id]`, incluindo vínculos navegáveis (ex: clicar no proprietário dentro do imóvel).

## 🚀 Próximos Passos
- Planejamento e Execução da **Fase 4: Gestão Financeira**.
- Implementação de Despesas e Repasses.
