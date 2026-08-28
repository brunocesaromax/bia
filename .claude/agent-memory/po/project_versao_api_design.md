---
name: project-versao-api-design
description: Decisão de design para evolução da API de versão — novo endpoint aditivo em vez de quebrar o contrato de texto de /api/versao.
metadata:
  type: project
---

Ao criar as tasks 002 (`002-feat-api-dados-versao.md`) e 003 (`003-test-api-dados-versao.md`) em 2026-08-24, foi tomada a seguinte decisão de design (não do usuário — proposta pelo PO e registrada explicitamente na task para o dev confirmar/ajustar):

- `GET /api/versao` (texto puro, ex. `"Bia 4.2.0"`) **permanece inalterado**. Ele é consumido hoje por `client/src/components/VersionInfo.jsx` e é a base da task 001 (`001-feat-tela-versao-aplicacao.md`, ainda em `todo` quando isso foi escrito), que assume explicitamente resposta em texto.
- Dados estruturados (JSON) viram um **endpoint novo e aditivo**: `GET /api/versao/info`, mesmo arquivo de rota/controller (`api/routes/versao.js`, `api/controllers/versao.js`), retornando `{ versao, ambiente }` (nomes em português, consistente com o resto do código: `tarefas`, `titulo`, `uuid`).
- Campo `dataHora` (timestamp da resposta) foi deixado como opcional/nice-to-have, com nota explícita de que **não é data de build real** — implementar build stamp de verdade exigiria mudança em `buildspec.yml`/pipeline, fora de escopo.

**Why:** O usuário pediu para não decidir sozinho um design complexo e propor a abordagem mais simples, avaliando explicitamente se a nova API deveria manter compatibilidade com o endpoint atual ou virar endpoint novo. Quebrar `/api/versao` teria efeito cascata na task 001 já revisada/aprovada (mesmo ainda não implementada) e no teste já existente (`tests/unit/controllers/versao.test.js`), então a rota aditiva é a opção de menor risco e mais alinhada à filosofia de simplicidade do projeto.

**How to apply:** Se no futuro surgir pedido para "melhorar"/"evoluir" `/api/versao` novamente, verificar primeiro se `/api/versao/info` já foi implementado (tasks 002/003 podem já estar em `done`) antes de propor um redesenho — evitar re-decidir algo já decidido sem necessidade.

Relacionado: [[project_backend_test_infra]], [[project_task_numbering]]
