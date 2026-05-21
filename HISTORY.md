# SmartImob - Histórico de Desenvolvimento

Este documento registra a jornada de desenvolvimento do SmartImob, incluindo desafios técnicos e soluções.

---

## Fase 4: Gestão Financeira (2026-05-21)

### Arquitetura Implementada

**Backend - Utilitários Financeiros (`backend/src/utils/financial.ts`):**
- Juros: 1% ao mês, pro rata diário (`valorOriginal * 0.01 * diasAtraso / 30`)
- Multa: 2% flat sobre valor original (aplicada uma vez)
- Comissão de administração: 8% sobre o valor do aluguel
- Repasse: Aluguel - Comissão - Despesas do imóvel

**Backend - Novos Serviços:**
- `ExpenseService`: CRUD completo de despesas vinculadas a contratos (IPTU, Condomínio, Água, Luz, Outros)
- `FinancialService`: 5 endpoints complexos:
  - `getInadimplentes()` — Agrupa recibos vencidos por contrato, calcula juros/multa em tempo real
  - `getComissoes()` — Agrupa pagamentos recebidos por mês, calcula comissão de 8%
  - `getRepasses()` — Agrupa por proprietário, deduz comissão e despesas
  - `getFluxoCaixa()` — Projeção mensal: receitas vs despesas com saldo acumulado
  - `getResumo()` — Dashboard financeiro: receitas, despesas, inadimplência, saldo líquido

**Frontend - 5 Novas Páginas:**
1. `/financeiro` — Dashboard com cards de métricas (receita, aluguéis, despesas, inadimplência) + ações rápidas
2. `/financeiro/inadimplencia` — Cards expandíveis por contrato, tabela de recibos com dias de atraso, multa e juros
3. `/financeiro/despesas` — CRUD inline com formulário de criação, filtros por tipo/status, ações de baixa e exclusão
4. `/financeiro/repasses` — Breakdown por proprietário com tabela de contratos, comissão e despesas deduzidas
5. `/financeiro/relatorios` — Resumo do período com filtro de data, tabs de Comissões/Repasses/Despesas

**Novas Rotas de API:**
- `GET /api/financeiro/resumo` — Resumo financeiro
- `GET /api/financeiro/inadimplencia` — Contratos inadimplentes
- `GET /api/financeiro/comissoes` — Comissões por período
- `GET /api/financeiro/repasses` — Repasses por proprietário
- `GET /api/financeiro/fluxo-caixa` — Fluxo de caixa mensal
- `POST/GET/PUT/DELETE /api/despesas` — CRUD de despesas
- `POST /api/despesas/:id/pagar` — Dar baixa em despesa

---

## Fase 3: Estabilização (2026-05-21)

### Desafios Técnicos Superados

#### 1. Serialização de Campos `Decimal` (Prisma + Node.js)
**Problema:** O Prisma Client v6+ retorna valores monetários como objetos `Decimal`, que o `JSON.stringify` nativo do Express/Node não consegue converter, resultando em erro 500 (Internal Server Error) em todas as rotas de detalhes.
**Solução:** Implementação global no arquivo `backend/src/lib/prisma.ts` estendendo os protótipos de `Decimal` e `BigInt` com um método `.toJSON()`.

#### 2. Hydration Mismatch & SSR (Next.js 14+)
**Problema:** O Next.js tentava renderizar páginas dinâmicas (detalhes com ID) no servidor, mas a presença de extensões de navegador (MetaMask, etc) e a latência de busca de dados causavam erros de hidratação e quebras de UI.
**Solução:** 
- Uso de `export const dynamic = "force-dynamic"` para evitar cache indesejado de páginas de detalhes.
- Implementação de um estado `mounted` via `useEffect` para garantir que o React só renderize o conteúdo dinâmico após a confirmação de que está rodando no cliente.
- Adição de `suppressHydrationWarning` no `layout.tsx` para tolerar atributos inseridos por extensões.

#### 3. Processos Fantasmas e Conexão de Banco
**Problema:** Instâncias antigas do backend/frontend rodando em portas 3000/3001 impediam a aplicação de novas configurações. Conexão com Supabase via Session Pooler gerava erros de "prepared statements".
**Solução:** 
- Procedimento de limpeza de processos via PID no Windows.
- Ajuste da `DATABASE_URL` com `?pgbouncer=true` para compatibilidade com o pooler do Supabase.
- Implementação do padrão **Singleton** para o `PrismaClient` evitando vazamento de conexões.

### Evolução da Interface
- **Migração de Cards para Tabelas**: Todas as listagens principais (Imóveis, Proprietários, Clientes e Contratos) foram refatoradas de layouts de cards para tabelas profissionais, alinhadas aos protótipos do projeto.
- **Páginas de Detalhes Robustas**: Criação e proteção de todas as rotas `[id]`, incluindo vínculos navegáveis (ex: clicar no proprietário dentro do imóvel).

---

## Próximos Passos
- Planejamento e Execução da **Fase 5: Relatórios e Dashboards**.
- Implementação de gráficos interativos com Recharts.
- Dashboard principal com métricas gerais do sistema.
