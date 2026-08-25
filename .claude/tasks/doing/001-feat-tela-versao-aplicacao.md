# [001] - Tela de Versão da Aplicação

## 🔧 Configuração Inicial (LEIA ANTES DE INICIAR)

### Agent Responsável
**dev** - Este agent deve iniciar a implementação (frontend React/Vite, `client/`).

### Branch Base
**SEMPRE `main`**

### Worktree
Esta task será implementada em worktree isolado em `.claude/worktrees/001-feat-tela-versao-aplicacao/`

---

## ⚠️ CHECKLIST DE INÍCIO (OBRIGATÓRIO)

Antes de começar a implementar, o agent deve:

- [ ] **Verificar branch atual:** `git branch --show-current`
  - Se não estiver em `main`, **PERGUNTAR** ao usuário se pode trocar
  - Aguardar autorização
  - Após autorização: `git checkout main && git pull origin main`

- [ ] **Mover task para doing:**
  ```bash
  mv .claude/tasks/001-feat-tela-versao-aplicacao.md .claude/tasks/doing/
  git add .claude/tasks/
  git commit -m "move: task 001 para doing"
  git push origin main
  ```

- [ ] **Criar worktree:**
  ```bash
  git worktree add .claude/worktrees/001-feat-tela-versao-aplicacao -b feature/001-feat-tela-versao-aplicacao main
  cd .claude/worktrees/001-feat-tela-versao-aplicacao
  git branch --show-current  # Confirmar branch correto
  ```

---

## 📋 Tipo
**feat** - Nova funcionalidade de frontend (nova tela/rota).

## 📝 Resumo
Criar uma nova tela no client (React) que exibe a versão da aplicação, consumindo o endpoint já existente `GET /api/versao`, seguindo exatamente o mesmo padrão arquitetural já usado pela tela de Tarefas.

## 📖 Descrição
Como aluno/usuário da BIA, eu quero acessar uma tela dedicada que mostre a versão atual da aplicação (consumindo a API real), para que eu possa confirmar qual versão do backend está rodando sem depender apenas do pequeno indicador no cabeçalho.

## 🔎 Contexto técnico levantado (não repetir descoberta, usar como base)

- **Endpoint já existe e não deve ser criado:** `GET /api/versao` (`api/routes/versao.js` → `api/controllers/versao.js`). Ele **retorna texto puro** (ex.: `"Bia 4.2.0"`), **não JSON** — a chamada deve usar `res.text()`, nunca `res.json()`.
- **Padrão de chamada de API do projeto:** o client **não usa axios nem uma camada de service separada**. Toda chamada usa `fetch` nativo, feita dentro de `client/src/App.jsx`, sempre logando a requisição/resposta/erro via `useLog()` (`logApiRequest`, `logApiResponse`, `logApiError`, `addLog`) — ver função `fetchTasks` em `client/src/App.jsx` (linhas ~33-52) como modelo exato a ser replicado (trocando apenas a URL e `res.json()` → `res.text()`).
- **Padrão de estado/dados:** o estado dos dados (`tasks`) vive no componente pai `App.jsx` (`useState` + `useEffect` no mount chamando uma função `getX` que por sua vez chama `fetchX`), e é passado via **props** para um componente de apresentação (`client/src/components/Tasks.jsx`), que não faz fetch por conta própria.
- **Padrão de rota/página:** rotas adicionais (fora da Home) seguem o modelo de `client/src/components/About.jsx`, registrado em `client/src/App.jsx` dentro de `<Routes>` (`<Route path="/about" element={<About />} />`), com link de navegação no `client/src/components/Footer.jsx` (`<Link to="/about">Sobre a BIA</Link>`) e botão "← Voltar" para `/` dentro da própria página.
- **Atenção para não confundir escopo:** já existe `client/src/components/VersionInfo.jsx`, um widget de tooltip no `Header` que já consulta `/api/versao` para status online/offline. **Essa task NÃO deve alterar nem remover o `VersionInfo.jsx`** — o objetivo é uma **tela/rota dedicada** (nova página, padrão `About`), não o widget do header. São funcionalidades complementares.
- **Estilo:** usar classes CSS já existentes em `client/src/index.css` seguindo a convenção usada em `about-page` / `feature-card` / `about-footer`/`back-button`, ou criar classes novas seguindo a mesma convenção de nomenclatura, mantendo consistência visual (incluindo suporte a tema claro/escuro já existente via `ThemeContext`).

## ✅ Critérios de Aceitação

