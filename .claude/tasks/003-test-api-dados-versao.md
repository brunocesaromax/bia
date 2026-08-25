# [003] - Testes Automatizados da API de Dados de Versão

## 🔧 Configuração Inicial (LEIA ANTES DE INICIAR)

### Agent Responsável
**dev** - Este agent deve iniciar a implementação (testes de backend Node/Express, `tests/`). **Não é `qa`**: neste projeto o agente `qa` é especificamente para testes de UI via Playwright/navegador; testes automatizados de backend (unitários/Jest) são responsabilidade do `dev`.

### Branch Base
**SEMPRE `ia-main`**

### ⚠️ Dependência bloqueante (LEIA ANTES DE INICIAR)
**Esta task DEPENDE da task 002 (`002-feat-api-dados-versao.md`) estar concluída e com o PR já mergeado em `ia-main`.**
- O worktree desta task 003 é criado a partir de `ia-main` (ver fluxo padrão abaixo). Se o PR da task 002 ainda não foi mergeado, o endpoint `GET /api/versao/info` **não vai existir** na branch base, e esta task não pode ser iniciada.
- **Antes de mover esta task para `doing` e criar o worktree, o PO deve confirmar que a task 002 está em `done` e seu PR mergeado.** Se isso ainda não aconteceu, esta task permanece em `todo`.

### Worktree
Esta task será implementada em worktree isolado em `.claude/worktrees/003-test-api-dados-versao/`

---

## ⚠️ CHECKLIST DE INÍCIO (OBRIGATÓRIO)

Antes de começar a implementar, o agent deve:

- [ ] **Confirmar que a task 002 está em `done` e o PR foi mergeado em `ia-main`** (perguntar ao PO se houver qualquer dúvida)
- [ ] **Verificar branch atual:** `git branch --show-current`
  - Se não estiver em `ia-main`, **PERGUNTAR** ao usuário se pode trocar
  - Aguardar autorização
  - Após autorização: `git checkout ia-main && git pull origin ia-main`
- [ ] **Confirmar que `ia-main` já contém o endpoint `GET /api/versao/info`** (ex.: `grep -n "versao/info" api/routes/versao.js`) antes de prosseguir

- [ ] **Mover task para doing:**
  ```bash
  mv .claude/tasks/003-test-api-dados-versao.md .claude/tasks/doing/
  git add .claude/tasks/
  git commit -m "move: task 003 para doing"
  git push origin ia-main
  ```

- [ ] **Criar worktree:**
  ```bash
  git worktree add .claude/worktrees/003-test-api-dados-versao -b test/003-test-api-dados-versao ia-main
  cd .claude/worktrees/003-test-api-dados-versao
  git branch --show-current  # Confirmar branch correto
  ```

---

## 📋 Tipo
**test** - Testes automatizados de backend para a API criada na task 002.

## 📝 Resumo
Criar os testes automatizados (Jest) para o novo endpoint `GET /api/versao/info` implementado na task 002, seguindo exatamente o mesmo padrão de teste já usado no projeto para controllers.

## 📖 Descrição
Como time de desenvolvimento da BIA, eu quero ter cobertura de testes automatizados para o novo endpoint de dados estruturados de versão, para que regressões no formato/conteúdo do JSON retornado sejam detectadas automaticamente via `npm test`.

## 🔎 Contexto técnico levantado (não repetir descoberta, usar como base)

- **Já existe uma suíte de testes de backend no projeto — não é necessário propor uma ferramenta nova.** Stack de teste já configurada e em uso:
  - **Jest** já é devDependency do `package.json` raiz (`"jest": "^27.5.1"`).
  - Script já configurado: `"test": "jest tests/unit"` (`package.json` raiz).
  - Testes existentes em `tests/unit/controllers/`:
    - `tests/unit/controllers/versao.test.js` — testa o controller de versão **atual** (`get`, retorno de texto puro), chamando a função do controller diretamente.
    - `tests/unit/controllers/tarefas.test.js` — mesmo padrão, para o controller de tarefas.
  - **Padrão de teste usado (seguir exatamente):** teste **unitário puro do controller**, sem servidor HTTP real e sem `supertest` (não está instalado no projeto). O teste importa a factory do controller (`require('../../../api/controllers/versao')`), chama `controller()` para obter o objeto com os handlers, monta `req`/`res` mockados manualmente (`res.send = jest.fn()`, `res.json = jest.fn()`, etc.) e chama o handler diretamente, verificando os `jest.fn()` com `toHaveBeenCalledWith(...)`.
  - Não há `jest.config.js` separado nem configuração adicional de Jest além do script no `package.json`.
