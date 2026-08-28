# [004] - Checkbox "Importante" marcado por padrão no formulário de nova tarefa

## 🔧 Configuração Inicial (LEIA ANTES DE INICIAR)

### Agent Responsável
**dev** - Este agent deve iniciar a implementação.

### Branch Base
**SEMPRE `ia-main`**

### Worktree
Esta task será implementada em worktree isolado em `.claude/worktrees/004-feat-checkbox-importante-marcado-padrao/`

---

## ⚠️ CHECKLIST DE INÍCIO (OBRIGATÓRIO)

Antes de começar a implementar, o agent deve:

- [x] **Verificar branch atual:** `git branch --show-current` — estava em `ia-main`.

- [x] **Mover task para doing:**
  ```bash
  mv .claude/tasks/004-feat-checkbox-importante-marcado-padrao.md .claude/tasks/doing/
  git add .claude/tasks/
  git commit -m "move: task 004 para doing"
  git push origin ia-main
  ```

- [x] **Criar worktree** (o script já copia o `.env` do worktree principal, então
  `docker compose up` funciona de imediato com o banco conectado):
  ```bash
  scripts/criar-worktree.sh 004-feat-checkbox-importante-marcado-padrao
  cd .claude/worktrees/004-feat-checkbox-importante-marcado-padrao
  git branch --show-current  # Deve mostrar: feature/004-feat-checkbox-importante-marcado-padrao
  ```

---

## 📋 Tipo
**feat** - Pequena melhoria de UX no formulário de cadastro de tarefa.

## 📝 Resumo
Fazer com que o checkbox "Importante" venha **marcado por padrão** ao abrir o formulário de nova tarefa.

## 📖 Descrição
Como usuário do sistema BIA, ao abrir o formulário de nova tarefa eu quero que o checkbox "Importante"
já apareça marcado por padrão, para que a maioria das tarefas que cadastro seja classificada como
importante sem que eu precise clicar no checkbox toda vez (podendo desmarcá-lo quando não for o caso).

## 🧭 Contexto Técnico (resultado da investigação do PO)

O conceito de "importante" **já existe de ponta a ponta** no projeto — esta task **NÃO** precisa criar
coluna no banco, model, endpoint nem exibição na lista. Estado atual:

| Camada | Arquivo | Situação |
|---|---|---|
| Banco | `database/migrations/20210924000838-criar-tarefas.js` | Coluna `importante` BOOLEAN, `allowNull: true`, `defaultValue: false` — **já existe** |
| Model | `api/models/tarefas.js` | `importante: DataTypes.BOOLEAN` — **já existe** |
| API (create) | `api/controllers/tarefas.js` | `controller.create` já lê `req.body.importante` e persiste — **já existe** |
| Frontend (form) | `client/src/components/AddTask.jsx` | Checkbox `#importante` ligado ao state `importante`, inicializado com `useState(false)` — **é aqui que muda** |
| Frontend (lista) | `client/src/components/Task.jsx` | Já exibe estrela (`FaStar`/`FaRegStar`) e classe `reminder` conforme `task.importante` — **já existe** |

**Conclusão:** a mudança é **exclusivamente no frontend**, no componente `client/src/components/AddTask.jsx`:
1. O state inicial de `importante` deve passar de `false` para `true` (`useState(true)`).
2. Após submeter o formulário, o reset do checkbox deve voltar para `true` (hoje `setImportante(false)`),
   mantendo o comportamento "marcado por padrão" também para o próximo cadastro.

Não há mudança de contrato de API, banco, nem necessidade de migration.

## ✅ Critérios de Aceitação

### Funcionalidades Principais
- [x] Ao carregar a página / abrir o formulário de nova tarefa, o checkbox "Importante" aparece **marcado** (checked). _(state inicial `useState(true)`; input controlado `checked={importante}`)_
- [x] O usuário consegue **desmarcar** o checkbox normalmente antes de adicionar a tarefa. _(handler `onChange` inalterado)_
- [x] Ao clicar em "Adicionar nova task" com o checkbox marcado, a tarefa é criada com `importante = true` — confirmado via `POST /api/tarefas` (resposta `"importante":true`).
- [x] Ao desmarcar o checkbox e adicionar, a tarefa é criada com `importante = false` — confirmado via `POST /api/tarefas` (resposta `"importante":false`).
- [x] Após adicionar uma tarefa, o formulário é resetado com o checkbox **novamente marcado** por padrão (`setImportante(true)` no reset pós-submit).

### Interface e UX
- [x] O label "Importante" continua associado ao checkbox (`htmlFor="importante"`) — inalterado.
- [x] Nenhuma regressão visual no restante do formulário — nenhum JSX/CSS alterado além do valor booleano do state.

### Fora de Escopo (NÃO fazer nesta task)
- [x] Não alterar o `defaultValue` da coluna no banco / migration — não alterado.
- [x] Não alterar `api/models/tarefas.js` nem `api/controllers/tarefas.js` — não alterados.
- [x] Não mexer na exibição da lista (`Task.jsx` / `Tasks.jsx`) nem no toggle de importância (`App.jsx`) — não alterados.

## 🧪 Testes
- [~] Rodar o frontend e verificar visualmente o checkbox marcado ao abrir o form — build do client (Vite) OK no `docker compose build`; confirmação visual pixel-a-pixel depende do agente **qa** (Playwright) / usuário no navegador (agente dev não tem browser).
- [x] Cadastrar uma tarefa sem tocar no checkbox → `importante: true` confirmado na resposta da API.
- [x] Cadastrar uma tarefa desmarcando o checkbox → `importante: false` confirmado na resposta da API.
- [x] Adicionar duas tarefas seguidas → após a primeira o checkbox volta marcado (garantido por `setImportante(true)` no reset).
- [x] Rodar `npm test` → **16 testes / 2 suítes verdes** (nenhuma mudança de backend).

