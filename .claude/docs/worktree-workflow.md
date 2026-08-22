# Git Worktree - Workflow do Projeto BIA

## 🎯 O que é Git Worktree?

Git Worktree permite trabalhar em **múltiplos branches simultaneamente** sem precisar fazer checkout e perder seu trabalho atual. Cada worktree é um diretório separado com seus próprios arquivos, mas compartilhando o mesmo histórico Git.

## ⚙️ Pré-requisito: GitHub CLI (`gh`)

O passo de abertura de Pull Request usa `gh pr create`. Antes de usar esse fluxo, confirme que o `gh` está instalado e autenticado:

```bash
gh --version || echo "gh não instalado"
gh auth status
```

Se não estiver instalado, veja https://cli.github.com/ (ou instale via gerenciador de pacotes da sua distro) e rode `gh auth login` uma vez.

## 📁 Onde ficam os Worktrees?

No projeto BIA, seguimos o padrão **Claude/Codex**:

```
projeto-bia/
├── .claude/
│   ├── worktrees/              ← Todos os worktrees ficam aqui
│   │   ├── 001-feat-login/     ← Worktree da task 001
│   │   ├── 002-fix-auth/       ← Worktree da task 002
│   │   └── 003-feat-dashboard/ ← Worktree da task 003
│   └── tasks/
├── src/
├── .gitignore                   ← Ignora .claude/worktrees/
└── ...
```

**Vantagem:** Tudo fica dentro do projeto, organizado e fácil de gerenciar.

## 🔄 Workflow Completo

### 1️⃣ Criação da Task (PO)

Quando você (PO) cria uma nova task, o processo é:

```bash
# PO cria a task
# Arquivo: .claude/tasks/006-feat-nova-funcionalidade.md

# Task especifica:
# - Agent responsável (dev, devops, qa)
# - Checklist de atividades
# - Branch base: SEMPRE main
```

### 2️⃣ Início da Implementação (Agent Dev/DevOps/QA)

O agent que receber a task deve:

**a) Verificar branch atual**
```bash
git branch --show-current
# Deve estar em: main
```

**b) Se não estiver em main, perguntar autorização para trocar**
```bash
# Agent pergunta: "Não estou em main. Posso trocar para ele?"
# Após autorização:
git checkout main
git pull origin main
```

**c) Mover task para doing**
```bash
# Move de .claude/tasks/ para .claude/tasks/doing/
mv .claude/tasks/006-feat-nova-funcionalidade.md .claude/tasks/doing/
```

**d) Commit e push da movimentação**
```bash
git add .claude/tasks/
git commit -m "move: task 006 para doing"
git push origin main
```

**e) Criar worktree para a task**
```bash
# Sintaxe:
git worktree add .claude/worktrees/<nome-da-task> -b <nome-do-branch> main

# Exemplo:
git worktree add .claude/worktrees/006-feat-nova-funcionalidade -b feature/006-feat-nova-funcionalidade main
```

**f) Entrar no worktree e trabalhar**
```bash
# Navegar para o worktree
cd .claude/worktrees/006-feat-nova-funcionalidade

# Verificar branch
git branch --show-current
# Saída: feature/006-feat-nova-funcionalidade

# Trabalhar normalmente
# ... editar arquivos, implementar feature ...

# Fazer commits
git add .
git commit -m "feat: implementa nova funcionalidade"

# Push do branch
git push -u origin feature/006-feat-nova-funcionalidade
```

### 3️⃣ Durante a Implementação

**Checklist obrigatório:**
- [ ] Marcar itens da task conforme conclusão
- [ ] Fazer commits frequentes e descritivos
- [ ] Testar localmente
- [ ] Manter branch atualizado com main (se necessário)

**Comandos úteis dentro do worktree:**
```bash
# Ver onde está
pwd
# Exemplo: /caminho/projeto-bia/.claude/worktrees/006-feat-nova-funcionalidade

# Ver branch atual
git branch --show-current

# Listar todos os worktrees
git worktree list

# Voltar para o diretório principal (mantendo worktree)
cd ../../..  # ou cd /caminho/completo/projeto-bia
```

### 4️⃣ Finalização da Task (Agent)

Quando o agent concluir:

```bash
# 1. Garantir que todos os itens da task estão marcados ✅
# 2. Fazer commit e push final
git add .
git commit -m "feat: finaliza implementação da task 006"
git push origin feature/006-feat-nova-funcionalidade

# 3. Voltar para o diretório principal
cd ../../..

# 4. Informar ao PO
# "Task 006 concluída. Aguardando revisão do PO para encerramento."
```

**⚠️ IMPORTANTE:** O agent **NÃO** remove o worktree. Apenas o PO faz isso.

