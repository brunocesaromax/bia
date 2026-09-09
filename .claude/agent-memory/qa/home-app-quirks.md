---
name: home-app-quirks
description: Comportamentos não óbvios da home da BIA que afetam como testar (paginação, locale do date input, erro de console benigno)
metadata:
  type: project
---

Particularidades da tela home (`client/src/App.jsx` + componentes) observadas em testes.

**Why:** evitar concluir "sumiu" / "quebrou" por causa de comportamento esperado.

**How to apply:**
- **Paginação de 5 por página.** Tarefas novas ou legadas criadas via API podem cair
  na página 2+. Sempre checar o rodapé "Mostrando X-Y de N" e navegar antes de dizer
  que um item não aparece.
- **`<input type="date">` exibe no locale do navegador** (no ambiente de teste, en-US →
  `MM/DD/YYYY` na tela). O valor persistido continua `DD/MM/YYYY` pt-BR — conferir
  sempre pela API, não pelo texto exibido no input.
- **Erro no console `Support for defaultProps will be removed...` em `Header.jsx`** é
  pré-existente e benigno (warning do React 18). Não reportar como bug de task nova.
- **Toggle de prioridade** = double-click no card OU clique na estrela; ambos os
  caminhos chamam `update_priority` e reenviam o objeto inteiro (round-trip de
  `dia_atividade` sem alteração, inclusive valores legados como `"16 de abril"`).
- **Validação de título vazio** abre modal "Campo obrigatório" (não usa `alert`).
