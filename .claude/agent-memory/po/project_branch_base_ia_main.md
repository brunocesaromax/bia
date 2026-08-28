---
name: project-branch-base-ia-main
description: A branch base do fluxo de agentes (worktree/task/PR) voltou a ser ia-main em vez de main, a partir de 2026-08-24.
metadata:
  type: project
---

Em 2026-08-24, a branch `ia-main` foi criada a partir do estado então atual de `main` (commit 28a91c6), e desde então **`ia-main` é a branch base de todo o fluxo de agentes** (checkout, `git pull`, criação de worktree/branch de feature, e destino de PR via `gh pr create --base ia-main`). Isso reverteu a adaptação anterior deste fork, que usava `main` no lugar do `ia-main` do projeto de referência (henrylle/bia).

A branch `main` deste repositório foi restaurada (pelo usuário, fora do escopo do po) a um estado anterior, **sem** a configuração de agentes Claude Code — ou seja, `main` não deve mais ser tocada por este fluxo (nem checkout, nem push, nem PR).

Arquivos já atualizados para refletir `ia-main` como base: `.claude/agents/po.md`, `.claude/agents/dev.md`, `.claude/agents/po/especificacao.md`, `.claude/docs/worktree-workflow.md`, `.claude/docs/worktree-steering.md`, `.claude/docs/worktree-architecture-diagram.md`, `.claude/docs/task-template-with-worktree.md`, tasks `002` e `003` (ainda em `todo`), e as memórias `[[project_task_numbering]]` e a do agente dev sobre fluxo de worktree.

**Exceção conhecida:** a task `001-feat-tela-versao-aplicacao.md` (`.claude/tasks/doing/`) já tinha worktree/branch reais criados a partir de `main` **antes** dessa mudança de 2026-08-24, e seu conteúdo histórico não foi (e não deve ser) alterado — ela continua referenciando `main` no texto, refletindo o que realmente aconteceu na hora em que foi iniciada. Ao encerrar essa task específica, o PR dela deve ir contra `main` (não `ia-main`), pois foi de lá que o worktree realmente nasceu — não seguir cegamente a regra geral de `ia-main` nesse caso pontual.

**Why:** decisão do usuário para alinhar este fork ao padrão do projeto de referência (henrylle/bia), que usa `ia-main` como branch de trabalho dos agentes de IA, mantendo `main` "limpa" (sem config de agentes).

**How to apply:** toda nova task criada a partir de 2026-08-24 deve usar `ia-main` como branch base (checkout, worktree, push, PR). Só considerar `main` como base para a task 001, que é o caso legado descrito acima.
