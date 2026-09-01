# [005] - Workflow de CI no GitHub Actions rodando os testes a cada PR contra ia-main

## 🔧 Configuração Inicial (LEIA ANTES DE INICIAR)

### Agent Responsável
**devops** - Este agent deve iniciar a implementação.

### Branch Base
**SEMPRE `ia-main`**

### Worktree
Esta task será implementada em worktree isolado em `.claude/worktrees/005-feat-github-actions-testes-pr/`

---

## ⚠️ CHECKLIST DE INÍCIO (OBRIGATÓRIO)

Antes de começar a implementar, o agent deve:

- [ ] **Verificar branch atual:** `git branch --show-current`
  - Se não estiver em `ia-main`, **PERGUNTAR** ao usuário se pode trocar
  - Aguardar autorização
  - Após autorização: `git checkout ia-main && git pull origin ia-main`

- [ ] **Mover task para doing:**
  ```bash
  mv .claude/tasks/005-feat-github-actions-testes-pr.md .claude/tasks/doing/
  git add .claude/tasks/
  git commit -m "move: task 005 para doing"
  git push origin ia-main
  ```

- [ ] **Criar worktree** (o script já copia o `.env` do worktree principal, então
  `docker compose up` funciona de imediato com o banco conectado):
  ```bash
  scripts/criar-worktree.sh 005-feat-github-actions-testes-pr
  cd .claude/worktrees/005-feat-github-actions-testes-pr
  git branch --show-current  # Deve mostrar: feature/005-feat-github-actions-testes-pr
  ```

---

## 📋 Tipo
**feat** - Nova automação de integração contínua (CI) para o repositório.

## 📝 Resumo
Configurar um workflow do GitHub Actions que roda a suíte de testes do projeto
automaticamente sempre que um Pull Request for aberto ou atualizado tendo
`ia-main` como branch base.

## 📖 Descrição
Como mantenedor do projeto BIA, eu quero que os testes rodem automaticamente em
todo Pull Request contra `ia-main`, para que nenhuma mudança seja mergeada sem
que a suíte de testes esteja verde, dando segurança para os alunos revisarem e
aprovarem PRs.

## 📊 Contexto Técnico (LER ANTES DE IMPLEMENTAR)

- **Comando de teste do projeto:** `npm test` na raiz (script `"test": "jest tests/unit"` no `package.json`).
- **O `client/` NÃO tem script de teste** (`client/package.json` só tem `dev`, `build`, `preview`, `server`). Portanto o workflow roda apenas o `npm test` da raiz.
- **Os testes NÃO dependem de banco de dados.** Os testes em `tests/unit/controllers/`
  (`versao.test.js`, `tarefas.test.js`) são unitários puros: mockam `api/models` com
  `jest.mock(...)` e simulam `req`/`res` com `jest.fn()`. Não há conexão Sequelize/Postgres real.
  **Logo, NÃO é necessário serviço auxiliar (Postgres) no workflow.**
- **Versão do Node:** 22 (o `Dockerfile` usa `node:22.22.1-slim`).
- **Lockfile:** existe `package-lock.json` na raiz, então usar `npm ci`.
- **Filosofia do projeto:** simplicidade acima de tudo (público-alvo: alunos).
  O workflow deve ser o mais curto e legível possível, um único job.

## ✅ Critérios de Aceitação

### Funcionalidades Principais
- [ ] Existe o arquivo `.github/workflows/ci.yml` (novo diretório `.github/workflows/`).
- [ ] O gatilho é `pull_request` com `branches: [ia-main]` (dispara em PR aberto, sincronizado e reaberto — comportamento padrão do evento `pull_request`).
- [ ] O workflow executa, em um único job em `ubuntu-latest`:
  - `actions/checkout@v4`
  - `actions/setup-node@v4` com `node-version: 22` e `cache: npm`
  - `npm ci`
  - `npm test`
- [ ] O workflow **não** declara nenhum `services:` (sem Postgres), pois os testes não usam banco.
- [ ] O YAML é válido e o job tem um `name` claro (ex: `testes`) e o workflow um `name` claro (ex: `CI - Testes`).

### Simplicidade
- [ ] Nenhuma etapa extra além das necessárias (sem lint, sem matrix de versões, sem deploy, sem cache manual além do `cache: npm`).
- [ ] Comentário curto no topo do YAML explicando o que ele faz (didático para alunos).

## 🧪 Testes / Validação
- [ ] Validar o YAML localmente (ex: `npx --yes yaml-lint .github/workflows/ci.yml` ou revisão cuidadosa da indentação).
- [ ] Rodar `npm ci && npm test` no worktree e confirmar que a suíte passa (é o mesmo comando que o CI vai rodar).
- [ ] Após o push do branch e a abertura do PR (feita pelo PO), confirmar que o GitHub Actions dispara o workflow no PR e que ele fica verde.

## 📚 Definição de Pronto (DoD)
- [ ] `.github/workflows/ci.yml` criado e commitado no branch da feature.
- [ ] `npm ci && npm test` passa localmente no worktree.
- [ ] Todos os itens do checklist marcados ✅
- [ ] Commits descritivos e frequentes
- [ ] Push do branch realizado
- [ ] Código segue a filosofia de simplicidade do projeto

---

