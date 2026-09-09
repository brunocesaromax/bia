---
name: dev-client-tailwind-shadcn
description: client/ ganhou Tailwind v4 + shadcn/ui na task 007 — como está montado, o CLI do shadcn quebra no Vite/JSX, sem preflight, sem runner de testes no client
metadata:
  type: project
---

Na **task 007** o `client/` passou a ter **Tailwind v4 + shadcn/ui** (só o componente `chart`).
Montagem final (o que existe hoje):

- **Tailwind v4** = plugin `@tailwindcss/vite` no `client/vite.config.js` + alias `@ -> ./src`.
  **Não há `tailwind.config.js` nem PostCSS config** (v4 não usa). `jsconfig.json` tem o path `@/*`.
- `client/src/index.css` importa **apenas** `tailwindcss/theme.css` + `tailwindcss/utilities.css`
  (via `@layer`), **sem `preflight`** — de propósito, para não mexer no CSS puro existente
  (que já tem o próprio reset em `* {}`). Um bloco `@theme inline` mapeia
  `bg-background`/`text-muted-foreground`/`border-border`/`fill-muted`/`text-foreground` para os
  tokens `--bg-card` / `--text-primary` / `--text-secondary` / `--bg-secondary` / `--border-color`
  que já existem e já trocam em `[data-theme="dark"]`.
- Regra útil: **CSS sem `@layer` sempre vence as utilities do Tailwind** (que ficam em `@layer utilities`).
  Ou seja, todo o CSS de componente já existente do projeto continua ganhando das classes Tailwind —
  reforça que a entrada do Tailwind é de baixo risco de regressão.
- Arquivos shadcn: `client/components.json`, `client/src/lib/utils.js` (`cn` = clsx + tailwind-merge),
  `client/src/components/ui/chart.jsx` (componente `chart` oficial, convertido TSX->JSX,
  com `THEMES.dark` = `[data-theme="dark"]` em vez de `.dark`).
- Deps novas no `client/package.json`: `tailwindcss`, `@tailwindcss/vite`, `clsx`, `tailwind-merge`, `recharts`.
- `client/yarn.lock` foi **removido** (Dockerfile usa `npm`; o yarn.lock só atrapalhava).

**O CLI do shadcn (`npx shadcn@latest init` / `add`) está QUEBRADO no caminho Vite + JS/JSX**
(versões 4.20/4.21): injeta `@import "shadcn/tailwind.css"` e `@import "@fontsource-variable/geist"`
para arquivos inexistentes (build quebra), usa seletor `.dark`, e adiciona deps espúrias
(`cn@0.2.6`, `shadcn` como runtime dep, `lucide-react@^1.43.0`). **Não confie no output do CLI** —
se precisar adicionar outro componente shadcn, pegue o fonte do registry
(`https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/ui/<x>.tsx`),
converta pra JSX na mão e ajuste imports (`from "cn"` -> `from "@/lib/utils"`).

**Não existe runner de testes no `client/`** (sem script `test`, sem jest/vitest — Vite substituiu
o react-scripts). Testes só no backend (`npm test` na raiz = `jest tests/unit`). Validação de lógica
de client hoje: script Node ad-hoc, `vite build`, e render SSR via `vite.ssrLoadModule` +
`renderToStaticMarkup` (funciona pra componentes que não tocam `localStorage`; `ThemeContext` quebra
em SSR por causa disso — é esperado, o app é SPA).

Ver também [[dev-client-testing-setup]] e [[dev-compose-worktree-conflict]].
