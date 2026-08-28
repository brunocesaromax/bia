---
name: dev-compose-worktree-conflict
description: compose.yml usa container_name fixo (bia, database) e portas fixas (3001, 5433) — só um worktree pode ter o ambiente docker de pé por vez
metadata:
  type: project
---

`compose.yml` na raiz define `container_name: bia` e `container_name: database` (fixos), portas `3001:8080` e `5433:5432` (fixas). Consequência: **apenas um worktree pode rodar `docker compose up` por vez**. Se outro worktree (ex.: 001) já tem o ambiente de pé, `docker compose up -d --build` no worktree novo falha com `Conflict. The container name "/database" is already in use`.

Como lidar quando a task é **frontend-only** e outro worktree está usando o ambiente:
- Não derrube o ambiente do outro worktree (pode estar em uso por outro agente).
- O `docker compose build` (sem `up`) já valida o build do client (Vite roda no Dockerfile) — serve como smoke test de compilação.
- Rodar `npm test` (jest backend) numa instância descartável da imagem buildada: `docker run --rm --entrypoint sh <projeto>-server:latest -c "npm test"`. Os testes unitários de controller não precisam de banco.
- Testar persistência de API contra o container que já está de pé em `localhost:3001` (comportamento de backend é idêntico entre branches quando a mudança é só de client).
- Confirmação visual real fica com o agente **qa** / usuário. Ver [[dev-client-testing-setup]].
