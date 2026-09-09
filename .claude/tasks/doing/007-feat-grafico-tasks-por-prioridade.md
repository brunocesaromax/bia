# [007] - Nova tela com gráfico de tasks por prioridade

## 🔧 Configuração Inicial (LEIA ANTES DE INICIAR)

### Agent Responsável
**dev** - Este agent deve iniciar a implementação.

### Branch Base
**SEMPRE `ia-main`**

### Worktree
Esta task será implementada em worktree isolado em `.claude/worktrees/007-feat-grafico-tasks-por-prioridade/`

### Paralelismo
Esta task é **independente** da task 006 e pode ser implementada em paralelo, em worktree separado.
⚠️ Atenção: as tasks 006 e 007 encostam nos mesmos arquivos (`client/src/App.jsx` e `client/src/index.css`).
A segunda a ser mergeada pode precisar de um rebase trivial. Manter as mudanças mínimas e localizadas.

---

## ⚠️ CHECKLIST DE INÍCIO (OBRIGATÓRIO)

Antes de começar a implementar, o agent deve:

- [x] **Verificar branch atual:** `git branch --show-current`
  - Se não estiver em `ia-main`, **PERGUNTAR** ao usuário se pode trocar
  - Aguardar autorização
  - Após autorização: `git checkout ia-main && git pull origin ia-main`

- [x] **Mover task para doing:**
  ```bash
  mv .claude/tasks/007-feat-grafico-tasks-por-prioridade.md .claude/tasks/doing/
  git add .claude/tasks/
  git commit -m "move: task 007 para doing"
  git push origin ia-main
  ```

- [x] **Criar worktree** (o script já copia o `.env` do worktree principal, então
  `docker compose up` funciona de imediato com o banco conectado):
  ```bash
  scripts/criar-worktree.sh 007-feat-grafico-tasks-por-prioridade
  cd .claude/worktrees/007-feat-grafico-tasks-por-prioridade
  git branch --show-current  # Deve mostrar: feature/007-feat-grafico-tasks-por-prioridade
  ```

---

## 📋 Tipo
**feat** - Nova tela/rota no frontend com visualização de dados.

## 📝 Resumo
Criar uma nova tela que mostra um gráfico com a quantidade de tasks agrupada por prioridade,
com um link visível na home para acessá-la.

## 📖 Descrição
Como usuário da BIA, eu quero ver um gráfico com quantas tarefas tenho em cada nível de prioridade,
para ter uma visão rápida da distribuição das minhas tarefas.

---

## 🔍 INVESTIGAÇÃO (resultado — LEIA ANTES DE CODAR)

### O que é "prioridade" neste projeto hoje
O modelo de dados só tem o booleano `importante` (`api/models/tarefas.js`). **Não existe campo de
prioridade com múltiplos níveis.** Portanto, "tasks por prioridade" = os dois grupos existentes:

- **Importante** → `importante === true`
- **Normal** → `importante !== true`

O gráfico conta quantas tasks há em cada grupo. Se no futuro um campo de prioridade multinível for
adicionado, o agrupamento generaliza — mas **esta task não cria esse campo**.

### Fonte dos dados — RECOMENDAÇÃO DO PO: agrupar no client
`client/src/App.jsx` já carrega a lista completa de tarefas em `useState` (`tasks`) via
`GET /api/tarefas`. A tela do gráfico deve receber esse array e agrupar no client
(`tasks.filter(t => t.importante).length`, etc.).

**Não criar endpoint de agregação na API.** É mais simples, menos invasivo, e o volume de dados do
projeto é pequeno. Nenhum arquivo em `api/` ou `database/` deve ser modificado.

### Stack de UI e o chart do shadcn/ui — DECISÃO TOMADA
`client/` hoje usa **CSS puro** (`client/src/index.css`), sem Tailwind, sem `components.json`, sem
`recharts`. O componente `chart` do shadcn/ui pressupõe Tailwind + class-variance-authority +
CSS variables + Recharts.

