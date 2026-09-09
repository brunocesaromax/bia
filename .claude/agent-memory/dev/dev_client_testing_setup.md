---
name: dev-client-testing-setup
description: Como validar mudanças exclusivas de client/ localmente (porta do Vite, apontar VITE_API_URL para o container já rodando, ausência de browser automation no dev)
metadata:
  type: project
---

Ao validar mudanças exclusivas de `client/` (sem rebuild do container backend), observar:

- O container backend (`docker compose`) já expõe a app completa (API + build do client) em `http://localhost:3001` (mapeado de `8080` interno, ver `compose.yml`). O `client/vite.config.js` também usa porta `3001` por padrão — **conflito de porta** ao rodar `npx vite`/`yarn dev` com o container já de pé. Rodar o dev server em outra porta, ex.: `npx vite --port 5180`.
- O fallback de `apiUrl` em `client/src/App.jsx` é `http://localhost:8080` (porta interna do container), que **não é acessível diretamente do host**. Para o dev server local falar com o container já rodando, exportar `VITE_API_URL=http://localhost:3001` antes de subir o Vite.
- O `Dockerfile` faz o build do client com `VITE_API_URL=http://<IP-de-prod>` **embutido** (`RUN cd client && VITE_API_URL=... npm run build`). Ou seja, a página servida pelo container em `http://localhost:3001/` aponta para a API de produção, não para a local — **não dá para testar a UI abrindo a raiz do container**. Teste de UI local = `npx vite --port <livre>` com `VITE_API_URL=http://localhost:3001`, ou passar para o agente **qa**.
- Sem runner de teste no `client/` (não há `vitest`/`jest` nem script `test` no `client/package.json`, apesar das libs `@testing-library/*` estarem no `package.json`). Para validar helper puro (ex.: conversão de data), usar script `node --input-type=module -e '...'` ad-hoc; **não** adicionar dependência de teste só para isso a menos que a task peça.
- Rodar `npm install` em `client/` (quando `node_modules` não existe no worktree) tende a reescrever `client/package-lock.json` e `client/yarn.lock` mesmo sem mudança real de dependências (bump de metadados). Se a task não é sobre dependências, reverter esses dois arquivos (`git checkout -- client/package-lock.json client/yarn.lock`) antes de commitar, para não poluir o diff.
- O agente **dev** não tem acesso a nenhuma ferramenta de browser/Playwright (isso é exclusivo do agente **qa**). Validação de UI fica limitada a: curl smoke tests (status HTTP das rotas, ausência de erro de compilação do Vite/log do bundle), revisão de código, e reaproveitamento deliberado de classes/variáveis CSS já usadas e "provadas" em outras telas (tema claro/escuro, responsividade) em vez de inspeção visual real. Quando a task pedir teste visual completo (tema, responsividade, clique de navegação), deixar claro no relatório final que a confirmação pixel-a-pixel depende de uma passada do agente **qa** (Playwright) ou do usuário no navegador.

Ver também [[dev-worktree-task-flow]].
