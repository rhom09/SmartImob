# Graph Report - SmartImob  (2026-05-21)

## Corpus Check
- 68 files · ~374,642 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 303 nodes · 526 edges · 27 communities (21 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5fbbfc27`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]

## God Nodes (most connected - your core abstractions)
1. `Button` - 22 edges
2. `Card` - 19 edges
3. `CardContent` - 19 edges
4. `CardHeader` - 14 edges
5. `formatCurrency()` - 14 edges
6. `Input` - 13 edges
7. `CardTitle` - 12 edges
8. `formatCPF()` - 11 edges
9. `formatCNPJ()` - 11 edges
10. `formatPhone()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `FinanceiroPage()` --calls--> `formatCurrency()`  [EXTRACTED]
  frontend/src/app/financeiro/page.tsx → frontend/src/lib/utils.ts
- `InadimplenciaPage()` --calls--> `formatCurrency()`  [EXTRACTED]
  frontend/src/app/financeiro/inadimplencia/page.tsx → frontend/src/lib/utils.ts
- `RelatoriosPage()` --calls--> `formatCurrency()`  [EXTRACTED]
  frontend/src/app/financeiro/relatorios/page.tsx → frontend/src/lib/utils.ts
- `RepassesPage()` --calls--> `formatCurrency()`  [EXTRACTED]
  frontend/src/app/financeiro/repasses/page.tsx → frontend/src/lib/utils.ts
- `DetalhesClientePage()` --calls--> `formatCPF()`  [EXTRACTED]
  frontend/src/app/clientes/[id]/page.tsx → frontend/src/lib/utils.ts

## Communities (27 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (35): ContractForm(), ContractFormData, ContractFormProps, contractSchema, TIPOS_DESPESA, FinanceiroPage(), FinancialSummary, DetalhesClientePage() (+27 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (29): globalForPrisma, authMiddleware(), AuthRequest, data, parsed, router, where, parsed (+21 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (11): FinancialController, router, FinancialService, calcularComissao(), calcularJuros(), calcularMulta(), calcularRepasse(), calcularTotalDevido() (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (5): ExpenseController, router, CreateExpenseData, ExpenseService, UpdateExpenseData

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (16): 10. ALERTAS, 1. USUARIOS, 2. PROPRIETARIOS, 3. IMOVEIS, 4. CONTRATOS, 5. INQUILINOS, 6. AUDITORIA, 7. RECIBOS (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (5): ContractController, router, ContractService, CreateContractData, createContractSchema

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (10): ClientForm(), ClientFormData, ClientFormProps, clientSchema, useViaCEP(), ViaCEPAddress, PropertyForm(), PropertyFormData (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (15): Backend, Banco de Dados, code:block1 (SmartImob/), 📖 Documentação, 📁 Estrutura do Projeto, Frontend, Funcionalidades Principais, Infraestrutura (+7 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (14): Alternativas Excelentes, Cor de Cards, Cor de Fundo, Cor de Texto Principal, Cor de Texto Secundário, Cor Principal (Primária), Cor Secundária, 🚦 Cores de Status (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.18
Nodes (10): 1. Serialização de Campos `Decimal` (Prisma + Node.js), 2. Hydration Mismatch & SSR (Next.js 14+), 3. Processos Fantasmas e Conexão de Banco, Arquitetura Implementada, Desafios Técnicos Superados, Evolução da Interface, Fase 3: Estabilização (2026-05-21), Fase 4: Gestão Financeira (2026-05-21) (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.24
Nodes (3): ReceiptController, router, PDFService

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (7): Brand & Style, Colors, Components, Elevation & Depth, Layout & Spacing, Shapes, Typography

### Community 12 - "Community 12"
Cohesion: 0.25
Nodes (7): Botão principal, code:css (button.primary {), code:css (aside.sidebar {), code:css (body {), 💻 EXEMPLO DE IDENTIDADE VISUAL (CSS), Fundo do sistema, Sidebar

### Community 13 - "Community 13"
Cohesion: 0.38
Nodes (4): metadata, Header(), menuItems, Sidebar()

### Community 14 - "Community 14"
Cohesion: 0.4
Nodes (4): code:bash (npm run dev), Deploy on Vercel, Getting Started, Learn More

### Community 15 - "Community 15"
Cohesion: 0.5
Nodes (3): Interaction, Timeline(), TimelineProps

## Knowledge Gaps
- **110 isolated node(s):** `prisma`, `app`, `globalForPrisma`, `AuthRequest`, `router` (+105 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `prisma`, `app`, `globalForPrisma` to the rest of the system?**
  _110 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._