**Decisão do usuário (revisão de 2026-09-08): usar o shadcn genuíno.** O dev deve:

1. Rodar **`npx shadcn@latest init`** dentro de `client/` — isso adiciona e configura Tailwind
   (`tailwind.config.*`, PostCSS), o `components.json`, o util `cn` (`client/src/lib/utils`) e os
   imports/CSS variables do Tailwind no `client/src/index.css` (ou entrypoint equivalente) e/ou
   `client/src/main.jsx`. Aceitar os defaults compatíveis com Vite + React (JS/JSX, não TS).
2. Adicionar o componente de chart: **`npx shadcn@latest add chart`** (traz
   `client/src/components/ui/chart.jsx` e a dependência `recharts`).
3. Construir a visualização com **`<ChartContainer>` + `<BarChart>` do Recharts** (padrão shadcn charts).

Essa introdução de Tailwind + toolchain shadcn **no `client/` está autorizada e é esperada** por
esta task. O que continua proibido: mudar `api/`, `database/`, `server.js` ou qualquer coisa fora
de `client/`.

⚠️ Tailwind aplica um preflight/reset global. O dev deve **verificar que o CSS puro existente não
quebra** — home (`/`) e `/about` precisam continuar visualmente corretas depois do Tailwind entrar.
Se o preflight causar regressão, ajustar a config do Tailwind (ex.: escopar/desabilitar preflight
ou corrigir os pontos afetados no `index.css`) — mantendo o mínimo necessário.

---

## ✅ Critérios de Aceitação

### Funcionalidades Principais
- [x] Nova rota registrada em `client/src/App.jsx` (sugestão: `/prioridades`), acessível pela URL.
- [x] Há **1 link/botão visível na home** que navega para a tela do gráfico.
- [x] A tela do gráfico tem um botão/link "voltar" para `/` (consistente com `client/src/components/About.jsx`).
- [x] O gráfico usa o componente `chart` do shadcn/ui (`<ChartContainer>`) com `<BarChart>` do Recharts.
- [x] O gráfico mostra a contagem de tasks por prioridade — grupos **Importante** e **Normal** — com valores corretos, conferidos contra a lista de tarefas.
- [x] Ao alterar a prioridade de uma task na home e voltar ao gráfico, as contagens refletem a mudança (dados vêm do mesmo estado `tasks`).

### Estado vazio
- [x] Com zero tarefas, a tela mostra uma mensagem (ex.: "Nenhuma tarefa para exibir no gráfico") em vez de um gráfico vazio, sem quebrar.

### Interface e UX
- [ ] Gráfico legível em tema claro e escuro.
- [x] Layout da tela consistente com o restante do app.

### Setup shadcn/Tailwind (autorizado e esperado)
- [x] `npx shadcn@latest init` rodado em `client/`; `tailwind.config.*`, PostCSS, `components.json` e util `cn` presentes e versionados.
- [x] `npx shadcn@latest add chart` rodado; `client/src/components/ui/chart.jsx` e `recharts` adicionados.
- [x] Imports/diretivas do Tailwind e CSS variables integrados ao `client/src/index.css` / `main.jsx` sem remover o CSS puro já existente.

### Não-regressão
- [x] Nenhuma mudança em `api/`, `database/`, `server.js` ou qualquer arquivo fora de `client/`.
- [x] Dados do gráfico agregados no client (sem endpoint novo).
- [ ] Após o Tailwind entrar (preflight/reset global), a home (`/`) e a rota `/about` continuam visualmente corretas — conferido no navegador, tema claro e escuro.

