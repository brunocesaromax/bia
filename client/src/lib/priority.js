// Agrupamento de tarefas por "prioridade".
//
// Hoje "prioridade" no projeto BIA é apenas o booleano `importante`
// (ver api/models/tarefas.js) — não existe um campo de prioridade com vários
// níveis. Portanto são dois grupos: "Importante" e "Normal".
//
// A contagem é feita 100% no client, a partir do mesmo array `tasks` que a
// HomePage já carrega de GET /api/tarefas (sem endpoint novo na API).

export const PRIORITY_GROUPS = [
  { key: "importante", label: "Importante", color: "var(--accent-primary)" },
  { key: "normal", label: "Normal", color: "var(--accent-success)" },
];

/**
 * Recebe a lista de tarefas e devolve a contagem por grupo de prioridade,
 * no formato consumido pelo <BarChart> do Recharts.
 *
 * @param {Array<{importante?: boolean}>} tasks
 * @returns {Array<{key: string, label: string, total: number, fill: string}>}
 */
export function groupTasksByPriority(tasks = []) {
  const importantes = tasks.filter((task) => task && task.importante).length;
  const totais = {
    importante: importantes,
    normal: tasks.length - importantes,
  };

  return PRIORITY_GROUPS.map((group) => ({
    key: group.key,
    label: group.label,
    total: totais[group.key],
    fill: `var(--color-${group.key})`,
  }));
}
