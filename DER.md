# SmartImob - Sistema de Gestão Imobiliária
## Documentação do Diagrama Entidade-Relacionamento (DER)

Este documento descreve a estrutura lógica do banco de dados do sistema SmartImob, detalhando suas tabelas, atributos, chaves e os relacionamentos do modelo relacional.

---

## 📌 Legenda de Chaves
* **id (PK):** Chave Primária (*Primary Key*)
* **(FK):** Chave Estrangeira (*Foreign Key*)

---

## 🗂️ Tabelas e Atributos

### 1. USUARIOS
Contém as informações dos usuários que acessam o sistema.
* `id (PK)`
* `nome`
* `email` (único)
* `senha_hash`
* `perfil`
* `status`
* `data_criacao`
* `data_atualizacao`

### 2. PROPRIETARIOS
Cadastro dos proprietários dos imóveis.
* `id (PK)`
* `nome`
* `cpf_cnpj` (único)
* `telefone`
* `email`
* `endereco`
* `status`
* `data_criacao`
* `data_atualizacao`

### 3. IMOVEIS
Cadastro de imóveis vinculados aos proprietários.
* `id (PK)`
* `proprietario_id (FK)`
* `tipo`
* `endereco`
* `numero`
* `complemento`
* `bairro`
* `cidade`
* `estado`
* `cep`
* `descricao`
* `status` (Vago, Ocupado, Suspenso)
* `data_criacao`
* `data_atualizacao`

### 4. CONTRATOS
Registra os contratos de locação do sistema.
* `id (PK)`
* `imovel_id (FK)`
* `inquilino_id (FK)`
* `usuario_id (FK)`
* `numero_contrato`
* `data_inicio`
* `data_fim`
* `valor_aluguel`
* `dia_vencimento`
* `status` (Ativo, Encerrado, Renovado, Suspenso)
* `observacoes`
* `data_criacao`
* `data_atualizacao`

### 5. INQUILINOS
Cadastro das pessoas que alugam os imóveis.
* `id (PK)`
* `nome`
* `cpf_cnpj` (único)
* `telefone`
* `email`
* `endereco`
* `status`
* `data_criacao`
* `data_atualizacao`

### 6. AUDITORIA
Registra o histórico de alterações realizadas no sistema.
* `id (PK)`
* `usuario_id (FK)`
* `acao`
* `tabela_afetada`
* `registro_id`
* `dados_anteriores (JSON)`
* `dados_novos (JSON)`
* `data_acao`
* `ip_maquina`

### 7. RECIBOS
Histórico de recibos financeiros gerados por contrato.
* `id (PK)`
* `contrato_id (FK)`
* `referencia_mes`
* `referencia_ano`
* `valor_bruto`
* `descontos`
* `valor_liquido`
* `data_vencimento`
* `data_pagamento`
* `status` (Pendente, Pago, Cancelado)
* `numero_recibo` (único)
* `observacoes`
* `data_criacao`
* `data_atualizacao`

### 8. REAJUSTES
Histórico de reajustes de valores aplicados aos contratos.
* `id (PK)`
* `contrato_id (FK)`
* `data_reajuste`
* `indice` (IGP-M, Manual, Outros)
* `percentual`
* `valor_anterior`
* `novo_valor`
* `observacoes`
* `data_criacao`
* `data_atualizacao`

### 9. DESPESAS
Lançamento de custos atrelados a um determinado contrato.
* `id (PK)`
* `contrato_id (FK)`
* `tipo` (IPTU, Condomínio, Água, Luz, Outros)
* `descricao`
* `valor`
* `data_vencimento`
* `data_pagamento`
* `status` (Pendente, Pago)
* `data_criacao`
* `data_atualizacao`

### 10. ALERTAS
Notificações e avisos disparados por eventos dos contratos.
* `id (PK)`
* `contrato_id (FK)`
* `tipo` (Vencimento, Reajuste, Recibo, Outros)
* `mensagem`
* `data_evento`
* `status` (Ativo, Lido, Resolvido)
* `data_criacao`
* `data_atualizacao`

---

## 🔗 Relacionamentos Principais

O modelo segue as seguintes regras de cardinalidade (1:N):

* **PROPRIETARIOS (1) ─── 🔑 ─── (N) IMOVEIS**
* **IMOVEIS (1) ─── 🔑 ─── (N) CONTRATOS** *(Nota: Um imóvel possui apenas um contrato ativo por vez)*
* **INQUILINOS (1) ─── 🔑 ─── (N) CONTRATOS**
* **CONTRATOS (1) ─── 🔑 ─── (N) RECIBOS**
* **CONTRATOS (1) ─── 🔑 ─── (N) REAJUSTES**
* **CONTRATOS (1) ─── 🔑 ─── (N) DESPESAS**
* **CONTRATOS (1) ─── 🔑 ─── (N) ALERTAS**
* **USUARIOS (1) ─── 🔑 ─── (N) AUDITORIA**

---

## 📝 Observações Gerais do Sistema
* Todas as tabelas do banco de dados possuem controle de criação e atualização através dos campos de data.
* Todas as tabelas contam com os campos estruturais padrão: `id`, `data_criacao`, `data_atualizacao` e `status` (quando aplicável).