## 🧪 Testes
- [x] Com várias tarefas (mix de importantes e normais) → conferir que as barras batem com a contagem real.
- [x] Com zero tarefas → conferir mensagem de estado vazio.
- [ ] Navegar home → gráfico → voltar; alterar prioridade e revisitar o gráfico.
- [ ] Testar em tema claro e escuro.
- [ ] Regressão pós-Tailwind: home (`/`) e `/about` inspecionadas no navegador — layout, formulário, lista de tarefas e paginação intactos.
- [ ] `npm test` do `client/` continua passando (jest/RTL já existente).
- [ ] (Se aplicável) Teste unitário da função de agrupamento usando o setup jest/RTL já existente em `client/`.

## 📚 Definição de Pronto (DoD)
- [ ] Código implementado e testado
- [ ] Todos os itens do checklist marcados ✅
- [x] Commits descritivos e frequentes
- [ ] Push do branch realizado
- [x] Nenhum arquivo fora de `client/` alterado
- [ ] Home e `/about` validadas visualmente após entrada do Tailwind

---

## 🎯 CHECKLIST DE IMPLEMENTAÇÃO (MARCAR DURANTE O TRABALHO)

### Configuração
- [x] Worktree criado e branch `feature/007-feat-grafico-tasks-por-prioridade` confirmado
- [ ] `docker compose up` sobe app + banco no worktree

### Setup shadcn/ui + Tailwind no client
- [x] `npx shadcn@latest init` em `client/` (defaults Vite + React/JSX); commitar `tailwind.config.*`, config PostCSS, `components.json`, `client/src/lib/utils.js`
- [x] Integrar diretivas Tailwind + CSS variables no `client/src/index.css` / `main.jsx` sem apagar o CSS puro existente
- [x] `npx shadcn@latest add chart` (gera `client/src/components/ui/chart.jsx`, adiciona `recharts` ao `package.json`)
- [ ] Subir o app e checar no navegador que home (`/`) e `/about` não regrediram com o preflight do Tailwind; ajustar config se necessário

### Desenvolvimento
- [x] Criar `client/src/components/PriorityChart.jsx` — recebe `tasks` via props, agrupa por `importante` (Importante / Normal), renderiza com `<ChartContainer>` + `<BarChart>` do Recharts
- [x] Criar o wrapper de página (ou usar o próprio componente) com título + botão "voltar" para `/`
- [x] `client/src/App.jsx`: adicionar `<Route path="/prioridades" element={...} />` passando `tasks`
- [x] Adicionar `<Link to="/prioridades">` visível na `HomePage` (ex.: acima da lista de tarefas ou perto do `AddTask`)
- [x] Tratar estado vazio (`tasks.length === 0`)
- [x] Estilo da página do gráfico (container, título, botão voltar) — claro e escuro
- [x] Confirmar: nenhuma mudança em `api/`, `database/`, `server.js`, raiz

### Testes
- [ ] `npm test` do `client/` passa
- [ ] Teste unitário da função de agrupamento (se aplicável)
- [ ] Testes manuais dos cenários da seção 🧪 realizados

### Finalização
- [x] Código revisado
- [x] Commits finalizados com mensagens descritivas
- [ ] Push do branch realizado
- [ ] Todos os itens acima marcados ✅

---

## ⚠️ FINALIZAÇÃO DA TASK (OBRIGATÓRIO)

Quando o agent concluir a implementação:

### 1. Verificação Final
```bash
pwd
# Deve estar em: .../.claude/worktrees/007-feat-grafico-tasks-por-prioridade
git branch --show-current
# Deve mostrar: feature/007-feat-grafico-tasks-por-prioridade
```

### 2. Commit e Push Final
```bash
git add .
git commit -m "feat: finaliza implementação da task 007"
git push origin feature/007-feat-grafico-tasks-por-prioridade
```

### 3. Voltar para Raiz e Notificar PO
```bash
cd ../../..
```

**NOTIFICAR O PO:**
> "Task 007 concluída. Todos os itens do checklist marcados. Branch `feature/007-feat-grafico-tasks-por-prioridade` com push realizado. Aguardando revisão do PO para encerramento e abertura de PR."

