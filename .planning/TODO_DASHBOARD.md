# Pendências: Evolução do Dashboard (Fidelidade ao Protótipo)

Este documento rastreia os ajustes finos necessários para que o Dashboard atinja 100% de fidelidade visual com `PrototipoTelas/dashboard.png`.

## ✅ Concluído (Fase 5 & 6)

### 🎨 Refinamento de UI (Frontend)
- [x] **Estilização dos StatCards**:
  - Ajustado com bordas arredondadas e sombras (Tailwind `shadow-sm`/`rounded-xl`).
  - Ícones posicionados à direita com fundo circular suave.
  - Pesos de fonte ajustados para destaque de valores.
- [x] **FinancialAreaChart (Evolução)**:
  - Aplicado gradiente verde e vermelho no preenchimento da área.
  - Configurada grade horizontal suave.
  - Tooltip ajustado para o estilo profissional.
- [x] **Tabela de Atividades**:
  - Lista de contratos convertida para tabela compacta com cabeçalhos claros.
  - Adicionados badges coloridos de status de vencimento.

### ⚙️ Funcionalidades Adicionais
- [x] **Filtros Globais**:
  - Implementado seletor de período (7d, 30d, 90d, 12m) que recarrega todos os dados.
- [x] **Ações Rápidas**:
  - Botões de "Novo Imóvel" e "Novo Contrato" adicionados ao cabeçalho.
- [x] **Notificações**:
  - Integração do Sino de Notificações com alertas reais do backend.
