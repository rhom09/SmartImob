# Roadmap - SmartImob

## Visão Geral

Este roadmap segue a abordagem de **módulos incrementais**, onde cada fase entrega um módulo completo e funcional antes de avançar para o próximo.

---

## Fase 0: Setup e Infraestrutura Base

**Objetivo**: Preparar a infraestrutura do projeto e implementar autenticação.

**Duração estimada**: 1-2 semanas

**Plans:** 1 plan

Plans:
- [ ] 00-01-PLAN.md — Monorepo setup, technology stack configuration, and base layout.

### Entregáveis

#### 0.1 - Setup do Projeto
- [ ] Criar repositório Git
- [ ] Configurar monorepo ou repositórios separados (frontend + backend)
- [ ] Setup Next.js 14+ com TypeScript e Tailwind CSS
- [ ] Setup Node.js backend com Express/Fastify e TypeScript
- [ ] Configurar ESLint, Prettier, Husky
- [ ] Configurar estrutura de pastas (feature-based)

#### 0.2 - Banco de Dados
- [ ] Criar projeto no Supabase
- [ ] Configurar PostgreSQL
- [ ] Setup Prisma ORM
- [ ] Criar schema inicial (users, sessions)
- [ ] Configurar migrations

#### 0.3 - Autenticação
- [ ] Implementar Supabase Auth (email/senha)
- [ ] Implementar Google OAuth
- [ ] Criar middleware de autenticação no backend
- [ ] Criar HOC/middleware de proteção de rotas no frontend
- [ ] Implementar recuperação de senha
- [ ] Criar telas: Login, Registro, Recuperar Senha

#### 0.4 - Layout Base
- [ ] Criar layout principal com sidebar
- [ ] Criar header com menu de usuário
- [ ] Criar página inicial (dashboard vazio)
- [ ] Implementar navegação entre páginas
- [ ] Configurar tema (cores, tipografia)

#### 0.5 - Deploy Inicial
- [ ] Configurar deploy no Vercel (frontend)
- [ ] Configurar deploy no Render (backend)
- [ ] Configurar variáveis de ambiente
- [ ] Configurar CI/CD básico

### Critérios de Aceitação
- ✅ Usuário consegue criar conta e fazer login
- ✅ Usuário consegue fazer login com Google
- ✅ Rotas protegidas redirecionam para login
- ✅ Layout responsivo funciona em mobile e desktop
- ✅ Aplicação está no ar (staging)

---

## Fase 1: Gestão de Imóveis

**Objetivo**: Implementar módulo completo de gestão de imóveis.

**Duração estimada**: 2-3 semanas

**Plans:** 1 plan

Plans:
- [ ] 01-01-PLAN.md — Implementação completa do CRUD de imóveis, upload de fotos e listagem com filtros.

**Dependências**: Fase 0

### Entregáveis

#### 1.1 - Modelo de Dados
- [ ] Criar schema de imóveis no Prisma
- [ ] Criar migrations
- [ ] Configurar índices para performance
- [ ] Configurar RLS no Supabase

#### 1.2 - Backend API
- [ ] POST /api/imoveis - Criar imóvel
- [ ] GET /api/imoveis - Listar imóveis (com paginação, filtros, busca)
- [ ] GET /api/imoveis/:id - Buscar imóvel por ID
- [ ] PUT /api/imoveis/:id - Atualizar imóvel
- [ ] DELETE /api/imoveis/:id - Excluir imóvel (soft delete)
- [ ] Implementar validação com Zod
- [ ] Implementar testes unitários

#### 1.3 - Upload de Fotos
- [ ] Configurar Supabase Storage
- [ ] POST /api/imoveis/:id/fotos - Upload de fotos
- [ ] DELETE /api/imoveis/:id/fotos/:fotoId - Excluir foto
- [ ] PUT /api/imoveis/:id/fotos/:fotoId/capa - Definir foto de capa
- [ ] PUT /api/imoveis/:id/fotos/reordenar - Reordenar fotos
- [ ] Implementar otimização de imagens (resize, compressão)

#### 1.5 - Frontend - Listagem
- [ ] Criar página de listagem de imóveis
- [ ] Implementar tabela com paginação
- [ ] Implementar filtros (tipo, finalidade, status, localização, preço)
- [ ] Implementar busca por código/endereço
- [ ] Implementar ordenação
- [ ] Criar cards de imóvel (visualização em grid)
- [ ] Implementar loading states e error handling