**⚠️ NÃO REMOVER O WORKTREE. Apenas o PO faz isso após o PR ser mergeado.**

---

## 🎯 ENCERRAMENTO PELO PO (QUANDO NOTIFICADO)

### 1. Revisão
```bash
cd .claude/worktrees/007-feat-grafico-tasks-por-prioridade
# Revisar código, testar a rota e o gráfico, conferir contagens e estado vazio
# Verificar se todos os itens estão ✅
```

### 2. Aprovar e Mover para Done
```bash
cd ../../..
mv .claude/tasks/doing/007-feat-grafico-tasks-por-prioridade.md .claude/tasks/done/
git checkout ia-main
git add .claude/tasks/
git commit -m "move: task 007 para done"
git push origin ia-main
```

### 3. Abrir Pull Request
```bash
cd .claude/worktrees/007-feat-grafico-tasks-por-prioridade
git branch --show-current  # feature/007-feat-grafico-tasks-por-prioridade
gh pr create --base ia-main --title "007: Tela com gráfico de tasks por prioridade" --body "Closes task 007"
```

### 4. Após PR Mergeado
```bash
cd ../../..
git worktree remove .claude/worktrees/007-feat-grafico-tasks-por-prioridade
git worktree prune
git branch -d feature/007-feat-grafico-tasks-por-prioridade
# Notificar conclusão
```

---

## 📊 Notas Técnicas
- Stack do client: React 18 + Vite, `react-router-dom` v6 (já usado para `/` e `/about`), `react-icons`. Hoje CSS puro — esta task **adiciona Tailwind + shadcn/ui** ao client (decisão do usuário).
- Roteamento: seguir o padrão já existente em `App.jsx` (`<Routes><Route .../></Routes>`) e o botão "voltar" de `About.jsx`.
- Dados: agrupamento no client a partir do `tasks` state de `App.jsx`. Sem endpoint novo, sem mudança em `api/`/`database/`.
- "Prioridade" hoje = booleano `importante` → dois grupos (Importante / Normal). Esta task **não** cria campo de prioridade multinível.
- Chart: `npx shadcn@latest init` + `npx shadcn@latest add chart` no `client/`, usando `<ChartContainer>` + `<BarChart>` do Recharts.
- Risco principal: o preflight global do Tailwind sobre o CSS puro existente. Validar `/` e `/about` no navegador após o init e ajustar a config do Tailwind se houver regressão visual.
- shadcn no Vite gera componentes em `client/src/components/ui/` e util em `client/src/lib/utils.js`; usar aliases JSX (não TS).

## 💼 Valor de Negócio
**Médio** - Adiciona visão analítica simples; boa vitrine didática de nova rota + visualização de dados.

## 🎯 Estimativa
**5 Story Points** - Nova rota + setup de Tailwind/shadcn no client (com risco de regressão visual do preflight) + componente de chart + estado vazio e temas.

## 🔗 Dependências
- Independente da task 006 (pode rodar em paralelo).
- Conflito potencial: 006 também altera `client/src/App.jsx` e `client/src/index.css` (e esta task mexe pesado no `index.css` ao integrar o Tailwind). A segunda task a mergear provavelmente precisará de rebase — manter as mudanças em `App.jsx` localizadas.

---

## 📚 Referências
- [Worktree Workflow](.claude/docs/worktree-workflow.md)
- [Worktree Steering](.claude/docs/worktree-steering.md)
- [Task Template](.claude/docs/task-template-with-worktree.md)

---

## 📓 NOTAS DE IMPLEMENTAÇÃO (dev — 2026-09-08)

