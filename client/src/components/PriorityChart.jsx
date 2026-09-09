import React from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart.jsx";
import { groupTasksByPriority } from "../lib/priority.js";

// Config do shadcn/ui chart: rótulos + cor de cada grupo. As cores apontam para
// os tokens de tema já existentes (--accent-*), que trocam entre claro/escuro.
const chartConfig = {
  total: { label: "Tarefas" },
  importante: { label: "Importante", color: "var(--accent-primary)" },
  normal: { label: "Normal", color: "var(--accent-success)" },
};

const PriorityChart = ({ tasks = [] }) => {
  const data = groupTasksByPriority(tasks);
  const isEmpty = tasks.length === 0;

  return (
    <div className="about-page">
      <div className="about-content">
        <div className="about-header">
          <h2 className="chart-title">Tarefas por prioridade</h2>
          <p className="chart-subtitle">
            Distribuição das suas {tasks.length}{" "}
            {tasks.length === 1 ? "tarefa" : "tarefas"} entre os grupos
            Importante e Normal.
          </p>
        </div>

        {isEmpty ? (
          <div className="empty-state">
            <h3>Nenhuma tarefa para exibir no gráfico 📊</h3>
            <p>
              Adicione tarefas na home para ver a distribuição por prioridade.
            </p>
          </div>
        ) : (
          <div className="chart-card">
            <ChartContainer config={chartConfig} className="priority-chart">
              <BarChart accessibilityLayer data={data} margin={{ top: 24 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  allowDecimals={false}
                  width={28}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="total" radius={6}>
                  <LabelList
                    dataKey="total"
                    position="top"
                    className="fill-foreground"
                  />
                </Bar>
              </BarChart>
            </ChartContainer>

            <ul className="chart-legend">
              {data.map((group) => (
                <li key={group.key}>
                  <span
                    className="chart-legend-swatch"
                    style={{ background: group.fill }}
                  />
                  {group.label}: <strong>{group.total}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="about-footer">
        <Link to="/" className="back-button">
          ← Voltar
        </Link>
      </div>
    </div>
  );
};

export default PriorityChart;