#### 1.5 - Frontend - Cadastro/Edição
- [ ] Criar formulário de cadastro de imóvel
- [ ] Implementar validação com React Hook Form + Zod
- [ ] Implementar busca de CEP (API ViaCEP)
- [ ] Implementar upload de fotos (drag & drop)
- [ ] Implementar preview de fotos
- [ ] Implementar reordenação de fotos
- [ ] Criar modal de confirmação de exclusão

#### 1.6 - Frontend - Visualização
- [ ] Criar página de detalhes do imóvel
- [ ] Implementar galeria de fotos (lightbox)
- [ ] Exibir todos os dados do imóvel
- [ ] Implementar integração com Google Maps (localização)
- [ ] Criar botões de ação (editar, excluir, compartilhar)

### Critérios de Aceitação
- ✅ Usuário consegue cadastrar imóvel completo com fotos
- ✅ Usuário consegue listar e filtrar imóveis
- ✅ Usuário consegue visualizar detalhes do imóvel
- ✅ Usuário consegue editar imóvel
- ✅ Usuário consegue excluir imóvel
- ✅ Fotos são otimizadas e carregam rapidamente
- ✅ Interface é responsiva
- ✅ Validações funcionam corretamente

---

## Fase 2: Gestão de Clientes

**Objetivo**: Implementar módulo completo de gestão de clientes.

**Duração estimada**: 1-2 semanas

**Plans:** 1 plan

Plans:
- [ ] 02-01-PLAN.md — Implementação do CRUD de clientes, interações e linha do tempo.

**Dependências**: Fase 0

### Entregáveis

#### 2.1 - Modelo de Dados
- [ ] Criar schema de clientes no Prisma
- [ ] Criar migrations
- [ ] Configurar índices
- [ ] Configurar RLS

#### 2.2 - Backend API
- [ ] POST /api/clientes - Criar cliente
- [ ] GET /api/clientes - Listar clientes (com paginação, filtros, busca)
- [ ] GET /api/clientes/:id - Buscar cliente por ID
- [ ] PUT /api/clientes/:id - Atualizar cliente
- [ ] DELETE /api/clientes/:id - Excluir cliente (soft delete)
- [ ] POST /api/clientes/:id/interacoes - Registrar interação
- [ ] GET /api/clientes/:id/interacoes - Listar interações
- [ ] Implementar validação de CPF/CNPJ
- [ ] Implementar testes unitários

#### 2.3 - Frontend - Listagem
- [ ] Criar página de listagem de clientes
- [ ] Implementar tabela com paginação
- [ ] Implementar filtros (tipo, nome, CPF/CNPJ)
- [ ] Implementar busca
- [ ] Implementar badges para tipo de cliente

#### 2.4 - Frontend - Cadastro/Edição
- [ ] Criar formulário de cadastro de cliente
- [ ] Implementar validação com React Hook Form + Zod
- [ ] Implementar máscara para CPF/CNPJ, telefone
- [ ] Implementar busca de CEP
- [ ] Criar modal de confirmação de exclusão

#### 2.5 - Frontend - Visualização
- [ ] Criar página de detalhes do cliente
- [ ] Exibir todos os dados do cliente
- [ ] Exibir imóveis vinculados (se proprietário)
- [ ] Exibir contratos vinculados (se inquilino)
- [ ] Implementar seção de histórico de interações
- [ ] Criar formulário para registrar nova interação

### Critérios de Aceitação
- ✅ Usuário consegue cadastrar cliente completo
- ✅ Usuário consegue listar e filtrar clientes
- ✅ Usuário consegue visualizar detalhes do cliente
- ✅ Usuário consegue editar cliente
- ✅ Usuário consegue excluir cliente
- ✅ Usuário consegue registrar interações
- ✅ Validações de CPF/CNPJ funcionam
- ✅ Interface é responsiva

---

## Fase 3: Gestão de Contratos

**Objetivo**: Implementar módulo completo de gestão de contratos.

**Duração estimada**: 2-3 semanas

**Plans:** 1 plan

Plans:
- [ ] 03-01-PLAN.md — Configuração de schema e lógica de backend para geração de parcelas e CRUD de contratos.

**Dependências**: Fase 1 (Imóveis), Fase 2 (Clientes)

### Entregáveis

#### 3.1 - Modelo de Dados
- [ ] Criar schema de contratos no Prisma
- [ ] Criar schema de parcelas
- [ ] Criar migrations
- [ ] Configurar relacionamentos (imóvel, cliente, fiador)
- [ ] Configurar índices

