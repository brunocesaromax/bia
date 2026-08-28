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

- [ ] **Verificar branch atual:** `git branch --show-current`
  - Se não estiver em `ia-main`, **PERGUNTAR** ao usuário se pode trocar
  - Aguardar autorização
  - Após autorização: `git checkout ia-main && git pull origin ia-main`

- [ ] **Mover task para doing:**
  ```bash
  mv .claude/tasks/004-feat-checkbox-importante-marcado-padrao.md .claude/tasks/doing/
  git add .claude/tasks/
  git commit -m "move: task 004 para doing"
  git push origin ia-main
  ```

- [ ] **Criar worktree** (o script já copia o `.env` do worktree principal, então
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
- [ ] Ao carregar a página / abrir o formulário de nova tarefa, o checkbox "Importante" aparece **marcado** (checked).
- [ ] O usuário consegue **desmarcar** o checkbox normalmente antes de adicionar a tarefa.
- [ ] Ao clicar em "Adicionar nova task" com o checkbox marcado, a tarefa é criada com `importante = true`
      (confirmável via `GET /api/tarefas` e pela estrela preenchida na lista).
- [ ] Ao desmarcar o checkbox e adicionar, a tarefa é criada com `importante = false`.
- [ ] Após adicionar uma tarefa, o formulário é resetado com o checkbox **novamente marcado** por padrão.

### Interface e UX
- [ ] O label "Importante" continua associado ao checkbox (`htmlFor="importante"`).
- [ ] Nenhuma regressão visual no restante do formulário (campos Tarefa e Data/Prazo, botão, Modal de campo obrigatório).

### Fora de Escopo (NÃO fazer nesta task)
- [ ] Não alterar o `defaultValue` da coluna no banco / migration.
- [ ] Não alterar `api/models/tarefas.js` nem `api/controllers/tarefas.js`.
- [ ] Não mexer na exibição da lista (`Task.jsx` / `Tasks.jsx`) nem no toggle de importância (`App.jsx`).

## 🧪 Testes
- [ ] Rodar o frontend (`docker compose up` ou fluxo padrão do projeto) e verificar visualmente o checkbox marcado ao abrir o form.
- [ ] Cadastrar uma tarefa sem tocar no checkbox → confirmar `importante: true` na resposta da API e estrela preenchida na lista.
- [ ] Cadastrar uma tarefa desmarcando o checkbox → confirmar `importante: false`.
- [ ] Adicionar duas tarefas seguidas → confirmar que após a primeira o checkbox volta marcado.
- [ ] Rodar `npm test` e garantir que a suíte de testes existente continua verde (nenhuma mudança de backend é esperada).

## 📚 Definição de Pronto (DoD)
- [ ] Código implementado e testado
- [ ] Todos os itens do checklist marcados ✅
- [ ] Commits descritivos e frequentes
- [ ] Push do branch realizado
- [ ] Código segue padrões do projeto
- [ ] Documentação atualizada (se necessário)

---

## 🎯 CHECKLIST DE IMPLEMENTAÇÃO (MARCAR DURANTE O TRABALHO)

### Configuração
- [ ] Worktree criado e branch `feature/004-feat-checkbox-importante-marcado-padrao` confirmado
- [ ] Ambiente de desenvolvimento rodando no worktree (`.env` copiado pelo script)

### Desenvolvimento
- [ ] Em `client/src/components/AddTask.jsx`: `useState(false)` → `useState(true)` para o state `importante`
- [ ] Em `client/src/components/AddTask.jsx`: reset pós-submit `setImportante(false)` → `setImportante(true)`
- [ ] Revisar se não há outro ponto no frontend que assuma `importante` inicial como `false`

### Testes
- [ ] Testes manuais no navegador realizados (checkbox marcado ao abrir, desmarcar funciona, reset marcado)
- [ ] `npm test` executado e verde
- [ ] Cenário de criar com `importante: false` (desmarcado) testado

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
