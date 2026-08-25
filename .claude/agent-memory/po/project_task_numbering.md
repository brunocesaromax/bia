---
name: project-task-numbering
description: Estado do sequencial de tasks do backlog BIA e convenção de nomenclatura relacionada usada até agora.
metadata:
  type: project
---

Estado do backlog em 2026-08-24:
- 001 (`001-feat-tela-versao-aplicacao.md`) — agent `dev`, status `todo`. Tela de versão no frontend, consome `GET /api/versao` (texto puro).
- 002 (`002-feat-api-dados-versao.md`) — agent `dev`, status `todo`. Novo endpoint `GET /api/versao/info` (JSON).
- 003 (`003-test-api-dados-versao.md`) — agent `dev`, status `todo`. Testes automatizados do endpoint da task 002. **Depende da 002 estar em `done`/PR mergeado antes de iniciar** (worktree nasce de `ia-main`, que só terá o endpoint depois do merge).
- `.claude/tasks/sequencial.md` atualizado para "Última Task: 003".

Convenção adotada (não obrigatória pela especificação, mas usada aqui para deixar a relação óbvia): quando duas tasks são pares feat/test do mesmo recurso, usar o **mesmo resumo** (slug), variando apenas o prefixo de tipo — ex. `002-feat-api-dados-versao` / `003-test-api-dados-versao`.

**Why:** Facilita rastrear rapidamente quais tasks estão relacionadas só pelo nome do arquivo, sem precisar abrir o conteúdo.

**How to apply:** Ao criar uma task de teste que depende de uma task de feature específica, considerar reusar o mesmo resumo com prefixo de tipo diferente, e sempre declarar a dependência de merge explicitamente na seção "Dependências" e no "CHECKLIST DE INÍCIO" da task dependente (ver [[project_versao_api_design]] para o caso concreto).

Nota: tasks 002 e 003 foram criadas e mostradas para revisão do usuário, mas **ainda não commitadas/pushadas** nem o `sequencial.md` — aguardando aprovação antes de qualquer commit.
