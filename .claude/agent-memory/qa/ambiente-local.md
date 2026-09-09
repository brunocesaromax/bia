---
name: ambiente-local
description: Portas, worktrees e setup do navegador Playwright para testar a BIA localmente
metadata:
  type: reference
---

## Portas
- API/backend: `http://localhost:3001` (`/api/versao`, `/api/tarefas`) — container do worktree.
- Frontend Vite dev server: `http://localhost:5173` quando testando código de worktree
  (não é fixo; confirmar em `client/vite.config.js` ou perguntar). `:3001` e `:8080`
  servem só o build antigo do container — não usar como frontend a validar.
- Sem acesso ao Postgres: validar formato gravado via `GET /api/tarefas` (JSON).

## Navegador Playwright
- Na primeira execução o browser pode não estar instalado. Rodar:
  `npx @playwright/mcp install-browser chrome-for-testing` (baixa ~300MB, ~1min).

## Interagir com `<input type="date">` via Playwright
- `browser_type` não preenche input date de forma confiável. Usar `browser_evaluate`
  com o setter nativo + dispatch de `input`/`change` para o React captar:
  `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'YYYY-MM-DD')`.
- Abrir o calendário nativo: `el.showPicker()` via `browser_evaluate`.

## Timezone do navegador de teste
- TZ = `America/Sao_Paulo`; `new Date().toLocaleDateString('pt-BR')` → `DD/MM/YYYY`.