- **Não é necessário decidir entre ferramentas** (ex. Mocha, supertest, etc.) — o padrão já existe e está em uso consistente no repo; esta task deve apenas segui-lo, e não introduzir uma ferramenta/abordagem nova (alinhado à filosofia de simplicidade do projeto, `.claude/rules/*.md`).
- **O que esta task testa:** exclusivamente o novo handler criado na task 002 (`getInfo`, endpoint `GET /api/versao/info`, retorno JSON `{ versao, ambiente }` — conferir o nome exato do handler e o shape final do JSON no código resultante da task 002, pois a task 002 pode ter ajustado detalhes durante a implementação).
- **O que esta task NÃO deve fazer:**
  - Não alterar nem re-testar o handler `get` atual (texto puro) além do que já está coberto em `tests/unit/controllers/versao.test.js` — esse arquivo já existe e já passa; não deve ser quebrado.
  - Não introduzir testes de integração HTTP real (ex. subir o servidor Express e bater com `supertest`) — foge do padrão atual do projeto e da filosofia de simplicidade. Se o dev julgar que vale a pena no futuro, deve ser proposto como uma nova task separada, não incluído aqui.

## ✅ Critérios de Aceitação

### Funcionalidades Principais
- [ ] Novos testes criados para o handler `getInfo` (ou nome equivalente definido na task 002), cobrindo:
  - [ ] Retorno de JSON com os campos `versao` e `ambiente` no formato esperado (ex.: `res.json` chamado com `{ versao: 'Bia 4.2.0'... }` ou o shape exato definido na implementação da task 002 — conferir no código).
  - [ ] Comportamento quando `VERSAO_API` **não** está definido (usa fallback, ex. `"4.2.0"`).
  - [ ] Comportamento quando `VERSAO_API` **está** definido (reflete o valor customizado).
  - [ ] Comportamento do campo `ambiente` quando `NODE_ENV` está definido e quando não está (fallback `"development"`).
- [ ] Testes adicionados seguindo o mesmo arquivo (`tests/unit/controllers/versao.test.js`, novo `describe`/`test` para o novo handler) ou um novo arquivo dedicado, o que for mais coerente com o tamanho do arquivo resultante — decisão do dev, mas mantendo o mesmo diretório (`tests/unit/controllers/`) e o mesmo padrão de mocks.
- [ ] Teste automatizado pré-existente do handler `get` (texto puro) continua passando **sem modificação de asserts** (apenas reorganização de arquivo é aceitável, se necessário, mas o comportamento testado não muda).

### Integração
- [ ] `npm test` (raiz do projeto) roda toda a suíte (`tests/unit`) e todos os testes passam, incluindo os novos e os pré-existentes.
- [ ] Nenhuma dependência nova adicionada ao `package.json` (Jest já é suficiente para este padrão de teste).

## 🧪 Testes
- [ ] Rodar `npm test` e confirmar 100% dos testes (novos + existentes) passando.
- [ ] Rodar os testes novamente após uma alteração proposital (ex. remover temporariamente o fallback de `ambiente`) para confirmar que os testes realmente falham quando o comportamento quebra (evitar teste "falso positivo" que sempre passa).

## 📚 Definição de Pronto (DoD)
- [ ] Código de teste implementado
- [ ] Todos os itens do checklist marcados ✅
- [ ] Commits descritivos e frequentes
- [ ] Push do branch realizado
- [ ] `npm test` passando 100% (novos testes + suíte existente)
- [ ] Código de teste segue o padrão já usado no projeto (mock direto de controller, sem supertest)
- [ ] Documentação atualizada (se necessário)

---

## 🎯 CHECKLIST DE IMPLEMENTAÇÃO (MARCAR DURANTE O TRABALHO)

### Configuração
- [ ] Confirmado que task 002 está em `done`/PR mergeado antes de iniciar
- [ ] Worktree criado e branch correto confirmado
- [ ] Ambiente de desenvolvimento configurado no worktree (`npm install`, se necessário)

### Desenvolvimento
- [ ] Ler o código final do endpoint `GET /api/versao/info` resultante da task 002 (`api/controllers/versao.js`, `api/routes/versao.js`)
- [ ] Escrever testes para o novo handler, seguindo o padrão de `tests/unit/controllers/versao.test.js`
- [ ] Cobrir cenário de fallback de versão (sem `VERSAO_API`)
- [ ] Cobrir cenário de versão customizada (com `VERSAO_API`)
- [ ] Cobrir cenário de `ambiente` com e sem `NODE_ENV`
- [ ] Garantir que o teste pré-existente do `get` (texto puro) continua intacto e passando