#### 3.2 - Backend API - Contratos
- [ ] POST /api/contratos - Criar contrato
- [ ] GET /api/contratos - Listar contratos (com paginação, filtros)
- [ ] GET /api/contratos/:id - Buscar contrato por ID
- [ ] PUT /api/contratos/:id - Atualizar contrato
- [ ] DELETE /api/contratos/:id - Excluir contrato
- [ ] POST /api/contratos/:id/encerrar - Encerrar contrato
- [ ] POST /api/contratos/:id/documentos - Upload de documentos
- [ ] GET /api/contratos/:id/documentos - Listar documentos
- [ ] Implementar geração automática de parcelas (locação)
- [ ] Implementar cálculo de reajuste anual
- [ ] Implementar testes unitários

#### 3.3 - Backend API - Parcelas
- [ ] GET /api/contratos/:id/parcelas - Listar parcelas
- [ ] PUT /api/parcelas/:id - Atualizar parcela
- [ ] POST /api/parcelas/:id/pagar - Registrar pagamento

#### 3.4 - Frontend - Listagem
- [ ] Criar página de listagem de contratos
- [ ] Implementar tabela com paginação
- [ ] Implementar filtros (tipo, status, período)
- [ ] Implementar busca por número/imóvel/cliente
- [ ] Implementar badges de status
- [ ] Criar página de detalhes do contrato
- [ ] Exibir todos os dados do contrato
- [ ] Exibir parcelas (tabela)
- [ ] Exibir documentos anexos
- [ ] Implementar ações (editar, encerrar, download)
- [ ] Criar modal de encerramento de contrato

### Critérios de Aceitação
- ✅ Usuário consegue criar contrato de locação
- ✅ Usuário consegue criar contrato de venda
- ✅ Sistema gera parcelas automaticamente (locação)
- ✅ Usuário consegue visualizar e gerenciar parcelas
- ✅ Usuário consegue fazer upload de documentos
- ✅ Usuário consegue encerrar contrato
- ✅ Status do imóvel é atualizado automaticamente
- ✅ Interface é responsiva

---

## Fase 4: Gestão Financeira e de Recibos

**Objetivo**: Implementar módulo completo de gestão financeira e de recibos.

**Duração estimada**: 2 semanas

**Plans:** 2 plans

Plans:
- [x] 04-01-PLAN.md — Módulo de Recibos: emissão, gestão, cancelamento e PDF.
- [x] 04-02-PLAN.md — Gestão Financeira: inadimplência, repasses, fluxo de caixa.

### Entregáveis

#### 4.1 - Modelo de Dados
- [ ] Criar schema de pagamentos no Prisma
- [ ] Criar schema de recebimentos
- [ ] Criar migrations
- [ ] Configurar relacionamentos

#### 4.2 - Backend API
- [ ] POST /api/pagamentos - Registrar pagamento
- [ ] GET /api/pagamentos - Listar pagamentos
- [ ] POST /api/pagamentos/:id/comprovante - Upload de comprovante
- [ ] GET /api/financeiro/inadimplencia - Listar inadimplentes
- [ ] GET /api/financeiro/comissoes - Listar comissões
- [ ] GET /api/financeiro/repasses - Listar repasses
- [ ] GET /api/financeiro/fluxo-caixa - Fluxo de caixa
- [ ] Implementar cálculo de juros e multa
- [ ] Implementar cálculo de comissão
- [ ] Implementar testes unitários

#### 4.3 - Frontend - Pagamentos
- [ ] Criar página de registro de pagamento
- [ ] Implementar formulário de pagamento
- [ ] Implementar upload de comprovante
- [ ] Criar listagem de pagamentos

#### 4.4 - Frontend - Inadimplência
- [ ] Criar página de controle de inadimplência
- [ ] Implementar listagem de contratos inadimplentes
- [ ] Exibir cálculo de juros e multa
- [ ] Implementar ação de envio de notificação

#### 4.5 - Frontend - Relatórios Financeiros
- [ ] Criar página de relatórios financeiros
- [ ] Implementar filtro por período
- [ ] Exibir receitas e despesas
- [ ] Exibir comissões a receber
- [ ] Exibir repasses a fazer
- [ ] Implementar exportação para Excel/PDF

#### 4.6 - Frontend - Fluxo de Caixa
- [ ] Criar página de fluxo de caixa
- [ ] Implementar visualização mensal
- [ ] Exibir projeções futuras
- [ ] Implementar gráfico de evolução