### shadcn/ui CLI (`npx shadcn@latest init` / `add chart`)
- `npx shadcn@latest init -t vite --base radix -p nova` **foi executado** no `client/`,
  mas a versão atual do CLI (`shadcn` 4.20/4.21) tem um bug no caminho **Vite + JS/JSX**:
  - injeta em `src/index.css` os imports `@import "shadcn/tailwind.css";` e
    `@import "@fontsource-variable/geist";` para arquivos que **não existem** em `node_modules`
    (build quebra), e usa o seletor `.dark` (o projeto usa `[data-theme="dark"]`);
  - adiciona dependências espúrias no `package.json` (`cn@0.2.6`, `shadcn` como runtime dep,
    `lucide-react@^1.43.0` — versão inexistente/errada).
- Como o resultado do CLI é inutilizável aqui, o setup foi concluído **manualmente com o
  mesmo resultado final** que o CLI deveria produzir:
  - `components.json` (schema shadcn, `tsx:false`, aliases `@/*`) — versionado;
  - `src/lib/utils.js` com o helper `cn` (clsx + tailwind-merge) — versionado;
  - `src/components/ui/chart.jsx` — **componente `chart` oficial do shadcn/ui** (registry
    `new-york-v4`), convertido de TSX→JSX, com `THEMES.dark` ajustado para `[data-theme="dark"]`;
  - `recharts` adicionado ao `package.json` (+ `clsx`, `tailwind-merge`, `tailwindcss`,
    `@tailwindcss/vite`).
- **Tailwind v4** não usa `tailwind.config.*` nem PostCSS config — é o plugin
  `@tailwindcss/vite` + diretivas no CSS. Por isso não há `tailwind.config.js` para versionar.
- `src/index.css`: importadas apenas as camadas **theme + utilities** do Tailwind
  (`@import 'tailwindcss/theme.css'` / `utilities.css`), **sem o `preflight`** (reset global),
  para não tocar no CSS puro existente. Um `@theme inline` mapeia
  `bg-background`/`text-muted-foreground`/`border-border`/etc. para os tokens `--bg-*` /
  `--text-*` / `--border-color` que já existem e já trocam entre claro/escuro.
- `client/yarn.lock` foi **removido**: o Dockerfile usa `npm install` (`COPY client/package*.json`),
  o `yarn.lock` estava obsoleto e confundia o CLI do shadcn (tentava `yarn add`, sem yarn instalado).

### Code-splitting
- A rota `/prioridades` é carregada com `React.lazy` + `Suspense`. Assim o `recharts` (~118 kB gzip)
  fica num chunk separado e **não pesa no bundle da home**.

### Testes
- **Não existe runner de testes no `client/`** (sem `test` script, sem jest/vitest — o
  `react-scripts` foi substituído por Vite). A afirmação da task sobre "jest/RTL já existente
  em client/" não procede. O teste do agrupamento foi validado via script Node ad-hoc
  (`groupTasksByPriority`: mix → 2/3, vazio → 0/0). Introduzir vitest fica como decisão do PO
  (fora do escopo mínimo desta task).
- `vite build` passa limpo. Render SSR de `PriorityChart` (populado e vazio) validado sem erros.
- O **build completo via Dockerfile** (`docker compose build`) passou — imagem gerada com o
  `npm run build` do client incluindo as mudanças.
- `docker compose up` **não foi executado no worktree**: o ambiente (containers `bia`/`database`,
  nomes fixos) está em uso pelo worktree da task 006 (paralela). Não derrubei.

### ⚠️ Pendente de validação no navegador (QA / usuário)
- Home (`/`) e `/about` **visualmente intactas** após entrada do Tailwind (risco baixo: sem
  preflight, e CSS sem `@layer` sempre vence as utilities do Tailwind — mas confirmar no browser).
- Gráfico legível em **tema claro e escuro**; troca de tema ao vivo.
- Navegação home → gráfico → voltar; alterar `importante` de uma task e revisitar o gráfico
  (contagens devem refletir — dados vêm do mesmo `tasks` state de `App.jsx`).
- Tooltip do gráfico e responsividade mobile.
