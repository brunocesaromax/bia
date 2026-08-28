# Regras de Worktree - Projeto BIA (Steering File para Agents)

## 📍 Padrão Adotado
Seguimos o **padrão Claude/Codex** de worktrees dentro do projeto.

## 🎯 Localização
- **Pasta de worktrees:** `.claude/worktrees/`
- **Gitignore:** Pasta `.claude/worktrees/` está no `.gitignore`
- **Branch base:** SEMPRE `ia-main`

## 🔄 Workflow para Agents (Dev/DevOps/QA)

### Quando receber uma task para implementar:

#### 1. Verificação Inicial (OBRIGATÓRIO)
```bash
# Verificar branch atual
git branch --show-current

# Se NÃO estiver em ia-main:
# - PERGUNTAR ao usuário se pode trocar para ia-main
# - Aguardar autorização
# - Após autorização:
git checkout ia-main
git pull origin ia-main
```

#### 2. Movimentação da Task
```bash
# Mover task de .claude/tasks/ para .claude/tasks/doing/
mv .claude/tasks/<nome-da-task>.md .claude/tasks/doing/

# Commit e push no ia-main
git add .claude/tasks/
git commit -m "move: task <número> para doing"
git push origin ia-main
```

#### 3. Criação do Worktree
```bash
# Obrigatório: usar o script. Ele cria o worktree E copia o .env do worktree
# principal, para que `docker compose up` já funcione com o banco conectado.
scripts/criar-worktree.sh <nome-da-task> [branch] [branch-base]

# Exemplo para task 006-feat-nova-funcionalidade (branch e base assumem padrão):
scripts/criar-worktree.sh 006-feat-nova-funcionalidade

# Nomenclatura do branch (2º argumento, se precisar sobrescrever o padrão feature/):
# - feat: feature/<número>-<tipo>-<resumo>
# - fix:  fix/<número>-<tipo>-<resumo>
# - test: test/<número>-<tipo>-<resumo>

# Equivalente manual (só se o script não existir):
#   git worktree add .claude/worktrees/<nome> -b <branch> ia-main
#   cp .env .claude/worktrees/<nome>/.env   # .env é git-ignored, não vem sozinho
```

#### 4. Entrar no Worktree e Trabalhar
```bash
# Navegar para o worktree
cd .claude/worktrees/<nome-da-task>

# Confirmar branch
git branch --show-current

# Implementar as atividades da task
# Marcar itens do checklist conforme conclusão

# Fazer commits frequentes
git add .
git commit -m "tipo: descrição da mudança"

# Push do branch
git push -u origin <nome-do-branch>
```

#### 5. Durante a Implementação
- **Marcar** itens da task à medida que são concluídos
- **Fazer commits** descritivos e frequentes
- **Testar** localmente antes de finalizar
- **Manter** contexto da task atualizado

#### 6. Finalização (IMPORTANTE)
```bash
# Garantir que todos os itens da task estão marcados ✅
# Fazer commit e push final
git add .
git commit -m "tipo: finaliza implementação da task <número>"
git push origin <nome-do-branch>

# Voltar para o diretório principal
cd ../../..

# NOTIFICAR O PO
# "Task <número> concluída. Aguardando revisão do PO para encerramento."
```

**⚠️ CRÍTICO:** O agent **NÃO** remove o worktree. Apenas o PO faz isso após PR mergeado.

## 🎯 Workflow para PO

### Quando notificado de task concluída:

#### 1. Revisão
```bash
# Entrar no worktree para revisar
cd .claude/worktrees/<nome-da-task>

# Revisar código
# Verificar checklist completo ✅
# Testar funcionalidade
```

#### 2. Movimentação para Done
```bash
# Voltar para raiz
cd ../../..

# Mover task para done
mv .claude/tasks/doing/<nome-da-task>.md .claude/tasks/done/

# Commit e push no ia-main
git checkout ia-main
git add .claude/tasks/
git commit -m "move: task <número> para done"
git push origin ia-main
```

