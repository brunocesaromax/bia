#!/usr/bin/env bash
# Guarda de permissão do agente `po`.
#
# O `po` só pode CRIAR/EDITAR arquivos dentro de `.claude/`.
# Qualquer Write/Edit/MultiEdit/NotebookEdit fora de `.claude/`
# (código do projeto, arquivos da raiz, etc.) é bloqueado.
#
# Acionado como PreToolUse hook no frontmatter de `.claude/agents/po.md`.
# Bloqueia com exit code 2 (mensagem em stderr volta para o agente).

set -euo pipefail

input=$(cat)

tool=$(printf '%s' "$input" | jq -r '.tool_name // empty')
case "$tool" in
  Write | Edit | MultiEdit | NotebookEdit) ;;
  *) exit 0 ;;
esac

path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.notebook_path // empty')
[ -z "$path" ] && exit 0

proj="${CLAUDE_PROJECT_DIR:-$PWD}"

case "$path" in
  /*) abs="$path" ;;
  *) abs="$proj/$path" ;;
esac

# Normaliza `.` e `..` sem exigir que o caminho exista.
if command -v realpath >/dev/null 2>&1; then
  abs=$(realpath -m "$abs")
  proj=$(realpath -m "$proj")
fi

case "$abs/" in
  "$proj/.claude/"*) exit 0 ;;
esac

echo "Bloqueado: o agente 'po' só tem permissão de escrita dentro de .claude/." >&2
echo "Caminho recusado: $abs" >&2
exit 2
