# SmartImob - Estado Atual do Projeto

Data: 2026-05-22

## Versão: 1.0.0

## Status das Features
- **Módulo de Imóveis**: 100% funcional. Campos financeiros (Água, Luz, Débitos, Descontos) integrados e persistidos.
- **Módulo Financeiro**: Funcional. Cálculos de juros, multas e comissões integrados.
- **Backend**: API estável em Node.js/Express, Prisma operando sobre Supabase (Pooler 6543).
- **Frontend**: Vite + React, App Router (Next.js).

## Pendências Críticas
- **RLS**: Row Level Security está **desabilitado** em todas as tabelas. Necessário implementar políticas antes de subir para produção.
- **Conexão**: Ajustes finos no pool de conexões do Prisma caso a aplicação apresente latência.

## Infraestrutura
- Supabase (Project ID: `xdrcbtmtbnnsizuhtqwl`)
- Banco: PostgreSQL 17.