#### 3. Abertura de Pull Request
```bash
# Pré-requisito: gh CLI instalado e autenticado (gh auth status)

# ANTES de abrir PR: confirmar que está no branch da feature
cd .claude/worktrees/<nome-da-task>
git branch --show-current
# Deve mostrar: feature/<número>-<tipo>-<resumo>

# Abrir PR contra ia-main
gh pr create --base ia-main --title "<número>: <resumo>" --body "Closes task <número>"

# Exemplo:
# gh pr create --base ia-main --title "006: Nova funcionalidade" --body "Closes task 006"
```

**⚠️ NUNCA abrir PR contra outro branch que não seja `ia-main`.**

#### 4. Após PR Mergeado (ETAPA FINAL)
```bash
# Voltar para raiz (se estiver no worktree)
cd ../../..

# Remover worktree
git worktree remove .claude/worktrees/<nome-da-task>

# Se houver arquivos não commitados, usar força:
git worktree remove --force .claude/worktrees/<nome-da-task>

# Limpar registros
git worktree prune

# (Opcional) Deletar branch local
git branch -d <nome-do-branch>

# Notificar conclusão
# "Task <número> finalizada. Worktree removido. PR #<número> mergeado com sucesso."
```

## 📋 Comandos de Referência

### Listar Worktrees
```bash
git worktree list
```

### Verificar Branch Atual
```bash
git branch --show-current
```

### Criar Worktree (com .env provisionado)
```bash
scripts/criar-worktree.sh <nome> [branch] [branch-base]
```

### Remover Worktree (PO apenas)
```bash
git worktree remove .claude/worktrees/<nome>
# Ou com força:
git worktree remove --force .claude/worktrees/<nome>
```

### Limpar Registros (PO apenas)
```bash
git worktree prune
```

## ⚠️ Regras Críticas

### ✅ Obrigatório
- Branch base SEMPRE `ia-main`
- Worktrees SEMPRE em `.claude/worktrees/`
- Verificar branch antes de iniciar task
- Perguntar autorização para trocar de branch
- Mover task para doing antes de criar worktree
- Commit e push da movimentação no ia-main
- Marcar itens da task durante implementação
- Notificar PO quando concluir
- PO abre PR do branch da feature
- PO remove worktree APENAS após PR mergeado

### ❌ Proibido
- Criar worktree fora de `.claude/worktrees/`
- Partir de branch diferente de `ia-main`
- Agent remover worktree (só PO pode)
- Abrir PR contra outro branch que não seja `ia-main`
- Remover worktree antes do PR ser mergeado
- Esquecer de fazer push do branch

## 🔧 Troubleshooting

### "Worktree já existe"
```bash
git worktree list
git worktree remove .claude/worktrees/<nome>
```

### "Branch já existe"
```bash
git branch -a
git branch -d <nome-do-branch>
```

### "Não estou no branch correto"
```bash
git branch --show-current
# Se não for ia-main (para início) ou feature/* (para trabalho):
# Perguntar ao usuário o que fazer
```

## 📊 Estados da Task

```
.claude/tasks/           → Task criada (aguardando início)
       ↓
.claude/tasks/doing/     → Task em andamento (agent trabalhando)
       ↓
.claude/tasks/done/      → Task concluída (PR mergeado, worktree removido)
```

## 🎓 Lembretes para Agents

1. **SEMPRE** verificar branch atual antes de iniciar
2. **SEMPRE** perguntar antes de trocar de branch
3. **SEMPRE** mover task para doing antes de criar worktree
4. **SEMPRE** criar worktree em `.claude/worktrees/`
5. **SEMPRE** partir de `ia-main`
6. **SEMPRE** notificar PO quando concluir
7. **NUNCA** remover worktree (só PO pode)
8. **NUNCA** abrir PR (só PO pode)

---

**Este documento deve ser consultado por todos os agents (dev, devops, qa) ao receber uma nova task.**

> Adaptado do fluxo original do projeto [henrylle/bia (branch ia-main)](https://github.com/henrylle/bia/tree/ia-main/.kiro). Este fork usa `ia-main` como branch base do fluxo de agentes, assim como o projeto de referência; a branch `main` deste repositório é mantida separada, sem a configuração de agentes.
