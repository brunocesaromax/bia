---
name: encerramento-race-ia-main
description: Durante o encerramento de task, outras sessões de agente podem commitar/reescrever ia-main local em paralelo — como blindar o move doing→done
metadata:
  type: feedback
---

Ao encerrar uma task, o `ia-main` local pode receber commits (e até rewrites de
histórico) de **outra sessão de agente rodando em paralelo** no mesmo checkout,
no meio do seu fluxo.

**Why:** no encerramento da task 007 (2026-09-08), entre o 1º `git status` (HEAD
`904a26c`, "up to date") e o commit do move, uma sessão do `qa` fez:
`git fetch` (trouxe o merge do PR #3 da task 006 pra origin/ia-main), commitou
`chore(qa): fixa output-dir do Playwright MCP`, e depois `git reset HEAD~1` +
recommit pra tirar do commit dela o `git rm` da `doing/007` que eu tinha staged.
Resultado: divergência (ahead/behind), meu `git rm` staged foi sugado pro commit
alheio e depois devolvido como deleção não-commitada solta.

**How to apply — encerramento robusto:**
1. Logo antes de mexer, `git fetch origin ia-main` e cheque `git status -sb` —
   não confie no snapshot de gitStatus do início da sessão nem no brief do parent
   ("006 ainda não mergeada" pode já estar falso).
2. Se divergiu: `git -c rebase.autoStash=true pull --rebase origin ia-main`
   (autostash preserva mudanças não-commitadas de outros agentes, ex. memória do qa).
3. Faça o move `doing→done` e o `git add` **só de `.claude/tasks/`**. Se a deleção
   do `doing/NNN` aparecer solta (sugada por commit alheio), refaça `git add` dela
   e `git commit --amend --no-edit` pra manter o move atômico (rename doing→done
   num commit só).
4. **Nunca** `git add -A` / `git commit -a` no encerramento — há trabalho não-commitado
   de outros agentes (`.claude/agent-memory/qa/*`, screenshots) que não é seu.
5. `git fetch` + comparar `origin/ia-main` **imediatamente antes** do `git push`.
   Commits de outra sessão que já estão no seu `ia-main` local e não no remoto vão
   junto no push — é o comportamento esperado de branch compartilhada, tudo bem.