## 🎯 CHECKLIST DE IMPLEMENTAÇÃO (MARCAR DURANTE O TRABALHO)

### Configuração
- [ ] Worktree criado e branch `feature/005-feat-github-actions-testes-pr` confirmado
- [ ] `npm ci` rodado no worktree

### Desenvolvimento
- [ ] Criar diretório `.github/workflows/`
- [ ] Criar `.github/workflows/ci.yml` com o gatilho `pull_request` → `branches: [ia-main]`
- [ ] Job único `testes` em `ubuntu-latest` com checkout + setup-node (Node 22, cache npm) + `npm ci` + `npm test`
- [ ] Adicionar comentário didático no topo do arquivo

### Testes
- [ ] YAML validado (lint ou revisão de indentação)
- [ ] `npm ci && npm test` executado com sucesso no worktree

### Finalização
- [ ] Código revisado
- [ ] Commits finalizados com mensagens descritivas
- [ ] Push do branch realizado
- [ ] Todos os itens acima marcados ✅

---

## ⚠️ FINALIZAÇÃO DA TASK (OBRIGATÓRIO)

Quando o agent concluir a implementação:

### 1. Verificação Final
```bash
pwd
# Deve estar em: /home/bruno-cesar/formacaoaws/bia/.claude/worktrees/005-feat-github-actions-testes-pr

git branch --show-current
# Deve mostrar: feature/005-feat-github-actions-testes-pr
```

### 2. Commit e Push Final
```bash
git add .
git commit -m "feat: adiciona workflow de CI (GitHub Actions) rodando testes em PR contra ia-main"
git push origin feature/005-feat-github-actions-testes-pr
```

### 3. Voltar para Raiz e Notificar PO
```bash
cd ../../..
```

**NOTIFICAR O PO:**
> "Task 005 concluída. Todos os itens do checklist marcados. Branch `feature/005-feat-github-actions-testes-pr` com push realizado. Aguardando revisão do PO para encerramento e abertura de PR."

**⚠️ NÃO REMOVER O WORKTREE. Apenas o PO faz isso após o PR ser mergeado.**

---

## 🎯 ENCERRAMENTO PELO PO (QUANDO NOTIFICADO)

### 1. Revisão
```bash
cd .claude/worktrees/005-feat-github-actions-testes-pr
# Revisar o ci.yml, conferir gatilho, ausência de services, comando npm test
# Verificar se todos os itens estão ✅
```

### 2. Aprovar e Mover para Done
```bash
cd ../../..
mv .claude/tasks/doing/005-feat-github-actions-testes-pr.md .claude/tasks/done/
git checkout ia-main
git add .claude/tasks/
git commit -m "move: task 005 para done"
git push origin ia-main
```

### 3. Abrir Pull Request
```bash
cd .claude/worktrees/005-feat-github-actions-testes-pr
git branch --show-current
# Deve mostrar: feature/005-feat-github-actions-testes-pr

gh pr create --base ia-main \
  -R brunocesaromax/bia \
  --head brunocesaromax:feature/005-feat-github-actions-testes-pr \
  --title "005: Workflow de CI rodando testes em PR contra ia-main" \
  --body "Closes task 005"
```
> Observação: o `gh` resolve o `origin` para o repo upstream (fork henrylle/bia).
> Por isso os flags `-R` e `--head` são obrigatórios para abrir o PR no fork correto.
> Este é o primeiro PR que traz um workflow de Actions — confirmar no PR que a
> action "CI - Testes" foi disparada e ficou verde antes do merge.

### 4. Após PR Mergeado
```bash
cd ../../..
git worktree remove .claude/worktrees/005-feat-github-actions-testes-pr
git worktree prune
git branch -d feature/005-feat-github-actions-testes-pr
# Notificar conclusão
```

---

## 📊 Notas Técnicas

Esboço de referência do `.github/workflows/ci.yml` (o devops pode ajustar detalhes,
mantendo os critérios de aceitação):

```yaml
# Roda a suite de testes do projeto a cada Pull Request aberto/atualizado
# tendo a branch ia-main como base.
name: CI - Testes

on:
  pull_request:
    branches:
      - ia-main

jobs:
  testes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci

      - run: npm test
```

- O evento `pull_request` já dispara nos tipos `opened`, `synchronize` e `reopened`
  por padrão — cobre "PR aberto e atualizado" sem precisar declarar `types:`.
- Sem `services:` porque a suíte (`tests/unit/controllers/*`) mocka os models; não há Postgres.
- `cache: npm` do `setup-node` usa o `package-lock.json` da raiz.

## 💼 Valor de Negócio
**Alto** - Garante que todo PR contra `ia-main` só é mergeado com os testes verdes,
reduzindo regressões e servindo de exemplo didático de CI para os alunos.

## 🎯 Estimativa
**1 Story Point** - Um único arquivo YAML curto, sem dependências de banco.

## 🔗 Dependências
Nenhuma. (A suíte de testes já existe: tasks 003 e infra de testes do backend.)

---

## 📚 Referências
- [Worktree Workflow](.claude/docs/worktree-workflow.md)
- [Worktree Steering](.claude/docs/worktree-steering.md)
- [Task Template](.claude/docs/task-template-with-worktree.md)
- [Regras de Pipeline](.claude/rules/pipeline.md)
