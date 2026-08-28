---
name: project-backend-test-infra
description: O projeto BIA já tem suíte de testes de backend (Jest) configurada — não propor ferramenta nova sem checar antes.
metadata:
  type: project
---

O projeto já possui testes automatizados de backend, contrário ao que se poderia supor sem checar:
- Jest já é devDependency no `package.json` raiz (`"jest": "^27.5.1"`) e há script `"test": "jest tests/unit"`.
- Testes existentes em `tests/unit/controllers/` (`versao.test.js`, `tarefas.test.js`), padrão: teste unitário puro do controller, chamando a factory (`require('../../../api/controllers/X')()`) e mockando `req`/`res` manualmente com `jest.fn()` — sem `supertest`, sem servidor HTTP real, sem `jest.config.js` separado.
- `tests/unit/controllers/versao.test.js` trava o contrato atual de `GET /api/versao` (texto puro, ex. `"Bia 4.2.0"`).

**Why:** Ao criar a task 003 (2026-08-24, testes da nova API de versão estruturada), a instrução recebida foi "verificar se existe suíte e, se não existir, propor a mais simples". Investigação mostrou que já existe e está em uso consistente — a task deve seguir esse padrão, não introduzir uma abordagem nova (ex. supertest/integração HTTP), alinhado com a filosofia de simplicidade do projeto (`.claude/rules/*.md`).

**How to apply:** Antes de especificar qualquer task nova de "criar testes" para o backend, ler `tests/unit/controllers/*.test.js` primeiro e replicar o padrão (mock direto do controller). Só propor ferramenta/abordagem nova se o padrão existente for genuinamente insuficiente para o que a task pede (ex. teste de integração real de rota, que hoje não existe).

Relacionado: [[project_versao_api_design]]
