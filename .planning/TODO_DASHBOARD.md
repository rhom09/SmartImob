# Pendências: Evolução do Dashboard (Fidelidade ao Protótipo)

Este documento rastreia os ajustes finos necessários para que o Dashboard atinja 100% de fidelidade visual com `PrototipoTelas/dashboard.png`.

## 🎨 Refinamento de UI (Frontend)
- [ ] **Estilização dos StatCards**:
  - Ajustar bordas arredondadas e sombras (Tailwind `shadow-sm`/`rounded-xl`).
  - Posicionar ícones à direita com fundo circular suave.
  - Ajustar pesos de fonte (Títulos mais finos, valores em destaque).
- [ ] **FinancialAreaChart (Evolução)**:
  - Aplicar gradiente verde no preenchimento da área.
  - Configurar grade pontilhada (`strokeDasharray="3 3"` com cor suave).
  - Ajustar Tooltip para o estilo escuro do protótipo.
- [ ] **Tabela de Atividades**:
  - Melhorar o componente de lista de contratos para o formato de tabela compacta.
  - Adicionar badges de status se necessário.

## ⚙️ Funcionalidades Adicionais
- [ ] **Filtros Globais**:
  - Implementar seletor de período (Hoje, 7d, 30d, 12 meses) no cabeçalho.
- [ ] **Ações Rápidas**:
  - Adicionar botões flutuantes ou no cabeçalho para "Novo Imóvel" e "Novo Contrato".

## ✅ Concluído
- [x] Backend: Endpoints de Evolução e Alertas.
- [x] Frontend: Layout base em Grid 12 colunas.
- [x] Frontend: Componente base de Gráfico de Área.
- [x] Integração: Consumo de dados reais do Prisma.
- [x] Estilização dos StatCards (Bordas, Sombras, Ícones).
- [x] FinancialAreaChart (Gradientes, Grade, Tooltip).
- [x] Tabela de Atividades (Formato compacto, Badges).
- [x] Filtros Globais (UI do seletor de período).
- [x] Ações Rápidas (Botões no cabeçalho).
