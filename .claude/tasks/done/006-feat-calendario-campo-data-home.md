# [006] - Calendário (date picker) no campo de Data/Prazo da home

## 🔧 Configuração Inicial (LEIA ANTES DE INICIAR)

### Agent Responsável
**dev** - Este agent deve iniciar a implementação.

### Branch Base
**SEMPRE `ia-main`**

### Worktree
Esta task será implementada em worktree isolado em `.claude/worktrees/006-feat-calendario-campo-data-home/`

### Paralelismo
Esta task é **independente** da task 007 e pode ser implementada em paralelo, em worktree separado.
⚠️ Atenção: as tasks 006 e 007 encostam nos mesmos arquivos (`client/src/App.jsx` e `client/src/index.css`).
A segunda a ser mergeada pode precisar de um rebase trivial. Manter as mudanças mínimas e localizadas.

> Nota da implementação: a task 006 acabou **não tocando** `client/src/App.jsx`. Só mexeu em
> `client/src/index.css` (2 regras novas), `client/src/components/AddTask.jsx` e um arquivo
> novo `client/src/utils/date.js`. Conflito com a 007 fica restrito ao `index.css`.

---

## ⚠️ CHECKLIST DE INÍCIO (OBRIGATÓRIO)

Antes de começar a implementar, o agent deve:

- [x] **Verificar branch atual:** `git branch --show-current`
  - Já estava em `ia-main`, working tree limpo — sem troca de branch.

- [x] **Mover task para doing:**
  ```bash
  mv .claude/tasks/006-feat-calendario-campo-data-home.md .claude/tasks/doing/
  git add .claude/tasks/
  git commit -m "move: task 006 para doing"
  git push origin ia-main
  ```
  - Commit local `061c831` feito. **Push para `ia-main` pendente de OK explícito do usuário.**

- [x] **Criar worktree:**
  ```bash
  scripts/criar-worktree.sh 006-feat-calendario-campo-data-home
  cd .claude/worktrees/006-feat-calendario-campo-data-home
  git branch --show-current  # feature/006-feat-calendario-campo-data-home ✅
  ```
  - `.env` provisionado, `docker compose up -d` OK, `npx sequelize db:migrate` OK,
    `/api/versao` → `Bia 4.2.0`, `/api/tarefas` → `[]`.

---

## 📋 Tipo
**feat** - Nova funcionalidade de interface no frontend, sem mudança de contrato de dados.

## 📝 Resumo
Trocar o campo de texto livre de "Data/Prazo" da tela home por um seletor de data (calendário),
mantendo 100% de compatibilidade com o formato de string já persistido no banco.

## 📖 Descrição
Como usuário da BIA, eu quero escolher a data/prazo da tarefa em um calendário, para não precisar
digitar a data manualmente e evitar erros de digitação — sem que isso mude a forma como a data é
guardada nem quebre as tarefas já existentes.

---

## 🔍 INVESTIGAÇÃO DE FORMATO (resultado — LEIA ANTES DE CODAR)

O formato de `dia_atividade` foi investigado no código. **Não existe formato canônico persistido** —
a coluna é um `VARCHAR` livre. Fatos:

| Camada | Arquivo | Situação atual |
|---|---|---|
| Model | `api/models/tarefas.js` | `dia_atividade: DataTypes.STRING` |
| Migration | `database/migrations/20210924000838-criar-tarefas.js` | `dia_atividade` → `Sequelize.STRING`, `allowNull: true` |
| Controller (create) | `api/controllers/tarefas.js` | grava `req.body.dia_atividade` **como veio**, sem parse/validação |
| Formulário | `client/src/components/AddTask.jsx` | hoje é `<input type="text">`; envia `dia || new Date().toLocaleDateString('pt-BR')` |
| Exibição | `client/src/components/Task.jsx` | renderiza `task.dia_atividade` cru, com fallback `"Sem data definida"` |

