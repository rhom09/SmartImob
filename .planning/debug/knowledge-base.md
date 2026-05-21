# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## backend-detail-500 — Internal Server Error (500) em rotas de detalhes do backend
- **Date:** 2026-05-21
- **Error patterns:** Internal Server Error, 500, detail routes, imoveis, clientes, contratos, proprietarios, Decimal, BigInt, JSON serialization
- **Root cause:** O Prisma retorna campos do tipo `Decimal` (para valores monetários e áreas), e o `JSON.stringify` nativo do JavaScript/Node.js não sabe como serializar objetos `Decimal`, resultando em erro silencioso que o Express captura como 500.
- **Fix:** Adicionar métodos `toJSON` ao protótipo de `Decimal` (da biblioteca do Prisma) e `BigInt` para retornar suas representações em string.
- **Files changed:** backend/src/lib/prisma.ts
---
