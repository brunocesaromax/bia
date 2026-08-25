# [002] - API de Dados de Versão Estruturados

## 🔧 Configuração Inicial (LEIA ANTES DE INICIAR)

### Agent Responsável
**dev** - Este agent deve iniciar a implementação (backend Node/Express, `api/`).

### Branch Base
**SEMPRE `main`**

### Worktree
Esta task será implementada em worktree isolado em `.claude/worktrees/002-feat-api-dados-versao/`

---

## ⚠️ CHECKLIST DE INÍCIO (OBRIGATÓRIO)

Antes de começar a implementar, o agent deve:

- [ ] **Verificar branch atual:** `git branch --show-current`
  - Se não estiver em `main`, **PERGUNTAR** ao usuário se pode trocar
  - Aguardar autorização
  - Após autorização: `git checkout main && git pull origin main`

- [ ] **Mover task para doing:**
  ```bash
  mv .claude/tasks/002-feat-api-dados-versao.md .claude/tasks/doing/
  git add .claude/tasks/
  git commit -m "move: task 002 para doing"
  git push origin main
  ```

- [ ] **Criar worktree:**
  ```bash
  git worktree add .claude/worktrees/002-feat-api-dados-versao -b feature/002-feat-api-dados-versao main
  cd .claude/worktrees/002-feat-api-dados-versao
  git branch --show-current  # Confirmar branch correto
  ```

---

## 📋 Tipo
**feat** - Nova funcionalidade de backend (novo endpoint de API).

## 📝 Resumo
Criar um novo endpoint de API que retorna os dados de versão da aplicação em formato estruturado (JSON), complementando o endpoint de texto já existente `GET /api/versao`, **sem alterar seu contrato atual**.

## 📖 Descrição
Como consumidor da API da BIA (frontend, scripts de monitoramento, outros clientes), eu quero um endpoint que retorne os dados de versão em formato estruturado (JSON), para que eu possa consumir programaticamente informações como versão e ambiente sem precisar fazer parsing de texto.

## 🔎 Contexto técnico levantado (não repetir descoberta, usar como base)

- **Endpoint atual (`GET /api/versao`) já existe e funciona hoje assim:**
  - `api/routes/versao.js`:
    ```js
    module.exports = (app) => {
      const controller = require("../controllers/versao")();
      app.route("/api/versao").get(controller.get);
    };
    ```
  - `api/controllers/versao.js`:
    ```js
    module.exports = () => {
      const controller = {};
      controller.get = async (req, res) => {
        const responseString = `Bia ${process.env.VERSAO_API || "4.2.0"}`;
        res.send(responseString);
      };
      return controller;
    };
    ```
  - Ele retorna **texto puro** (ex.: `"Bia 4.2.0"`), via `res.send()`, **não JSON**.
- **Já existe um teste automatizado cobrindo o `get` atual:** `tests/unit/controllers/versao.test.js`, que trava exatamente esse contrato de texto (`expect(res.send).toHaveBeenCalledWith('Bia 4.2.0')` etc.). **Esse teste não pode ser quebrado por esta task.**
- **A task 001 (`.claude/tasks/001-feat-tela-versao-aplicacao.md`, ainda em `todo`) depende explicitamente do endpoint atual retornando texto puro** para a nova tela de versão do frontend. Alterar o contrato de `GET /api/versao` quebraria a especificação já revisada da task 001.
- **Decisão de design (a mais simples possível, ver `.claude/rules/*.md` — filosofia de simplicidade para alunos):** em vez de alterar o endpoint existente ou criar uma camada nova de rotas/serviços, **adicionar um novo endpoint** no mesmo arquivo de rota e no mesmo controller já existentes:
  - Rota: `GET /api/versao/info`
  - Retorno: **JSON** (via `res.json(...)`, não `res.send()` de string) com o formato:
    ```json
    {
      "versao": "4.2.0",
      "ambiente": "development"
    }
    ```
  - `versao`: mesma fonte de dado do endpoint atual (`process.env.VERSAO_API`, com fallback `"4.2.0"`). Extrair essa lógica para uma pequena função auxiliar reaproveitada pelos dois handlers (`get` e o novo, ex. `getInfo`), evitando duplicar a string literal `"4.2.0"` em dois lugares — sem criar camadas de abstração desnecessárias (nada de `services/`, nada de classes, só uma função simples dentro do próprio `api/controllers/versao.js`).
  - `ambiente`: `process.env.NODE_ENV || "development"`.
  - **Campo opcional (nice-to-have, NÃO obrigatório para o DoD desta task):** `dataHora` com o timestamp da resposta (`new Date().toISOString()`). Atenção: isso **não é uma "data de build" real** — não existe hoje nenhum mecanismo de build stamp no pipeline (`buildspec.yml`) e criar um seria fora do escopo desta task (mudaria pipeline, ver `.claude/rules/pipeline.md`). Se o dev decidir incluir esse campo, deixar claro no código/PR que é apenas o horário da requisição, não da build.