### Funcionalidades Principais
- [ ] Nova rota `/versao` registrada em `client/src/App.jsx`, dentro de `<Routes>`, análoga à rota `/about`.
- [ ] Novo componente de página (ex.: `client/src/components/Versao.jsx`) criado seguindo a mesma estrutura de `About.jsx` (componente funcional simples, recebe dados via props do `App.jsx`, contém link "← Voltar" para `/`).
- [ ] Nova função de fetch (ex.: `fetchVersao`) criada em `client/src/App.jsx`, replicando **exatamente** o padrão de `fetchTasks` (mesmo uso de `apiUrl`, `logApiRequest`, `logApiResponse`, `logApiError`, tratamento de `!res.ok`), mas usando `res.text()` (o endpoint não retorna JSON).
- [ ] Novo estado (ex.: `versao`) criado em `client/src/App.jsx` via `useState`, populado através de uma função `getVersao` chamada a partir do `useEffect` de inicialização (mesmo padrão do `getTasks`), e passado como prop para o novo componente de tela.
- [ ] Tratamento de erro consistente com o padrão existente: falha na chamada deve registrar log via `addLog('ERROR', ...)` (igual ao `catch` de `getTasks`) e a tela deve exibir uma mensagem amigável de erro/indisponibilidade em vez de quebrar.

### Interface e UX
- [ ] Tela exibe claramente o texto de versão retornado pela API (ex.: `Bia 4.2.0`).
- [ ] Layout e estilo visualmente consistentes com o restante do app (mesma tipografia, cores, suporte a tema claro/escuro).
- [ ] Responsividade coerente com as demais telas (`About`, `Tasks`).

### Integração
- [ ] Link de navegação para a nova tela adicionado em local visível (ex.: `client/src/components/Footer.jsx`, ao lado do link "Sobre a BIA"), com texto claro (ex.: "Versão da aplicação").
- [ ] `client/src/components/VersionInfo.jsx` (widget do header) permanece inalterado e funcional.
- [ ] Nenhuma regressão nas rotas/telas existentes (`/`, `/about`).

## 🧪 Testes
- [ ] Testar navegação até `/versao` pelo link criado e diretamente pela URL.
- [ ] Validar que o texto exibido bate com o retorno real de `GET /api/versao` (conferir com `curl http://localhost:3000/api/versao` ou porta configurada, conforme `.claude/rules/dockerfile.md`).
- [ ] Validar cenário de erro: interromper a API (ou apontar `VITE_API_URL` para endereço inválido) e confirmar que a tela mostra mensagem de erro amigável, sem quebrar a aplicação.
- [ ] Testar responsividade da nova tela (mobile/desktop).
- [ ] Testar em tema claro e escuro.

## 📚 Definição de Pronto (DoD)
- [ ] Código implementado e testado
- [ ] Todos os itens do checklist marcados ✅
- [ ] Commits descritivos e frequentes
- [ ] Push do branch realizado
- [ ] Código segue padrões do projeto (fetch nativo + log via `useLog`, sem axios, sem camada de service nova)
- [ ] Documentação atualizada (se necessário)

---

## 🎯 CHECKLIST DE IMPLEMENTAÇÃO (MARCAR DURANTE O TRABALHO)

### Configuração
- [ ] Worktree criado e branch correto confirmado
- [ ] Ambiente de desenvolvimento configurado no worktree (`npm install` no `client/`, se necessário)
- [ ] Dependências instaladas (se necessário)

### Desenvolvimento
- [ ] Criar `fetchVersao` em `client/src/App.jsx` (padrão `fetchTasks`, usando `res.text()`)
- [ ] Criar estado `versao` + função `getVersao` em `client/src/App.jsx`, chamada no `useEffect` de inicialização
- [ ] Criar componente `client/src/components/Versao.jsx` (padrão `About.jsx`), recebendo `versao` via props
- [ ] Registrar rota `/versao` em `client/src/App.jsx`
- [ ] Adicionar link de navegação no `Footer.jsx` para `/versao`
- [ ] Adicionar/ajustar classes CSS em `client/src/index.css` seguindo convenção existente (`about-page`, etc.)
- [ ] Tratar estado de erro/indisponibilidade na tela

### Testes
- [ ] Testes manuais realizados (navegação, exibição da versão, erro simulado)
- [ ] Cenários de erro testados (API indisponível / URL inválida)
- [ ] Testado em tema claro e escuro
- [ ] Testado responsividade

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
# Deve estar em: /caminho/do/projeto/.claude/worktrees/001-feat-tela-versao-aplicacao

