#!/usr/bin/env bash
#
# Cria um worktree isolado para uma task do fluxo do PO e JÁ provisiona o .env
# do backend (copiado do worktree principal) para que `docker compose up`
# funcione de imediato e o banco conecte sem ajuste manual.
#
# Uso:
#   scripts/criar-worktree.sh <slug-da-task> [branch] [branch-base]
#
# Exemplos:
#   scripts/criar-worktree.sh 006-feat-nova-funcionalidade
#   scripts/criar-worktree.sh 006-fix-login fix/006-fix-login ia-main
#
# Padrões:
#   branch      = feature/<slug>
#   branch-base = ia-main
#
# Observações:
#   - O .env da raiz é git-ignored e contém credenciais; por isso ele NÃO vem
#     junto no worktree. Este script copia o .env do worktree principal para o
#     novo worktree. Se o principal não tiver .env, cai para o .env.example.
#   - client/.env é versionado e já vem no worktree — não precisa copiar.

set -euo pipefail

SLUG="${1:-}"
if [ -z "$SLUG" ]; then
  echo "erro: informe o slug da task." >&2
  echo "  ex: scripts/criar-worktree.sh 006-feat-nova-funcionalidade" >&2
  exit 1
fi

BRANCH="${2:-feature/${SLUG}}"
BASE="${3:-ia-main}"

# Raiz do worktree principal — funciona mesmo se este script for chamado de
# dentro de outro worktree.
GIT_COMMON_DIR="$(git rev-parse --path-format=absolute --git-common-dir)"
MAIN_ROOT="$(dirname "$GIT_COMMON_DIR")"

WORKTREE_PATH="$MAIN_ROOT/.claude/worktrees/$SLUG"

if [ -e "$WORKTREE_PATH" ]; then
  echo "erro: já existe algo em $WORKTREE_PATH" >&2
  echo "  confira: git worktree list" >&2
  exit 1
fi

echo "==> Criando worktree"
echo "    caminho: $WORKTREE_PATH"
echo "    branch : $BRANCH  (base: $BASE)"
git -C "$MAIN_ROOT" worktree add "$WORKTREE_PATH" -b "$BRANCH" "$BASE"

# --- Provisiona o .env do backend -------------------------------------------
if [ -f "$MAIN_ROOT/.env" ]; then
  cp "$MAIN_ROOT/.env" "$WORKTREE_PATH/.env"
  echo "==> .env copiado do worktree principal (credenciais do banco prontas)"
elif [ -f "$MAIN_ROOT/.env.example" ]; then
  cp "$MAIN_ROOT/.env.example" "$WORKTREE_PATH/.env"
  echo "AVISO: worktree principal não tem .env — copiei o .env.example." >&2
  echo "       Preencha $WORKTREE_PATH/.env com as credenciais reais antes de subir o compose." >&2
else
  echo "AVISO: não encontrei .env nem .env.example no worktree principal." >&2
  echo "       Crie o .env manualmente no worktree antes de subir o compose." >&2
fi

echo
echo "Pronto. Próximos passos:"
echo "  cd .claude/worktrees/$SLUG"
echo "  git branch --show-current      # confirmar: $BRANCH"
echo "  docker compose up -d --build"
echo "  curl -s http://localhost:3001/api/versao"
