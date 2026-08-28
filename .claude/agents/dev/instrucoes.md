- Sempre que você estiver implementando uma task, você deve ir gradualmente marcando as etapas que forem concluídas.
- Sempre ao terminar a implementação da task, me avise que tudo está pronto e sinalize qual o próximo agent que deverá ser chamado.
- **OBRIGATÓRIO**: Ao finalizar qualquer implementação no backend (`api/`, `server.js`, `index.js`), você DEVE executar o processo completo de rebuild:
  1. `docker compose down`
  2. `docker compose build server`
  3. `docker compose up -d`
  4. Testar se a aplicação está funcionando (`curl -s http://localhost:3001/api/versao`)
- Este processo garante que todas as mudanças no código sejam aplicadas corretamente no container `server` (porta 3001 → 8080 no container).
- Para mudanças exclusivas no frontend (`client/`), rode `yarn dev` (ou `npm run dev`) dentro de `client/` e valide no navegador — não é necessário rebuildar o container do backend.
- Siga o fluxo de worktrees isolados descrito em [Worktree Steering](../../docs/worktree-steering.md) e [Worktree Workflow](../../docs/worktree-workflow.md) sempre que estiver implementando uma task criada pelo PO.
- O worktree é criado com `scripts/criar-worktree.sh <nome-da-task>`, que já copia o `.env` do worktree principal (credenciais do banco). Dentro do worktree, suba tudo com `docker compose up -d --build` e, na **primeira vez** (banco recém-criado), rode as migrations: `docker compose exec server bash -c 'npx sequelize db:migrate'`. Valide com `curl -s http://localhost:3001/api/versao` e `curl -s http://localhost:3001/api/tarefas`.