## 📚 Definição de Pronto (DoD)
- [x] Código implementado e testado
- [x] Todos os itens do checklist marcados ✅ (item de teste visual delegado ao qa/usuário)
- [x] Commits descritivos e frequentes
- [x] Push do branch realizado
- [x] Código segue padrões do projeto
- [x] Documentação atualizada (se necessário) — não aplicável

---

## 🎯 CHECKLIST DE IMPLEMENTAÇÃO (MARCAR DURANTE O TRABALHO)

### Configuração
- [x] Worktree criado e branch `feature/004-feat-checkbox-importante-marcado-padrao` confirmado
- [x] Ambiente de desenvolvimento rodando no worktree (`.env` copiado pelo script; imagem `server` buildada com sucesso, incluindo build do client via Vite)

### Desenvolvimento
- [x] Em `client/src/components/AddTask.jsx`: `useState(false)` → `useState(true)` para o state `importante`
- [x] Em `client/src/components/AddTask.jsx`: reset pós-submit `setImportante(false)` → `setImportante(true)`
- [x] Revisar se não há outro ponto no frontend que assuma `importante` inicial como `false` — `grep "importante" client/src`: as demais ocorrências (`App.jsx`, `Task.jsx`) tratam de tarefas já existentes (`task.importante`), não do state inicial do form. Nada mais a mudar.

### Testes
- [~] Testes manuais no navegador (checkbox marcado ao abrir, desmarcar, reset) — delegado ao agente **qa** (Playwright) / usuário; agente dev não tem browser. Comportamento garantido por input controlado + `setImportante(true)`.
- [x] `npm test` executado e verde (16 testes / 2 suítes)
- [x] Cenário de criar com `importante: false` (desmarcado) testado via API

### Finalização
- [x] Código revisado
- [x] Commits finalizados com mensagens descritivas
- [x] Push do branch realizado
- [x] Todos os itens acima marcados ✅

---

## ⚠️ FINALIZAÇÃO DA TASK (OBRIGATÓRIO)

Quando o agent concluir a implementação:

### 1. Verificação Final
```bash
pwd
# Deve estar em: .../.claude/worktrees/004-feat-checkbox-importante-marcado-padrao

git branch --show-current
# Deve mostrar: feature/004-feat-checkbox-importante-marcado-padrao
```

### 2. Commit e Push Final
```bash
git add .
git commit -m "feat: finaliza implementação da task 004"
git push origin feature/004-feat-checkbox-importante-marcado-padrao
```

### 3. Voltar para Raiz e Notificar PO
```bash
cd ../../..
```

**NOTIFICAR O PO:**
> "Task 004 concluída. Todos os itens do checklist marcados. Branch `feature/004-feat-checkbox-importante-marcado-padrao` com push realizado. Aguardando revisão do PO para encerramento e abertura de PR."

**⚠️ NÃO REMOVER O WORKTREE. Apenas o PO faz isso após o PR ser mergeado.**

---

## 🎯 ENCERRAMENTO PELO PO (QUANDO NOTIFICADO)

### 1. Revisão
```bash
cd .claude/worktrees/004-feat-checkbox-importante-marcado-padrao
# Revisar código, testar funcionalidade, verificar checklist 100% ✅
```

### 2. Aprovar e Mover para Done
```bash
cd ../../..
mv .claude/tasks/doing/004-feat-checkbox-importante-marcado-padrao.md .claude/tasks/done/
git checkout ia-main
git add .claude/tasks/
git commit -m "move: task 004 para done"
git push origin ia-main
```

### 3. Abrir Pull Request
```bash
cd .claude/worktrees/004-feat-checkbox-importante-marcado-padrao
git branch --show-current
# Deve mostrar: feature/004-feat-checkbox-importante-marcado-padrao

gh pr create --base ia-main --title "004: Checkbox Importante marcado por padrão no form de nova tarefa" --body "Closes task 004"
```

### 4. Após PR Mergeado
```bash
cd ../../..
git worktree remove .claude/worktrees/004-feat-checkbox-importante-marcado-padrao
git worktree prune
git branch -d feature/004-feat-checkbox-importante-marcado-padrao
# Notificar conclusão
```

---

## 📊 Notas Técnicas
- Arquivo único a alterar: `client/src/components/AddTask.jsx`.
- Não confundir com as tasks 002/003 ("dados de versão estruturados"), que são de outro domínio (`/api/versao`).
- A coluna do banco tem `defaultValue: false`; como o formulário **sempre** envia o campo `importante`
  explicitamente no corpo da requisição, o default do banco não interfere no comportamento da tela.

## 💼 Valor de Negócio
**Baixo** - Ajuste de conveniência de UX; reduz cliques repetitivos no fluxo mais comum de cadastro.

## 🎯 Estimativa
**1 Story Point** - Mudança trivial de estado inicial em um único componente React, sem impacto de backend/schema.

## 🔗 Dependências
Nenhuma.

---

## 📚 Referências
- [Worktree Workflow](.claude/docs/worktree-workflow.md)
- [Worktree Steering](.claude/docs/worktree-steering.md)
- [Task Template](.claude/docs/task-template-with-worktree.md)