### Critérios de Aceitação
- ✅ Usuário consegue registrar pagamentos
- ✅ Sistema calcula juros e multa automaticamente
- ✅ Sistema calcula comissões automaticamente
- ✅ Usuário consegue visualizar inadimplência
- ✅ Usuário consegue gerar relatórios financeiros
- ✅ Usuário consegue visualizar fluxo de caixa
- ✅ Interface é responsiva

---

## Fase 5: Relatórios e Dashboards

**Objetivo**: Implementar dashboards e relatórios gerenciais.

**Duração estimada**: 1-2 semanas

**Dependências**: Fases 1, 2, 3, 4

### Entregáveis

#### 5.1 - Backend API
- [ ] GET /api/dashboard/metricas - Métricas gerais
- [ ] GET /api/dashboard/imoveis - Estatísticas de imóveis
- [ ] GET /api/dashboard/contratos - Estatísticas de contratos
- [ ] GET /api/dashboard/financeiro - Estatísticas financeiras
- [ ] GET /api/relatorios/imoveis - Relatório de imóveis
- [ ] GET /api/relatorios/contratos - Relatório de contratos
- [ ] GET /api/relatorios/financeiro - Relatório financeiro
- [ ] Implementar cache para queries pesadas

#### 5.2 - Frontend - Dashboard Principal
- [ ] Criar dashboard principal
- [ ] Implementar cards de métricas (imóveis, contratos, receita, inadimplência)
- [ ] Implementar gráfico de evolução de contratos
- [ ] Implementar gráfico de receita mensal
- [ ] Implementar lista de contratos a vencer
- [ ] Implementar lista de inadimplentes

#### 5.3 - Frontend - Relatórios
- [ ] Criar página de relatórios
- [ ] Implementar relatório de imóveis (filtros, exportação)
- [ ] Implementar relatório de contratos (filtros, exportação)
- [ ] Implementar relatório financeiro (filtros, exportação)
- [ ] Implementar gráficos interativos (Recharts ou similar)

### Critérios de Aceitação
- ✅ Dashboard exibe métricas atualizadas
- ✅ Gráficos são interativos e responsivos
- ✅ Usuário consegue gerar relatórios com filtros
- ✅ Usuário consegue exportar relatórios
- ✅ Performance é adequada (< 2s para carregar dashboard)

---

## Fase 6: Sistema de Notificações

**Objetivo**: Implementar sistema de notificações automáticas.

**Duração estimada**: 1 semana

**Plans:** 1 plan

Plans:
- [ ] 06-01-PLAN.md — Sistema de Notificações: Automação de alertas, Resend/Email e Central In-app.

**Dependências**: Fase 3, 4

### Entregáveis

#### 6.1 - Modelo de Dados
- [ ] Criar schema de notificações no Prisma
- [ ] Criar migrations

#### 6.2 - Backend - Sistema de Notificações
- [ ] Implementar serviço de notificações
- [ ] Implementar job scheduler (node-cron ou similar)
- [ ] Implementar notificação de vencimento de contrato
- [ ] Implementar notificação de vencimento de aluguel
- [ ] Implementar notificação de inadimplência
- [ ] Implementar envio de email (Resend, SendGrid ou similar)
- [ ] Criar templates de email

#### 6.3 - Backend API
- [ ] GET /api/notificacoes - Listar notificações
- [ ] PUT /api/notificacoes/:id/ler - Marcar como lida
- [ ] PUT /api/notificacoes/ler-todas - Marcar todas como lidas
- [ ] GET /api/notificacoes/preferencias - Buscar preferências
- [ ] PUT /api/notificacoes/preferencias - Atualizar preferências

#### 6.4 - Frontend - Central de Notificações
- [ ] Criar componente de sino de notificações no header
- [ ] Implementar badge de notificações não lidas
- [ ] Criar dropdown de notificações
- [ ] Implementar ação de marcar como lida
- [ ] Criar página de todas as notificações

#### 6.5 - Frontend - Preferências
- [ ] Criar página de preferências de notificações
- [ ] Implementar toggles para cada tipo de notificação
- [ ] Implementar configuração de antecedência

### Critérios de Aceitação
- ✅ Sistema envia notificações automáticas
- ✅ Usuário recebe emails de notificação
- ✅ Usuário visualiza notificações no painel
- ✅ Usuário consegue configurar preferências
- ✅ Jobs rodam corretamente (diariamente)

---

## Fase 7: Integração WhatsApp

**Objetivo**: Implementar integração com WhatsApp Business API.

**Duração estimada**: 1-2 semanas

**Dependências**: Fase 2 (Clientes)

### Entregáveis

