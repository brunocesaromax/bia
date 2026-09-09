---
name: checklist-no-branch-conflita
description: Marcação de checklist commitada no branch feature conflita com o move doing→done no ia-main — como encerrar sem conflito de PR
metadata:
  type: feedback
---

Ao encerrar uma task, se o dev/qa commitou marcações do checklist no arquivo da
task (`.claude/tasks/doing/NNN-....md`) dentro do branch `feature/NNN`, o PR contra
`ia-main` fica `CONFLICTING`: o `ia-main` renomeia `doing/NNN` → `done/NNN` (e o PO
ainda edita o conteúdo ao consolidar), e o git não casa o rename com o arquivo
modificado no branch.

**Why:** aconteceu na task 006 (PR #3). Branch tinha commit `4a7d39f docs(task-006):
marca checklist`; o `ia-main` já tinha o arquivo em `done/` com checklist consolidado
+ nota de encerramento do PO. Conflito só no `.md` da task, nunca no código.

**How to apply — fluxo de encerramento que evita o conflito:**
1. Consolidar o checklist marcado + nota de encerramento do PO em
   `.claude/tasks/done/NNN-....md` no `ia-main` (base: a versão marcada do branch,
   via `git show feature/NNN:.claude/tasks/doing/NNN-....md`). Commit "move: task NNN
   para done" + push no `ia-main`.
2. Abrir o PR (ver [[gh-pr-repo-fork]] para os flags).
3. Se o PR vier `CONFLICTING`, confirmar com `git merge-tree --write-tree --name-only
   origin/ia-main origin/feature/NNN` que o único conflito é o `.md` da task.
4. No worktree do branch feature, neutralizar o arquivo da task:
   `git checkout <merge-base> -- .claude/tasks/doing/NNN-....md` (restaura à versão
   da merge-base), commit "chore(task-NNN): remove marcacao de checklist do branch
   feature", push. Isso zera o diff do `.md` no branch → merge fica limpo.
5. O código (`f81f891` etc.) não é tocado.

**Ideal futuro:** instruir dev/qa a NÃO commitar marcação de checklist no branch
feature — deixar o `.md` da task intocado no branch e o PO consolida só no `done/`.
