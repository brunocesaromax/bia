---
name: gh-pr-repo-fork
description: gh resolve este repo para henrylle/bia (fork parent) — PRs exigem -R brunocesaromax/bia e --head brunocesaromax:
metadata:
  type: project
---

`gh` está instalado e autenticado (conta `brunocesaromax`, keyring, remote via SSH) — confirmado 2026-08-27,
PR #1 da task 004 aberto com sucesso.

**Gotcha:** `gh repo view` resolve este diretório para `henrylle/bia` (o parent do fork), não para
`brunocesaromax/bia`. Um `gh pr create` simples falha com
"No commits between... / Head ref must be a branch".

**How to apply:** ao abrir PR de encerramento de task, use SEMPRE os flags explícitos:
```bash
gh pr create -R brunocesaromax/bia \
  --base ia-main \
  --head brunocesaromax:feature/<task> \
  --title "NNN: <resumo>" \
  --body "Closes task NNN"
```
E consulte/mergeie também com `-R brunocesaromax/bia` (ex.: `gh pr view <n> -R brunocesaromax/bia`).
O worktree só é removido após o merge — regra inalterada.