#### 7.1 - Setup WhatsApp Business API
- [ ] Criar conta no WhatsApp Business API (Twilio, 360Dialog ou similar)
- [ ] Configurar webhook para receber mensagens
- [ ] Configurar templates de mensagens

#### 7.2 - Backend API
- [ ] POST /api/whatsapp/enviar - Enviar mensagem
- [ ] POST /api/whatsapp/enviar-lote - Enviar mensagens em lote
- [ ] POST /api/whatsapp/webhook - Receber mensagens
- [ ] GET /api/whatsapp/historico/:clienteId - Histórico de mensagens
- [ ] GET /api/whatsapp/templates - Listar templates
- [ ] Implementar serviço de integração com WhatsApp API

#### 7.3 - Frontend - Envio de Mensagens
- [ ] Criar modal de envio de mensagem
- [ ] Implementar seleção de cliente
- [ ] Implementar seleção de template
- [ ] Implementar personalização de mensagem
- [ ] Implementar envio em lote

#### 7.4 - Frontend - Histórico
- [ ] Criar página de histórico de mensagens
- [ ] Implementar listagem de mensagens por cliente
- [ ] Implementar filtros

#### 7.5 - Frontend - Templates
- [ ] Criar página de gerenciamento de templates
- [ ] Implementar CRUD de templates
- [ ] Implementar variáveis dinâmicas

### Critérios de Aceitação
- ✅ Usuário consegue enviar mensagem individual via WhatsApp
- ✅ Usuário consegue enviar mensagens em lote
- ✅ Sistema registra histórico de mensagens
- ✅ Usuário consegue gerenciar templates
- ✅ Templates suportam variables dinâmicas

---

## Fase 8: Melhorias e Polimento

**Objetivo**: Refinar a aplicação e adicionar melhorias de UX/UI.

**Duração estimada**: 1 semana

**Dependências**: Todas as fases anteriores

### Entregáveis

#### 8.1 - Performance
- [ ] Otimizar queries do banco de dados
- [ ] Implementar cache onde apropriado
- [ ] Otimizar bundle size do frontend
- [ ] Implementar lazy loading de componentes

#### 8.2 - UX/UI
- [ ] Revisar e melhorar fluxos de usuário
- [ ] Adicionar animações e transições
- [ ] Melhorar feedback visual
- [ ] Adicionar tooltips e ajuda contextual
- [ ] Implementar modo escuro (opcional)

#### 8.3 - Testes
- [ ] Aumentar cobertura de testes unitários
- [ ] Implementar testes de integração
- [ ] Implementar testes E2E (Playwright ou Cypress)

#### 8.4 - Documentação
- [ ] Documentar API (Swagger/OpenAPI)
- [ ] Criar guia de usuário
- [ ] Criar documentação técnica
- [ ] Criar README completo

#### 8.5 - Deploy de Produção
- [ ] Configurar ambiente de produção
- [ ] Configurar monitoramento (Sentry, LogRocket)
- [ ] Configurar analytics
- [ ] Realizar testes finais
- [ ] Deploy em produção

### Critérios de Aceitação
- ✅ Performance atende aos requisitos (< 200ms API, < 2s páginas)
- ✅ Cobertura de testes > 70%
- ✅ Documentação completa
- ✅ Aplicação em produção
- ✅ Monitoramento configurado

---

## Resumo de Fases

| Fase | Módulo | Duração | Status |
|------|--------|---------|--------|
| 0 | Setup e Infraestrutura | 1-2 semanas | ✅ Concluído |
| 1 | Gestão de Imóveis | 2-3 semanas | ✅ Concluído |
| 2 | Gestão de Clientes | 1-2 semanas | ✅ Concluído |
| 3 | Gestão de Contratos | 2-3 semanas | ✅ Concluído |
| 4 | Gestão Financeira | 2 semanas | ✅ Concluído |
| 5 | Relatórios e Dashboards | 1-2 semanas | ✅ Concluído |
| 6 | Sistema de Notificações | 1 semana | 🟡 Em planejamento |
| 7 | Integração WhatsApp | 1-2 semanas | 🔴 Não iniciado |
| 8 | Melhorias e Polimento | 1 semana | 🔴 Não iniciado |

**Duração total estimada**: 12-18 semanas (3-4.5 meses)

---

## Próximos Passos

1. Revisar e aprovar este roadmap
2. Executar: `/gsd:plan-phase 0` para iniciar o planejamento detalhado da Fase 0
3. Após aprovação do plano, executar a Fase 0
4. Repetir o processo para cada fase subsequente
