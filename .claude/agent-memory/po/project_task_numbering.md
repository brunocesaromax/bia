---
name: project-task-numbering
description: Estado do sequencial de tasks do backlog BIA e convenção de nomenclatura relacionada usada até agora.
metadata:
  type: project
---

Estado do backlog em 2026-09-01:
- 001 (`001-feat-tela-versao-aplicacao.md`) — agent `dev`, status `doing` (worktree ativo).
- 002 (`002-feat-api-dados-versao.md`) — agent `dev`, status `todo`. Novo endpoint `GET /api/versao/info` (JSON).
- 003 (`003-test-api-dados-versao.md`) — agent `dev`, status `todo`. Testes do endpoint da 002. **Depende da 002 mergeada.**
- 004 (`004-feat-checkbox-importante-marcado-padrao.md`) — status `done`, PR #1 mergeado.
- 005 (`005-feat-github-actions-testes-pr.md`) — agent `devops`, status `done`. PR #2 mergeado (merge commit b81c017). Worktree removido, branch deletado. Trouxe `.github/workflows/ci.yml` (CI "CI - Testes" roda `npm ci && npm test` em todo PR contra ia-main).
- 006 (`006-feat-calendario-campo-data-home.md`) — agent `dev`, status `done`. **PR #3 aberto contra ia-main em 2026-09-08, AINDA NÃO MERGEADO** (mergeable, mergeStateStatus UNSTABLE = check de CI). Date picker (`<input type="date">`) no campo Data/Prazo da home; QA aprovou todos os critérios. Entregou `client/src/utils/date.js` (helpers `isoParaBr`/`brParaIso`), `AddTask.jsx`, +2 regras `color-scheme` em `index.css`. Ressalva não bloqueante: sem teste unitário do helper (client sem runner jest/vitest). **Worktree `.claude/worktrees/006-...` e branch `feature/006-...` ainda existem — remover só APÓS merge do PR #3.** Gotcha de merge resolvido: a marcação de checklist commitada no branch feature (4a7d39f) conflitava com o move doing→done no ia-main; foi revertida no branch (commit 349a867) e o checklist consolidado ficou só em `done/` no ia-main.
- 007 (`007-feat-grafico-tasks-por-prioridade.md`) — agent `dev`, status `todo`, commitada/pushada em ia-main 2026-09-08 (commit 6c768b6). Nova rota `/prioridades` com gráfico de tasks por prioridade. "Prioridade" = booleano `importante` (grupos Importante/Normal), sem campo multinível. **Decisão do usuário: OPÇÃO B** — `npx shadcn@latest init` + `shadcn add chart` de verdade no `client/` (aceitou adicionar Tailwind + toolchain shadcn ao client, que hoje é CSS puro). Dados agregados no client (sem endpoint). Risco registrado na task: preflight do Tailwind quebrar o CSS puro de `/` e `/about`.
- 006 e 007 são independentes/paralelas mas ambas tocam `client/src/index.css` (007 mexe pesado no index.css ao integrar Tailwind) — 2ª a mergear provavelmente precisa rebase. (006 no fim só mexeu em `AddTask.jsx`, `index.css` +2 regras e `utils/date.js` novo — não tocou `App.jsx`.)
- `.claude/tasks/sequencial.md`: "Última Task: 007".
- Nota infra: worktree legado `001-feat-tela-versao-aplicacao` ainda listado em `git worktree list` (branch `feature/001-...`) — task 001 nunca foi encerrada/mergeada.

Convenção adotada (não obrigatória pela especificação, mas usada aqui para deixar a relação óbvia): quando duas tasks são pares feat/test do mesmo recurso, usar o **mesmo resumo** (slug), variando apenas o prefixo de tipo — ex. `002-feat-api-dados-versao` / `003-test-api-dados-versao`.

**Why:** Facilita rastrear rapidamente quais tasks estão relacionadas só pelo nome do arquivo, sem precisar abrir o conteúdo.

**How to apply:** Ao criar uma task de teste que depende de uma task de feature específica, considerar reusar o mesmo resumo com prefixo de tipo diferente, e sempre declarar a dependência de merge explicitamente na seção "Dependências" e no "CHECKLIST DE INÍCIO" da task dependente (ver [[project_versao_api_design]] para o caso concreto).

Nota: tasks 002 e 003 foram criadas e mostradas para revisão do usuário, mas **ainda não commitadas/pushadas** nem o `sequencial.md` — aguardando aprovação antes de qualquer commit.
