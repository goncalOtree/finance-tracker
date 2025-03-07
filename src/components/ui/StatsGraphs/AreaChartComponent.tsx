"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CategoryType } from "@prisma/client";

interface TransactionWithCategory {
  id: string;
  amount: number;
  category: {
    type: CategoryType;
  };
  month: string;
}

interface AreaChartComponentProps {
  transactions: TransactionWithCategory[];
}

const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];

const AreaChartComponent: React.FC<AreaChartComponentProps> = ({ transactions }) => {
  // Aggregate transactions by month
  const monthlyData = months.map((month) => {
    const expenses = transactions
      .filter(t => (t.category.type === CategoryType.FIXO || t.category.type === CategoryType.VARIÁVEL) && t.month === month)
      .reduce((sum, t) => sum + t.amount, 0);

    console.log(transactions);
    
    const earnings = transactions
      .filter(t => t.category.type === "VENCIMENTO" && t.month === month)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { month, Expenses: expenses, Earnings: earnings };
  });

  

  return (
    <div className="w-full p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Despesas e Vencimentos mensais</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF5733" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#FF5733" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#33FF57" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#33FF57" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" name="Despesas" dataKey="Expenses" stroke="#FF5733" fillOpacity={1} fill="url(#colorExpenses)" />
          <Area type="monotone" name="Vencimentos" dataKey="Earnings" stroke="#33FF57" fillOpacity={1} fill="url(#colorEarnings)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChartComponent;
