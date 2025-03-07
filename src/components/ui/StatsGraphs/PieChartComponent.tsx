"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CategoryType } from "@prisma/client";

interface TransactionWithCategory {
  id: string;
  amount: number;
  category: {
    name: string;
    type: CategoryType;
  };
}

interface PieChartComponentProps {
  transactions: TransactionWithCategory[];
}

const COLORS = [
  "#7C3AED",
  "#A78BFA",
  "#C4B5FD",
  "#D8B4FE",
  "#E9D5FF",
  "#F3E8FF",
  "#5B21B6",
  "#6D28D9",
  "#4C1D95",
];

// Progress bar component for expenses
interface ExpenseProgressBarProps {
  category: string;
  amount: number;
  progress: number;
  color: string;
}

const ExpenseProgressBar: React.FC<ExpenseProgressBarProps> = ({ category, amount, progress, color }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: color }}></div>
          <span className="text-sm font-medium">{category}</span>
        </div>
        <span className="text-red-500 text-sm font-medium">- €{Math.abs(amount)}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full" 
          style={{ width: `${progress}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
};

const PieChartComponent: React.FC<PieChartComponentProps> = ({
  transactions,
}) => {
  // Filter only FIXO and VARIÁVEL categories
  const filteredTransactions = transactions.filter(
    (t) => t.category.type !== "VENCIMENTO"
  );

  // Aggregate total spending per category
  const categoryTotals: Record<string, number> = {};
  let fixedTotal = 0;
  let variableTotal = 0;

  filteredTransactions.forEach(({ amount, category }) => {
    if (!categoryTotals[category.name]) categoryTotals[category.name] = 0;
    categoryTotals[category.name] += amount;

    if (category.type === "FIXO") fixedTotal += amount;
    if (category.type === "VARIÁVEL") variableTotal += amount;
  });

  // Sort categories by spending and take the top 8
  const sortedCategories = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  );
  const topCategories = sortedCategories.slice(0, 8);
  const otherTotal = sortedCategories
    .slice(8)
    .reduce((sum, [, amount]) => sum + amount, 0);

  // Prepare outer pie data (Top 8 + Others)
  const outerPieData = topCategories.map(([name, amount], index) => ({
    name,
    value: Math.abs(amount),
    color: COLORS[index % COLORS.length],
  }));
  if (otherTotal > 0) {
    outerPieData.push({ name: "Others", value: Math.abs(otherTotal), color: "#EDE9FE" });
  }

  // Prepare inner pie data (FIXO vs VARIÁVEL)
  const innerPieData = [
    { name: "FIXO", value: Math.abs(fixedTotal), color: "#EE4B2B" },
    { name: "VARIÁVEL", value: Math.abs(variableTotal), color: "#880808" },
  ];

  // Calculate total for progress bar percentages
  const totalExpense = outerPieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Pie chart */}
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Despesas por categoria</h3>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            {/* Inner Pie (FIXO vs VARIÁVEL) */}
            <Pie
              data={innerPieData}
              dataKey="value"
              nameKey="name"
              outerRadius={80}
              fill="#8884d8"
              stroke="#fff"
              strokeWidth={2}
            >
              {innerPieData.map((entry, index) => (
                <Cell key={`inner-${index}`} fill={entry.color} />
              ))}
            </Pie>

            <Pie
              data={outerPieData}
              dataKey="value"
              nameKey="name"
              innerRadius={90}
              outerRadius={130}
              fill="#82ca9d"
              stroke="#fff"
              strokeWidth={2}
            >
              {outerPieData.map((entry, index) => (
                <Cell key={`outer-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Top expenses as progress bars - now below the pie chart */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-800">
        {outerPieData.map((category, index) => (
          category.name !== "Others" && (
            <ExpenseProgressBar 
              key={index}
              category={category.name}
              amount={category.value}
              progress={(category.value / totalExpense) * 100}
              color={category.color}
            />
          )
        ))}
      </div>
    </div>
  );
};

export default PieChartComponent;