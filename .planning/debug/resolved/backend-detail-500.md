---
status: gathering
trigger: "O usuário está recebendo 'Internal Server Error' (500) em todas as rotas de detalhes do backend (imoveis, clientes, contratos, proprietarios)."
created: 2026-05-20T10:00:00Z
updated: 2026-05-20T10:00:00Z
---

## Current Focus

hypothesis: Initial investigation into 500 errors on detail routes
test: Gather symptoms and identify backend structure
expecting: Determine where the backend logic resides
next_action: gather symptoms

## Symptoms

expected: Detail routes (imoveis, clientes, contratos, proprietarios) should return data
actual: Returns Internal Server Error (500)
errors: 500 Internal Server Error
reproduction: Access detail routes via backend API
started: Recently, following database/prisma changes

## Eliminated

## Evidence

## Resolution

root_cause: 
fix: 
verification: 
files_changed: []