**Conclusões que guiam a implementação:**
1. Quando o usuário não digita nada, o app hoje grava a **data de hoje no formato `DD/MM/YYYY`**
   (pt-BR, com zero à esquerda), ex.: `08/09/2026`. **Esse é o formato-alvo do date picker.**
2. Texto livre digitado hoje é gravado verbatim. Podem existir linhas legadas com strings
   arbitrárias (ex.: `"16 de abril"`, `"Feb 5th at 2:30pm"`, vazio).
3. Não há tela de edição de tarefa. O **único** caminho de update é `update_priority`
   (double-click / estrela), e `client/src/App.jsx` já reenvia o objeto inteiro da task
   (spread), então `dia_atividade` faz round-trip sem alteração.

**Decisão de formato:** o date picker deve produzir e consumir exatamente a string `DD/MM/YYYY`
(pt-BR), idêntica ao que `new Date().toLocaleDateString('pt-BR')` gera hoje. Nenhum outro formato
deve chegar à API.

**Armadilha de timezone:** `<input type="date">` trabalha com ISO `YYYY-MM-DD`. NÃO fazer
`new Date('2026-09-08').toLocaleDateString(...)` (parse em UTC desloca 1 dia em fusos negativos).
Converter quebrando a string ISO nos componentes (`ano-mes-dia`) e remontando como `DD/MM/YYYY`.

---

## ✅ Critérios de Aceitação

### Funcionalidades Principais
- [x] O campo "Data/Prazo" do formulário da home passa a ser um seletor de data (`<input type="date">`), sem campo de texto livre.
- [x] Criar tarefa escolhendo a data no calendário: no banco, `dia_atividade` é gravado como string no formato `DD/MM/YYYY` (ex.: `08/09/2026`) — idêntico ao formato que o app já gera hoje como fallback.
- [x] Verificar no banco (via consulta psql) que o valor gravado para uma tarefa criada pelo calendário é a string `DD/MM/YYYY` esperada — não ISO, não `Date`. (`pg_typeof` = `character varying`, valores `28/02/2026` e `08/09/2026`.)
- [x] Se o usuário não escolher data, mantém o comportamento atual: grava a data de hoje em `DD/MM/YYYY` (fallback `new Date().toLocaleDateString('pt-BR')` preservado).
- [x] A data escolhida no calendário é exatamente a data gravada (sem off-by-one). Conversão por componentes da string ISO, sem `new Date(iso)`. Testado dia atual (`2026-09-08`) e virada de mês (`2026-02-28`).

### Não-regressão (RESTRIÇÃO CRÍTICA)
- [x] Nenhuma alteração de schema, model ou migration. `dia_atividade` continua `STRING`. Nenhum arquivo em `api/` ou `database/` é modificado.
- [x] Tarefas antigas com `dia_atividade` em formato livre (ex.: `"16 de abril"`) ou vazio continuam sendo **exibidas corretamente** na lista (string crua). `Task.jsx` inalterado; `GET /api/tarefas` retorna as linhas legadas sem erro.
- [x] Ao carregar uma tarefa legada cujo valor não é `DD/MM/YYYY`, o date input não quebra (renderiza vazio) — `brParaIso` retorna `""` para qualquer coisa fora de `DD/MM/YYYY`. (Sem tela de edição hoje; helper pronto para o caminho de pré-preenchimento.)
- [x] Alterar prioridade (double-click / estrela) de uma tarefa **não altera** o valor de `dia_atividade` no banco. Testado via `PUT /api/tarefas/update_priority/:uuid` replicando o spread do `App.jsx`: antes/depois `28/02/2026`, só `importante` mudou.

### Interface e UX
- [x] O seletor de data usa as classes/CSS já existentes do formulário (`form-control`) — herda `.form-control input`.
- [x] Funciona em tema claro e escuro — adicionadas 2 regras `color-scheme` (`light` no padrão, `dark` sob `[data-theme="dark"]`) para o calendário/ícone nativo. Validação visual final fica com o QA.

