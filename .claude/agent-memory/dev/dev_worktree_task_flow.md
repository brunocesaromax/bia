---
name: dev-worktree-task-flow
description: Fluxo confirmado de worktree para tasks do po (mover para doing, criar worktree, escopar commits) e cuidado com working tree sujo na raiz
metadata:
  type: project
---

Fluxo de worktree (`.claude/docs/worktree-workflow.md` / `worktree-steering.md`) usado com sucesso na task 001 (tela de versão da aplicação):

1. Confirmar `ia-main` atualizado (`git branch --show-current`, `git pull origin ia-main`).
2. Mover a task de `.claude/tasks/<arquivo>.md` para `.claude/tasks/doing/` com `git mv` (fica staged automaticamente como rename) e comitar **apenas esse arquivo especificamente** — nunca `git add .claude/tasks/` genérico quando há outras mudanças não relacionadas soltas em `.claude/tasks/` (ex.: outras tasks untracked, `sequencial.md` modificado). Nesses casos, referenciar o(s) arquivo(s) exato(s) no `git commit -- <path>`.
3. `git worktree add .claude/worktrees/<slug> -b feature/<slug> ia-main`.
4. Implementar dentro do worktree; ele tem sua própria working tree/index, então `npm install` etc. lá dentro não interfere no working tree sujo da raiz do repo.
5. Ao final: commit(s) descritivos dentro do worktree, marcar checklist da própria task (arquivo dentro de `.claude/tasks/doing/` no worktree), commit final, `git push -u origin feature/<slug>`, voltar para raiz (`cd` para o path absoluto do projeto).
6. **Nunca** remover o worktree nem abrir PR — isso é exclusivo do po.

Observação: a raiz do projeto costuma ter mudanças não relacionadas pendentes no working tree (ex.: `.claude/agents/dev.md`, `client/package-lock.json`, `deploy.env` modificados por outro fluxo/sessão). Sempre rodar `git status` antes de qualquer `add`/`commit` na raiz e escopar por arquivo explícito — nunca usar `git add -A`/`git add .` genérico nesse repo.

Ver também [[dev-client-testing-setup]].