### Testes
- [ ] `npm test` executado, 100% passando
- [ ] Validado que os novos testes realmente falham se o comportamento for quebrado propositalmente (sanity check)

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
# Garantir que está no worktree correto
pwd
# Deve estar em: /caminho/do/projeto/.claude/worktrees/003-test-api-dados-versao

# Verificar branch
git branch --show-current
# Deve mostrar: test/003-test-api-dados-versao
```

### 2. Commit e Push Final
```bash
git add .
git commit -m "test: finaliza implementação da task 003 - testes da API de dados de versão"
git push origin test/003-test-api-dados-versao
```

### 3. Voltar para Raiz e Notificar PO
```bash
cd ../../..  # Voltar para raiz do projeto
```

**NOTIFICAR O PO:**
> "Task 003 concluída. Todos os itens do checklist marcados. Branch `test/003-test-api-dados-versao` com push realizado. `npm test` passando 100%. Aguardando revisão do PO para encerramento e abertura de PR."

**⚠️ NÃO REMOVER O WORKTREE. Apenas o PO faz isso após o PR ser mergeado.**

---

## 🎯 ENCERRAMENTO PELO PO (QUANDO NOTIFICADO)

### 1. Revisão
```bash
# Entrar no worktree para revisar
cd .claude/worktrees/003-test-api-dados-versao

# Revisar código de teste, rodar npm test
# Verificar se todos os itens estão ✅
```

### 2. Aprovar e Mover para Done
```bash
# Voltar para raiz
cd ../../..

# Mover task para done
mv .claude/tasks/doing/003-test-api-dados-versao.md .claude/tasks/done/

# Commit e push no ia-main
git checkout ia-main
git add .claude/tasks/
git commit -m "move: task 003 para done"
git push origin ia-main
```

### 3. Abrir Pull Request
```bash
# ANTES de abrir PR: confirmar que está no branch da feature
cd .claude/worktrees/003-test-api-dados-versao
git branch --show-current
# Deve mostrar: test/003-test-api-dados-versao

# Abrir PR contra ia-main
gh pr create --base ia-main --title "003: Testes Automatizados da API de Dados de Versão" --body "Closes task 003"
```

### 4. Após PR Mergeado
```bash
# Voltar para raiz
cd ../../..

# Remover worktree
git worktree remove .claude/worktrees/003-test-api-dados-versao

# Ou com força se necessário:
# git worktree remove --force .claude/worktrees/003-test-api-dados-versao

# Limpar registros
git worktree prune

# (Opcional) Deletar branch local
git branch -d test/003-test-api-dados-versao

# Notificar conclusão
```

---

## 📊 Notas Técnicas
- Arquivos afetados: `tests/unit/controllers/versao.test.js` (extensão) ou novo arquivo no mesmo diretório.
- Ferramenta: Jest (já instalado e configurado, nenhuma dependência nova).
- Padrão: teste unitário direto do controller, mocks manuais de `req`/`res`, sem `supertest`/HTTP real — mesmo padrão de `tarefas.test.js` e do `versao.test.js` já existente.
- Esta task só existe porque depende do endpoint criado na task 002 — não iniciar sem confirmar o merge da 002.

## 💼 Valor de Negócio
**Baixo/Médio** - Garante cobertura de regressão automatizada para a nova API de dados estruturados de versão, reduzindo risco de quebra silenciosa em mudanças futuras.

## 🎯 Estimativa
**1 Story Point** - Baixa complexidade: segue padrão de teste já existente e validado no projeto, sem necessidade de nova ferramenta ou infraestrutura de teste.

## 🔗 Dependências
**Depende da task 002** (`002-feat-api-dados-versao.md`). Esta task só deve ser movida para `doing` (e ter seu worktree criado) **após o PR da task 002 ser mergeado em `ia-main`**, pois o worktree é criado a partir de `ia-main` e precisa conter o endpoint `GET /api/versao/info` para que os testes possam ser escritos contra o código real.

---

## 📚 Referências
- [Worktree Workflow](.claude/docs/worktree-workflow.md)
- [Worktree Steering](.claude/docs/worktree-steering.md)
- [Task Template](.claude/docs/task-template-with-worktree.md)