- **Nomenclatura dos campos em português**, para manter consistência com o resto do código (`tarefas`, `titulo`, `uuid`, `importante`, `dia_atividade`, etc.).
- **Esta task NÃO inclui a escrita dos testes automatizados** do novo endpoint — isso é escopo exclusivo da task 003 (dependente desta). Esta task só precisa garantir que o teste já existente (`versao.test.js`, cobrindo o `get` atual) continue passando sem modificação.

## ✅ Critérios de Aceitação

### Funcionalidades Principais
- [ ] `GET /api/versao` continua **exatamente igual** ao comportamento atual (texto puro, mesmo formato) — nenhuma regressão de contrato.
- [ ] Novo endpoint `GET /api/versao/info` criado em `api/routes/versao.js` (mesmo arquivo, novo `app.route(...)`) e `api/controllers/versao.js` (novo handler, ex. `getInfo`).
- [ ] `GET /api/versao/info` retorna **JSON** (`res.json(...)`, `Content-Type: application/json`) com pelo menos os campos `versao` e `ambiente`, conforme especificado acima.
- [ ] Lógica de obtenção da versão (`process.env.VERSAO_API || "4.2.0"`) extraída para uma função auxiliar simples reaproveitada pelos dois handlers, sem duplicar a string literal.
- [ ] `ambiente` retorna `process.env.NODE_ENV || "development"`.

### Integração
- [ ] Teste automatizado já existente (`tests/unit/controllers/versao.test.js`) continua passando **sem nenhuma alteração** (`npm test`).
- [ ] Nenhuma alteração em `client/` — esta task é exclusivamente backend.
- [ ] Nenhuma alteração no comportamento/consumidores atuais de `GET /api/versao` (ex.: `client/src/components/VersionInfo.jsx`, que já consulta esse endpoint hoje).

## 🧪 Testes
- [ ] Rodar `npm test` (raiz do projeto) e confirmar que os testes existentes continuam verdes.
- [ ] Validar manualmente via `curl` (conforme `.claude/rules/dockerfile.md`, health check de referência do projeto):
  - `curl http://localhost:3000/api/versao` → deve continuar retornando texto puro, ex. `Bia 4.2.0`.
  - `curl http://localhost:3000/api/versao/info` → deve retornar JSON, ex. `{"versao":"4.2.0","ambiente":"development"}`.
- [ ] Validar cenário com `VERSAO_API` definido em variável de ambiente, conferindo que ambos os endpoints refletem o mesmo valor.
- [ ] **Escrita de testes automatizados para o novo endpoint NÃO faz parte desta task** — fica a cargo da task 003, dependente desta.

## 📚 Definição de Pronto (DoD)
- [ ] Código implementado e testado manualmente
- [ ] Todos os itens do checklist marcados ✅
- [ ] Commits descritivos e frequentes
- [ ] Push do branch realizado
- [ ] Código segue padrões do projeto (simplicidade, sem novas dependências, sem camadas novas de abstração)
- [ ] Teste automatizado pré-existente (`tests/unit/controllers/versao.test.js`) continua passando sem alteração
- [ ] Documentação atualizada (se necessário)

---

## 🎯 CHECKLIST DE IMPLEMENTAÇÃO (MARCAR DURANTE O TRABALHO)

### Configuração
- [ ] Worktree criado e branch correto confirmado
- [ ] Ambiente de desenvolvimento configurado no worktree (`npm install`, se necessário)
- [ ] Dependências instaladas (se necessário — não deve ser necessário nenhuma dependência nova)

### Desenvolvimento
- [ ] Extrair lógica de obtenção da versão para função auxiliar simples em `api/controllers/versao.js`
- [ ] Manter handler `get` atual inalterado em comportamento (texto puro)
- [ ] Criar handler `getInfo` em `api/controllers/versao.js` retornando JSON `{ versao, ambiente }`
- [ ] Registrar rota `GET /api/versao/info` em `api/routes/versao.js`
- [ ] (Opcional) Avaliar inclusão de `dataHora` (timestamp da resposta) no JSON, deixando claro que não é data de build

