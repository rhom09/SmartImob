# Requisitos - SmartImob

## Requisitos Funcionais

### RF001 - Autenticação e Autorização

#### RF001.1 - Login de Usuário
- Sistema deve permitir login via email/senha
- Sistema deve permitir login via Google OAuth (Supabase Auth)
- Sistema deve implementar recuperação de senha via email
- Sistema deve manter sessão do usuário (JWT)

#### RF001.2 - Gestão de Usuários
- Sistema deve permitir cadastro de novos usuários
- Sistema deve ter perfis de acesso: Admin, Corretor, Assistente
- Sistema deve permitir desativação de usuários
- Sistema deve registrar logs de acesso

---

### RF002 - Gestão de Imóveis

#### RF002.1 - Cadastro de Imóveis
- Sistema deve permitir cadastro de imóveis com os seguintes campos:
  - **Dados Básicos**: Código, Tipo (casa, apartamento, terreno, comercial), Finalidade (venda, locação, ambos)
  - **Localização**: CEP, Endereço, Número, Complemento, Bairro, Cidade, Estado
  - **Características**: Área total, Área construída, Quartos, Suítes, Banheiros, Vagas de garagem
  - **Valores**: Valor de venda, Valor de locação, Condomínio, IPTU
  - **Descrição**: Descrição detalhada, Observações internas
  - **Status**: Disponível, Alugado, Vendido, Em negociação, Inativo

#### RF002.2 - Upload de Fotos
- Sistema deve permitir upload de múltiplas fotos por imóvel
- Sistema deve permitir definir foto de capa
- Sistema deve permitir reordenar fotos
- Sistema deve otimizar imagens automaticamente (resize, compressão)
- Sistema deve armazenar fotos no Supabase Storage

#### RF002.3 - Listagem e Busca
- Sistema deve listar imóveis com paginação
- Sistema deve permitir busca por:
  - Código do imóvel
  - Tipo de imóvel
  - Finalidade (venda/locação)
  - Localização (cidade, bairro)
  - Faixa de preço
  - Características (quartos, vagas, etc.)
  - Status
- Sistema deve permitir ordenação por: preço, data de cadastro, área

#### RF002.4 - Visualização de Imóvel
- Sistema deve exibir todos os detalhes do imóvel
- Sistema deve exibir galeria de fotos
- Sistema deve exibir localização no mapa (Google Maps ou similar)
- Sistema deve exibir histórico de alterações
- Sistema deve exibir contratos vinculados (se houver)

#### RF002.5 - Edição e Exclusão
- Sistema deve permitir edição de todos os campos do imóvel
- Sistema deve permitir exclusão lógica (soft delete)
- Sistema deve registrar histórico de alterações

---

### RF003 - Gestão de Clientes

#### RF003.1 - Cadastro de Clientes
- Sistema deve permitir cadastro de clientes com os seguintes campos:
  - **Dados Pessoais**: Nome completo, CPF/CNPJ, RG, Data de nascimento
  - **Contato**: Email, Telefone, WhatsApp, Telefone secundário
  - **Endereço**: CEP, Endereço completo
  - **Tipo**: Proprietário, Inquilino, Interessado
  - **Observações**: Notas internas

#### RF003.2 - Listagem e Busca
- Sistema deve listar clientes com paginação
- Sistema deve permitir busca por: nome, CPF/CNPJ, email, telefone, tipo
- Sistema deve permitir filtro por tipo de cliente

#### RF003.3 - Visualização de Cliente
- Sistema deve exibir todos os dados do cliente
- Sistema deve exibir imóveis vinculados (proprietário)
- Sistema deve exibir contratos vinculados (inquilino)
- Sistema deve exibir histórico de interações

#### RF003.4 - Histórico de Interações
- Sistema deve permitir registro de interações com cliente
- Sistema deve registrar: data, tipo (ligação, email, visita), descrição, responsável

#### RF003.5 - Edição e Exclusão
- Sistema deve permitir edição de dados do cliente
- Sistema deve permitir exclusão lógica (soft delete)
- Sistema deve validar se cliente tem contratos ativos antes de excluir

---

### RF004 - Gestão de Contratos

#### RF004.1 - Cadastro de Contratos
- Sistema deve permitir cadastro de contratos com os seguintes campos:
  - **Dados Básicos**: Número do contrato, Tipo (locação, venda), Status (ativo, encerrado, cancelado)
  - **Partes**: Imóvel, Proprietário, Inquilino/Comprador, Fiador (opcional)
  - **Valores**: Valor do contrato, Valor da comissão, Taxa de administração
  - **Prazos**: Data de início, Data de término, Dia de vencimento (locação)
  - **Documentos**: Upload de contrato PDF, documentos anexos

#### RF004.2 - Contratos de Locação
- Sistema deve gerar parcelas mensais automaticamente
- Sistema deve calcular reajuste anual (IGP-M, IPCA, etc.)
- Sistema deve permitir registro de pagamentos
- Sistema deve alertar sobre inadimplência

#### RF004.3 - Contratos de Venda
- Sistema deve registrar valor de entrada e parcelas
- Sistema deve controlar status da venda (sinal, financiamento, escritura)
- Sistema deve calcular comissão automaticamente