### 5️⃣ Encerramento da Task (PO)

Quando você (PO) receber a notificação de conclusão:

**a) Revisar implementação**
```bash
# Entre no worktree para revisar
cd .claude/worktrees/006-feat-nova-funcionalidade

# Revisar código
# Verificar se todos os itens da task estão ✅
# Testar funcionalidade
```

**b) Mover task para done**
```bash
# Voltar para raiz
cd ../../..

# Mover task
mv .claude/tasks/doing/006-feat-nova-funcionalidade.md .claude/tasks/done/
```

**c) Commit e push no main**
```bash
git checkout main
git add .claude/tasks/
git commit -m "move: task 006 para done"
git push origin main
```

**d) Abrir Pull Request**
```bash
# ATENÇÃO: Antes de abrir PR, confirmar que está no branch da feature
cd .claude/worktrees/006-feat-nova-funcionalidade
git branch --show-current
# Deve mostrar: feature/006-feat-nova-funcionalidade

# Abrir PR contra main
gh pr create --base main --title "006: Nova funcionalidade" --body "Closes task 006"
```

**e) Após PR ser MERGEADO, remover worktree**
```bash
# Voltar para raiz
cd ../../..

# Remover worktree
git worktree remove .claude/worktrees/006-feat-nova-funcionalidade

# Ou com força (se houver arquivos não commitados)
git worktree remove --force .claude/worktrees/006-feat-nova-funcionalidade

# Limpar registros
git worktree prune

# (Opcional) Deletar branch local
git branch -d feature/006-feat-nova-funcionalidade
```

## 🎨 Visualização do Fluxo

```
1. PO cria task → .claude/tasks/006-feat-nova.md
                     ↓
2. Agent pega task → move para .claude/tasks/doing/
                     ↓
3. Agent cria worktree → .claude/worktrees/006-feat-nova/
                     ↓
4. Agent trabalha → commits no branch feature/006-feat-nova
                     ↓
5. Agent finaliza → notifica PO
                     ↓
6. PO revisa → move para .claude/tasks/done/
                     ↓
7. PO abre PR → gh pr create --base main
                     ↓
8. PR mergeado → PO remove worktree
```

## 📋 Comandos de Referência Rápida

### Criar Worktree
```bash
git worktree add .claude/worktrees/<nome> -b <branch> main
```

### Listar Worktrees
```bash
git worktree list
```

### Remover Worktree
```bash
git worktree remove .claude/worktrees/<nome>
# Ou com força:
git worktree remove --force .claude/worktrees/<nome>
```

### Limpar Registros
```bash
git worktree prune
```

### Verificar Branch Atual
```bash
git branch --show-current
```

## ⚠️ Regras Importantes

### ✅ O que FAZER
- Sempre partir de `main`
- Criar worktree em `.claude/worktrees/`
- Fazer commits frequentes
- Marcar itens da task durante implementação
- Notificar PO quando concluir
- PO remove worktree APENAS após PR mergeado

### ❌ O que NÃO fazer
- Não criar worktree fora de `.claude/worktrees/`
- Não partir de outro branch que não seja `main`
- Não remover worktree antes do PR ser mergeado
- Não esquecer de fazer push do branch
- Não abrir PR contra outro branch que não seja `main`

## 🔧 Troubleshooting

### Problema: "Não consigo criar worktree"
```bash
# Certifique-se de estar na raiz do projeto
pwd

# Verifique se o caminho está correto
ls -la .claude/
```

### Problema: "Worktree já existe"
```bash
# Liste worktrees existentes
git worktree list

# Remova o worktree antigo
git worktree remove .claude/worktrees/<nome>
```

### Problema: "Branch já existe"
```bash
# Liste branches
git branch -a

# Delete o branch local se necessário
git branch -d <nome-do-branch>
```

## 🎓 Conceitos para Memorizar

| Termo | Significado |
|-------|-------------|
| **Worktree** | Diretório separado com seu próprio branch |
| **Branch base** | Branch de onde o novo branch é criado (sempre `main`) |
| **`.claude/worktrees/`** | Pasta onde ficam todos os worktrees |
| **`git worktree list`** | Comando para ver todos os worktrees ativos |
| **`git worktree remove`** | Comando para remover um worktree |

---

**Lembre-se:** Worktrees são como "escritórios separados" dentro do mesmo projeto. Cada um tem suas próprias mudanças, mas todos compartilham o mesmo histórico Git! 🚀

> Adaptado do fluxo original do projeto [henrylle/bia (branch ia-main)](https://github.com/henrylle/bia/tree/ia-main/.kiro), trocando a branch base `ia-main` por `main` para este fork.
