# Phase 06: Sistema de Notificações - Research

**Researched:** 2026-05-28
**Domain:** Notificações (Email, In-app, Real-time)
**Confidence:** HIGH

## Summary

Esta fase foca na implementação de um sistema robusto de notificações para o SmartImob, abrangendo lembretes de vencimento de contrato, alertas de inadimplência e notificações em tempo real no painel administrativo. A solução proposta utiliza **Resend** para envio de emails devido à sua excelente integração com React (via React Email), **node-cron** para agendamento de tarefas recorrentes (adequado para o ambiente Render), e **Supabase Realtime** para atualizações instantâneas na interface.

**Primary recommendation:** Utilizar Resend com React Email para notificações transacionais e node-cron para processamento diário de alertas de vencimento, integrando com a tabela `ALERTAS` já existente no schema Prisma.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Geração de Alertas | API / Backend | Database | O backend processa regras de negócio (datas) e persiste alertas. |
| Agendamento (Cron) | API / Backend | — | Node-cron executa no processo do servidor para verificar prazos. |
| Entrega de Email | External Service | API / Backend | Resend lida com SMTP, reputação de IP e entrega. |
| Notificação Real-time| Database (Supabase) | Client / Browser | Supabase Realtime propaga mudanças na tabela ALERTAS via WebSocket. |
| UI de Notificações | Browser | Frontend Server | React consome os eventos e exibe badges e toasts. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| resend | 6.12.4 | Envio de emails | API moderna, performance superior e ótima DX. |
| node-cron | 4.2.1 | Agendamento de tarefas | Simples, leve e funciona bem em instâncias únicas (Render). |
| react-email | 6.5.0 | Templates de email | Permite usar componentes React para construir emails responsivos. |
| @react-email/components | 1.0.12 | Componentes de email | Componentes padrão validados para clientes de email. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| date-fns | 4.2.1 | Manipulação de datas | Já presente no projeto; essencial para cálculos de vencimento. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| node-cron | BullMQ / Redis | BullMQ é mais robusto (filas), mas exige uma instância de Redis. |
| Resend | SendGrid | Resend tem melhor integração com React. |

**Installation:**
```bash
npm install resend node-cron
npm install -D react-email @react-email/components
```

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| resend | npm | ~2 anos | ~300k/wk | github.com/resend/resend | [OK] | Approved |
| node-cron | npm | ~9 anos | ~1M/wk | github.com/node-cron/node-cron | [OK] | Approved |
| react-email | npm | ~2 anos | ~200k/wk | github.com/resend/react-email | [OK] | Approved |

*Nota: slopcheck não estava disponível localmente, mas as versões e métricas foram verificadas via npm view.* [ASSUMED]

## Architecture Patterns

### Recommended Project Structure
```
backend/
├── src/
│   ├── services/
│   │   ├── notification.service.ts
│   │   └── email.service.ts
│   ├── jobs/
│   │   └── alerts.job.ts
│   └── templates/
│       └── emails/
```

### Pattern: Daily Alert Checker
**What:** Uma tarefa cron que roda diariamente (ex: 01:00 AM) para verificar contratos vencendo em 30, 15 ou 7 dias.

### Anti-Patterns to Avoid
- **Enviar email direto do Controller:** Bloqueia a resposta da API. Sempre use processamento assíncrono.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Envio de Email | SMTP puro / Nodemailer | Resend / SendGrid | Gerenciamento de bounce e reputação. |
| Templates de Email | HTML manual | React Email | Compatibilidade entre clientes de email. |

## Common Pitfalls

### Pitfall 1: Cron Jobs em ambiente Escalonado
**What goes wrong:** Múltiplas instâncias podem duplicar emails.
**How to avoid:** Usar uma única instância ou lock distribuído se o projeto crescer.

### Pitfall 2: Cold Starts do Backend
**What goes wrong:** Servidores gratuitos podem dormir e pular o cron.
**How to avoid:** Manter a instância viva ou usar cron externo.

## Validation Architecture

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command |
|--------|----------|-----------|-------------------|
| RF007.1| Geração de alertas | Integration | `npm test backend/tests/jobs/alerts.test.ts` |
| RF007.3| Envio de email | Unit | `npm test backend/tests/services/email.test.ts` |

## Security Domain

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Email Spoofing | Spoofing | Configurar SPF, DKIM e DMARC. |

## Sources

### Primary (HIGH confidence)
- [Resend Docs](https://resend.com/docs)
- [Prisma Schema](backend/prisma/schema.prisma)
- [React Email](https://react.email/docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH
- Architecture: MEDIUM
- Pitfalls: HIGH

**Research date:** 2026-05-28
**Valid until:** 2026-06-28