#### RF004.4 - Listagem e Busca
- Sistema deve listar contratos com paginação
- Sistema deve permitir busca por: número, imóvel, cliente, status, tipo
- Sistema deve permitir filtro por período

#### RF004.5 - Visualização de Contrato
- Sistema deve exibir todos os dados do contrato
- Sistema deve exibir histórico de pagamentos
- Sistema deve permitir download de documentos anexos

#### RF004.6 - Encerramento de Contrato
- Sistema deve permitir encerramento de contrato
- Sistema deve registrar data de encerramento e motivo
- Sistema deve atualizar status do imóvel automaticamente

---

### RF005 - Gestão Financeira

#### RF005.1 - Registro de Pagamentos
- Sistema deve permitir registro de pagamentos com:
  - Contrato vinculado
  - Valor pago
  - Data de pagamento
  - Forma de pagamento (dinheiro, PIX, transferência, boleto)
  - Comprovante (upload)

#### RF005.2 - Registro de Recebimentos
- Sistema deve registrar recebimentos de aluguéis
- Sistema deve calcular comissão automaticamente
- Sistema deve gerar repasse para proprietário

#### RF005.3 - Controle de Inadimplência
- Sistema deve listar contratos inadimplentes
- Sistema deve calcular juros e multa automaticamente
- Sistema deve permitir envio de notificação de cobrança

#### RF005.4 - Relatório Financeiro
- Sistema deve gerar relatório de receitas e despesas
- Sistema deve exibir comissões a receber
- Sistema deve exibir repasses a fazer
- Sistema deve permitir filtro por período

#### RF005.5 - Fluxo de Caixa
- Sistema deve exibir fluxo de caixa mensal
- Sistema deve projetar recebimentos futuros (contratos ativos)

---

### RF006 - Relatórios e Dashboards

#### RF006.1 - Dashboard Principal
- Sistema deve exibir:
  - Total de imóveis (por status)
  - Total de contratos ativos
  - Receita mensal
  - Inadimplência
  - Contratos a vencer no mês
  - Gráfico de evolução de contratos

#### RF006.2 - Relatório de Imóveis
- Sistema deve gerar relatório de imóveis por:
  - Status
  - Tipo
  - Localização
  - Faixa de preço

#### RF006.3 - Relatório de Contratos
- Sistema deve gerar relatório de contratos por:
  - Tipo (locação, venda)
  - Status
  - Período

#### RF006.4 - Relatório Financeiro
- Sistema deve gerar relatório de:
  - Receitas e despesas
  - Comissões
  - Inadimplência
  - Repasses

---

### RF007 - Sistema de Notificações

#### RF007.1 - Notificações Automáticas
- Sistema deve enviar notificações para:
  - Vencimento de contrato (30, 15, 7 dias antes)
  - Vencimento de aluguel (3 dias antes)
  - Inadimplência (1, 5, 10 dias após vencimento)
  - Novo interessado em imóvel
  - Novo contrato cadastrado

#### RF007.2 - Central de Notificações
- Sistema deve exibir central de notificações no painel
- Sistema deve permitir marcar notificações como lidas
- Sistema deve permitir configurar preferências de notificação

#### RF007.3 - Notificações por Email
- Sistema deve enviar notificações por email
- Sistema deve usar templates personalizáveis

---

### RF008 - Integração WhatsApp

#### RF008.1 - Envio de Mensagens
- Sistema deve permitir envio de mensagens via WhatsApp Business API
- Sistema deve permitir envio de mensagens individuais
- Sistema deve permitir envio de mensagens em lote

#### RF008.2 - Templates de Mensagens
- Sistema deve ter templates pré-definidos:
  - Lembrete de pagamento
  - Confirmação de visita
  - Informações de imóvel
  - Boas-vindas

#### RF008.3 - Histórico de Mensagens
- Sistema deve registrar histórico de mensagens enviadas
- Sistema deve vincular mensagens ao cliente

---

## Requisitos Não-Funcionais

### RNF001 - Performance
- Tempo de resposta da API < 200ms (p95)
- Tempo de carregamento de página < 2s
- Suporte a 100 usuários simultâneos

### RNF002 - Segurança
- Autenticação obrigatória para todas as rotas
- Criptografia de senhas (bcrypt)
- HTTPS obrigatório
- Row Level Security (RLS) no banco de dados
- Validação de dados no frontend e backend
- Proteção contra SQL Injection, XSS, CSRF

### RNF003 - Usabilidade
- Interface responsiva (mobile, tablet, desktop)
- Suporte a navegadores modernos (Chrome, Firefox, Safari, Edge)
- Feedback visual para ações do usuário
- Mensagens de erro claras

### RNF004 - Disponibilidade
- Uptime > 99.5%
- Backup automático diário do banco de dados
- Plano de recuperação de desastres

### RNF005 - Escalabilidade
- Arquitetura preparada para crescimento
- Banco de dados otimizado com índices
- Cache de dados quando apropriado

### RNF006 - Manutenibilidade
- Código limpo e bem documentado
- TypeScript em todo o projeto
- Testes automatizados (unitários e integração)
- Documentação da API (Swagger/OpenAPI)

### RNF007 - Conformidade
- LGPD: Consentimento para uso de dados, direito ao esquecimento
- Logs de auditoria para ações críticas
