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
- 006 (`006-feat-calendario-campo-data-home.md`) — agent `dev`, status `done`. **PR #3 MERGEADO em ia-main (merge commit `ec644ab`) em 2026-09-08.** Date picker (`<input type="date">`) no campo Data/Prazo da home. **Worktree `.claude/worktrees/006-...` e branch `feature/006-...` ainda existem — remover (cleanup pós-merge) quando o usuário confirmar.**
- 007 (`007-feat-grafico-tasks-por-prioridade.md`) — agent `dev`, status `done`. **PR #4 aberto contra ia-main 2026-09-08 (https://github.com/brunocesaromax/bia/pull/4), MERGEABLE, mergeStateStatus UNSTABLE (check de CI). AINDA NÃO MERGEADO.** Task movida para `done/` no ia-main (commit `cacebc1`). Rota `/prioridades` com `<BarChart>` shadcn/Recharts, dados agregados no client, lazy-load. Setup Tailwind v4 (`@tailwindcss/vite`, sem `tailwind.config.*`, sem preflight) + shadcn `chart` manual no `client/`. `client/yarn.lock` removido (Dockerfile usa npm). QA aprovou no navegador. **Worktree `.claude/worktrees/007-...` e branch `feature/007-...` — remover só APÓS merge do PR #4.**
- 006 mergeou antes da abertura do PR da 007. Apesar de ambas tocarem `App.jsx` e `index.css`, o merge da 007 ficou **limpo** (`git merge-tree` sem conflito) — mudanças localizadas. Checklist-conflito da 007 resolvido pelo fluxo de [[feedback_checklist_no_branch_conflita]] (merge-base `7a4d37d`, commit de neutralização `2e95162` no branch).
- `.claude/tasks/sequencial.md`: "Última Task: 007".
- Nota infra: worktree legado `001-feat-tela-versao-aplicacao` ainda listado em `git worktree list` (branch `feature/001-...`) — task 001 nunca foi encerrada/mergeada.

Convenção adotada (não obrigatória pela especificação, mas usada aqui para deixar a relação óbvia): quando duas tasks são pares feat/test do mesmo recurso, usar o **mesmo resumo** (slug), variando apenas o prefixo de tipo — ex. `002-feat-api-dados-versao` / `003-test-api-dados-versao`.

**Why:** Facilita rastrear rapidamente quais tasks estão relacionadas só pelo nome do arquivo, sem precisar abrir o conteúdo.

**How to apply:** Ao criar uma task de teste que depende de uma task de feature específica, considerar reusar o mesmo resumo com prefixo de tipo diferente, e sempre declarar a dependência de merge explicitamente na seção "Dependências" e no "CHECKLIST DE INÍCIO" da task dependente (ver [[project_versao_api_design]] para o caso concreto).

Nota: tasks 002 e 003 foram criadas e mostradas para revisão do usuário, mas **ainda não commitadas/pushadas** nem o `sequencial.md` — aguardando aprovação antes de qualquer commit.