### Testes
- [ ] `npm test` executado e testes existentes continuam passando
- [ ] Testes manuais via `curl` realizados para os dois endpoints
- [ ] Cenário com `VERSAO_API` customizado testado manualmente

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
# Deve estar em: /caminho/do/projeto/.claude/worktrees/002-feat-api-dados-versao

# Verificar branch
git branch --show-current
# Deve mostrar: feature/002-feat-api-dados-versao
```

### 2. Commit e Push Final
```bash
git add .
git commit -m "feat: finaliza implementação da task 002 - API de dados de versão"
git push origin feature/002-feat-api-dados-versao
```

### 3. Voltar para Raiz e Notificar PO
```bash
cd ../../..  # Voltar para raiz do projeto
```

**NOTIFICAR O PO:**
> "Task 002 concluída. Todos os itens do checklist marcados. Branch `feature/002-feat-api-dados-versao` com push realizado. Aguardando revisão do PO para encerramento e abertura de PR. **Atenção:** a task 003 depende desta e só deve ser iniciada após o PR desta task ser mergeado em `main`."

**⚠️ NÃO REMOVER O WORKTREE. Apenas o PO faz isso após o PR ser mergeado.**

---

## 🎯 ENCERRAMENTO PELO PO (QUANDO NOTIFICADO)

### 1. Revisão
```bash
# Entrar no worktree para revisar
cd .claude/worktrees/002-feat-api-dados-versao

# Revisar código, rodar npm test, testar via curl
# Verificar se todos os itens estão ✅
```

### 2. Aprovar e Mover para Done
```bash
# Voltar para raiz
cd ../../..

# Mover task para done
mv .claude/tasks/doing/002-feat-api-dados-versao.md .claude/tasks/done/

# Commit e push no main
git checkout main
git add .claude/tasks/
git commit -m "move: task 002 para done"
git push origin main
```

### 3. Abrir Pull Request
```bash
# ANTES de abrir PR: confirmar que está no branch da feature
cd .claude/worktrees/002-feat-api-dados-versao
git branch --show-current
# Deve mostrar: feature/002-feat-api-dados-versao

# Abrir PR contra main
gh pr create --base main --title "002: API de Dados de Versão Estruturados" --body "Closes task 002"
```

### 4. Após PR Mergeado
```bash
# Voltar para raiz
cd ../../..

# Remover worktree
git worktree remove .claude/worktrees/002-feat-api-dados-versao

# Ou com força se necessário:
# git worktree remove --force .claude/worktrees/002-feat-api-dados-versao

# Limpar registros
git worktree prune

# (Opcional) Deletar branch local
git branch -d feature/002-feat-api-dados-versao

# Notificar conclusão
```

**⚠️ IMPORTANTE: só depois do merge desta task 002, a task 003 (dependente) pode ter seu worktree criado a partir de `main`, pois o novo endpoint precisa estar disponível na branch base.**

---

## 📊 Notas Técnicas
- Arquivos afetados: `api/routes/versao.js`, `api/controllers/versao.js`.
- Nenhuma dependência nova (nem no `package.json` raiz, nem em `client/`).
- Endpoint atual (`GET /api/versao`, texto puro) permanece 100% compatível — nenhuma mudança de contrato.
- Novo endpoint (`GET /api/versao/info`) é aditivo (não substitui nada existente).
- Testes automatizados do novo endpoint ficam para a task 003 (dependente).

## 💼 Valor de Negócio
**Baixo/Médio** - Facilita consumo programático dos dados de versão (ex.: monitoramento, scripts, futuras integrações) sem quebrar nenhum consumidor existente do endpoint de texto.

## 🎯 Estimativa
**2 Story Points** - Baixa complexidade: endpoint aditivo simples, reaproveitando lógica já existente, sem novas dependências.

## 🔗 Dependências
Nenhuma dependência de entrada. **É pré-requisito da task 003** (`003-test-api-dados-versao.md`), que só deve iniciar após o PR desta task ser mergeado em `main`.

---

## 📚 Referências
- [Worktree Workflow](.claude/docs/worktree-workflow.md)
- [Worktree Steering](.claude/docs/worktree-steering.md)
- [Task Template](.claude/docs/task-template-with-worktree.md)