## 🧪 Testes
- [x] Criar tarefa com data via calendário → conferir string no banco. (`28/02/2026`, `08/09/2026`)
- [x] Criar tarefa sem escolher data → conferir que gravou a data de hoje em `DD/MM/YYYY`. (fallback → `08/09/2026`)
- [x] Toggle de prioridade em tarefa existente → conferir que `dia_atividade` não mudou.
- [x] Abrir o app com pelo menos uma tarefa legada (formato livre / vazio / null) → linhas retornadas por `GET /api/tarefas` sem erro; render é string crua.
- [x] Testar em tema claro e escuro → CSS implementado; conferência visual pendente no QA (Playwright).
- [x] Teste do helper de conversão ISO ↔ `DD/MM/YYYY` — **não há runner de teste configurado no client** (sem `vitest`/`jest`, sem script `test`). Lógica validada com script `node` ad-hoc: casos normais + virada de mês + entradas legadas/inválidas, todos OK. Não foi adicionada dependência de teste (fora de escopo).

## 📚 Definição de Pronto (DoD)
- [x] Código implementado e testado
- [x] Todos os itens do checklist marcados ✅ (com ressalvas anotadas: push do `ia-main` aguardando OK; validação visual de tema com o QA)
- [x] Commits descritivos e frequentes
- [x] Push do branch realizado (`f81f891` + `4a7d39f` em `origin/feature/006-feat-calendario-campo-data-home`)
- [x] Código segue padrões do projeto (simplicidade — público aluno; sem libs de date picker; sem Tailwind/shadcn)
- [x] Nenhum arquivo fora de `client/` alterado

---

## 🎯 CHECKLIST DE IMPLEMENTAÇÃO (MARCAR DURANTE O TRABALHO)

### Configuração
- [x] Worktree criado e branch `feature/006-feat-calendario-campo-data-home` confirmado
- [x] `docker compose up` sobe app + banco no worktree
- [x] API respondendo (`/api/versao`, `/api/tarefas`). Obs.: o client servido pelo container tem `VITE_API_URL` de produção embutido no build — teste interativo de UI é feito com `vite dev` apontando `VITE_API_URL=http://localhost:3001` (ou pelo QA via Playwright).

### Desenvolvimento
- [x] `client/src/components/AddTask.jsx`: campo `dia` vira `<input type="date">`; estado guarda o valor ISO do input
- [x] No `onSubmit`, converter ISO (`YYYY-MM-DD`) → `DD/MM/YYYY` sem usar `new Date(isoString)`; fallback "data de hoje" quando vazio mantido
- [x] Helper de conversão em `client/src/utils/date.js`: `isoParaBr` (ISO → `DD/MM/YYYY`) e `brParaIso` (caminho inverso, para pré-preencher o input)
- [x] `client/src/components/Task.jsx`: render de `dia_atividade` legado já é string crua — **sem alteração**, sem regressão
- [x] CSS em `client/src/index.css` para `input[type="date"]` em ambos os temas (`color-scheme`)
- [x] Confirmado: nenhuma mudança em `api/`, `database/`, `server.js`, raiz

