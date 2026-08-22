Regras em: .claude/rules/*

## Agentes e organização do projeto

Este projeto usa 100% Claude Code (não Kiro CLI). Toda a configuração de agentes, regras, docs de workflow e tasks vive em `.claude/`, de forma autocontida:

- `.claude/agents/*.md` — subagentes (bia, dev, devops, po, qa)
- `.claude/rules/*.md` — regras de infraestrutura, Dockerfile e pipeline
- `.claude/docs/*.md` — docs do fluxo de worktree/task (usado pelo agente po)
- `.claude/tasks/` — backlog de tasks (todo → doing → done)
- `.claude/agent-memory/<agente>/` — memória persistente de cada agente

**`.kiro/` é legado e não é mais usado por nada em `.claude/`.** Ele foi mantido temporariamente só por precaução, mas pode ser removido (`rm -rf .kiro`) a qualquer momento sem causar nenhuma regressão ou perda — todo o conteúdo relevante já foi migrado para `.claude/`. Não recrie referências a `.kiro/` em novos arquivos de agente.