# Verificar branch
git branch --show-current
# Deve mostrar: feature/001-feat-tela-versao-aplicacao
```

### 2. Commit e Push Final
```bash
git add .
git commit -m "feat: finaliza implementação da task 001 - tela de versão"
git push origin feature/001-feat-tela-versao-aplicacao
```

### 3. Voltar para Raiz e Notificar PO
```bash
cd ../../..  # Voltar para raiz do projeto
```

**NOTIFICAR O PO:**
> "Task 001 concluída. Todos os itens do checklist marcados. Branch `feature/001-feat-tela-versao-aplicacao` com push realizado. Aguardando revisão do PO para encerramento e abertura de PR."

**⚠️ NÃO REMOVER O WORKTREE. Apenas o PO faz isso após o PR ser mergeado.**

---

## 🎯 ENCERRAMENTO PELO PO (QUANDO NOTIFICADO)

### 1. Revisão
```bash
# Entrar no worktree para revisar
cd .claude/worktrees/001-feat-tela-versao-aplicacao

# Revisar código, testar funcionalidade
# Verificar se todos os itens estão ✅
```

### 2. Aprovar e Mover para Done
```bash
# Voltar para raiz
cd ../../..

# Mover task para done
mv .claude/tasks/doing/001-feat-tela-versao-aplicacao.md .claude/tasks/done/

# Commit e push no ia-main
# NOTA: esta task nasceu quando a branch base ainda era `main`; a partir da reorganização
# de 2026-08-24, `ia-main` passou a ser a branch base do fluxo de agentes, e o PR desta
# task (ainda não aberto) deve mirar `ia-main`, não `main` (ver .claude/agents/po.md).
git checkout ia-main
git pull origin ia-main
git add .claude/tasks/
git commit -m "move: task 001 para done"
git push origin ia-main
```

### 3. Abrir Pull Request
```bash
# ANTES de abrir PR: confirmar que está no branch da feature
cd .claude/worktrees/001-feat-tela-versao-aplicacao
git branch --show-current
# Deve mostrar: feature/001-feat-tela-versao-aplicacao

# Abrir PR contra ia-main (não main — ver nota acima)
gh pr create --base ia-main --title "001: Tela de Versão da Aplicação" --body "Closes task 001"
```

### 4. Após PR Mergeado
```bash
# Voltar para raiz
cd ../../..

# Remover worktree
git worktree remove .claude/worktrees/001-feat-tela-versao-aplicacao

# Ou com força se necessário:
# git worktree remove --force .claude/worktrees/001-feat-tela-versao-aplicacao

# Limpar registros
git worktree prune

# (Opcional) Deletar branch local
git branch -d feature/001-feat-tela-versao-aplicacao

# Notificar conclusão
```

---

## 📊 Notas Técnicas
- Endpoint: `GET /api/versao` (`api/routes/versao.js` + `api/controllers/versao.js`) — resposta em **texto puro**, não JSON. Ex.: `Bia 4.2.0`.
- `apiUrl` já é resolvido em `client/src/App.jsx` via `import.meta.env.VITE_API_URL || "http://localhost:8080"` — reaproveitar essa mesma constante, não recriar lógica de URL (o `VersionInfo.jsx` tem sua própria `getApiUrl()`, mas isso é específico do widget do header e não deve ser replicado aqui).
- Não introduzir axios nem uma pasta `services/` nova — o padrão deste projeto (simplicidade para alunos) é fetch direto em `App.jsx`, conforme `.claude/rules/dockerfile.md`/filosofia geral do projeto (simplicidade acima de complexidade).
- Health check de referência do projeto é `/api/versao` (ver `.claude/rules/dockerfile.md`), então esta tela reforça de forma visível algo que já é usado internamente para validação.

## 💼 Valor de Negócio
**Baixo/Médio** - Funcionalidade de apoio para alunos/instrutores confirmarem visualmente qual versão da aplicação está publicada em cada ambiente (útil durante a Imersão AWS & IA), sem valor direto de negócio para o produto em si.

## 🎯 Estimativa
**2 Story Points** - Baixa complexidade: reaproveita padrão já existente (fetch/log/estado/rota), sem necessidade de novo endpoint de backend nem novas dependências.

## 🔗 Dependências
Nenhuma. O endpoint `GET /api/versao` já existe e está em produção.

---

## 📚 Referências
- [Worktree Workflow](.claude/docs/worktree-workflow.md)
- [Worktree Steering](.claude/docs/worktree-steering.md)
- [Task Template](.claude/docs/task-template-with-worktree.md)