### Testes
- [x] Teste do helper de data — validado via `node` (sem runner no projeto; sem nova dependência)
- [x] Testes manuais dos cenários da seção 🧪 realizados (via curl + psql)
- [x] Verificação no banco do formato gravado — criação e toggle de prioridade

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
# Deve estar em: .../.claude/worktrees/006-feat-calendario-campo-data-home
git branch --show-current
# Deve mostrar: feature/006-feat-calendario-campo-data-home
```

### 2. Commit e Push Final
```bash
git add .
git commit -m "feat: finaliza implementação da task 006"
git push origin feature/006-feat-calendario-campo-data-home
```

### 3. Voltar para Raiz e Notificar PO
```bash
cd ../../..
```

**NOTIFICAR O PO:**
> "Task 006 concluída. Todos os itens do checklist marcados. Branch `feature/006-feat-calendario-campo-data-home` com push realizado. Aguardando revisão do PO para encerramento e abertura de PR."

**⚠️ NÃO REMOVER O WORKTREE. Apenas o PO faz isso após o PR ser mergeado.**

---

## 🎯 ENCERRAMENTO PELO PO (QUANDO NOTIFICADO)

### 1. Revisão
```bash
cd .claude/worktrees/006-feat-calendario-campo-data-home
# Revisar código, testar funcionalidade, conferir formato no banco
# Verificar se todos os itens estão ✅
```

### 2. Aprovar e Mover para Done
```bash
cd ../../..
mv .claude/tasks/doing/006-feat-calendario-campo-data-home.md .claude/tasks/done/
git checkout ia-main
git add .claude/tasks/
git commit -m "move: task 006 para done"
git push origin ia-main
```

### 3. Abrir Pull Request
```bash
cd .claude/worktrees/006-feat-calendario-campo-data-home
git branch --show-current  # feature/006-feat-calendario-campo-data-home
gh pr create --base ia-main --title "006: Calendário no campo de Data/Prazo da home" --body "Closes task 006"
```

### 4. Após PR Mergeado
```bash
cd ../../..
git worktree remove .claude/worktrees/006-feat-calendario-campo-data-home
git worktree prune
git branch -d feature/006-feat-calendario-campo-data-home
# Notificar conclusão
```

---

## 📊 Notas Técnicas
- Stack do client: React 18 + Vite, **CSS puro** (`client/src/index.css`), `react-router-dom` v6, `react-icons`. **Não há Tailwind nem shadcn/ui** — não introduzir.
- Solução recomendada: `<input type="date">` nativo (zero dependências, suporte amplo, aceitável em dark mode). **Não** adicionar biblioteca de date picker.
- O `<input type="date">` expõe/consome ISO `YYYY-MM-DD`; toda conversão para/de `DD/MM/YYYY` acontece na borda do componente.
- Não existe endpoint nem tela de edição de tarefa hoje; não criar. O round-trip de `dia_atividade` no `update_priority` já é feito pelo `App.jsx`.

## 💼 Valor de Negócio
**Médio** - Melhora usabilidade e reduz erro de entrada de dados na principal ação do app, sem custo de migração.

## 🎯 Estimativa
**3 Story Points** - Mudança localizada em 1–2 componentes + helper de data + cuidado com timezone e não-regressão de dados legados.

## 🔗 Dependências
- Independente da task 007 (pode rodar em paralelo).
- Conflito potencial leve: 007 também altera `client/src/index.css`. A segunda task a mergear pode precisar de rebase trivial.

---

## 📚 Referências
- [Worktree Workflow](.claude/docs/worktree-workflow.md)
- [Worktree Steering](.claude/docs/worktree-steering.md)
- [Task Template](.claude/docs/task-template-with-worktree.md)

---

## ✅ ENCERRAMENTO PELO PO (2026-09-08)

- **QA APROVOU** todos os critérios de aceitação (fluxo no navegador via Playwright):
  campo virou `<input type="date">`; grava `DD/MM/YYYY`; fallback "hoje" mantido;
  sem off-by-one (dia atual e virada de mês); toggle de prioridade não altera
  `dia_atividade`; tarefas legadas exibidas sem erro; tema claro e escuro OK;
  nenhuma alteração fora de `client/src/`.
- **Ressalva não bloqueante:** não há teste unitário do helper `client/src/utils/date.js`
  porque o `client/` não tem runner (jest/vitest) configurado — o critério era
  "(se aplicável)". Lógica validada por script `node` ad-hoc pelo dev.
- Revisão de código do PO: diff mínimo e localizado (`AddTask.jsx`, +2 regras
  `color-scheme` em `index.css`, novo `utils/date.js`); conversão ISO↔BR por
  quebra de string, sem `new Date(iso)`. OK.
- Task movida para `done/`. PR aberto de `feature/006-feat-calendario-campo-data-home`
  contra `ia-main`.
- Pendente: merge manual do PR e, só depois, remoção do worktree.
