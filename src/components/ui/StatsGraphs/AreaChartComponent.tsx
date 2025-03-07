"use client";

import React, { useState, useEffect } from "react";
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

const AreaChartComponent: React.FC<AreaChartComponentProps> = ({ transactions }) => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for resize
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Full month names
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];

  // Month abbreviations for smaller screens
  const monthAbbreviations: Record<string, string> = {
    'janeiro': 'Jan',
    'fevereiro': 'Fev',
    'março': 'Mar',
    'abril': 'Abr',
    'maio': 'Mai',
    'junho': 'Jun',
    'julho': 'Jul',
    'agosto': 'Ago',
    'setembro': 'Set',
    'outubro': 'Out',
    'novembro': 'Nov',
    'dezembro': 'Dez'
  };

  // Single letter abbreviations for very small screens
  const monthMicroAbbreviations: Record<string, string> = {
    'janeiro': 'J',
    'fevereiro': 'F',
    'março': 'M',
    'abril': 'A',
    'maio': 'M',
    'junho': 'J',
    'julho': 'J',
    'agosto': 'A',
    'setembro': 'S',
    'outubro': 'O',
    'novembro': 'N',
    'dezembro': 'D'
  };

  // Aggregate transactions by month
  const monthlyData = months.map((month) => {
    const expenses = transactions
      .filter(t => (t.category.type === CategoryType.FIXO || t.category.type === CategoryType.VARIÁVEL) && t.month === month)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const earnings = transactions
      .filter(t => t.category.type === "VENCIMENTO" && t.month === month)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { 
      month, 
      shortMonth: monthAbbreviations[month],
      microMonth: monthMicroAbbreviations[month],
      Expenses: expenses, 
      Earnings: earnings
    };
  });

  return (
    <div className="w-full p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
        Despesas e Vencimentos mensais
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart 
          data={monthlyData} 
          margin={{ 
            top: 20, 
            right: isMobile ? 10 : 30, 
            left: isMobile ? 0 : 10, 
            bottom: 0 
          }}
        >
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
          <XAxis 
            dataKey={isMobile ? "microMonth" : "shortMonth"}
            axisLine={false}
            tickLine={false}
            tick={{ 
              fill: 'var(--text-color, #6B7280)', 
              fontSize: isMobile ? 10 : 12 
            }}
            dy={10}
            interval={0} // Force display all ticks
            tickMargin={2}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis 
            width={isMobile ? 35 : 50}
            tickFormatter={(value) => `€${value}`}
            tick={{ 
              fontSize: isMobile ? 10 : 12,
              fill: 'var(--text-color, #6B7280)'
            }}
            tickCount={5}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            formatter={(value: number) => `€${value.toLocaleString()}`}
            labelFormatter={(label, item) => {
              if (item.length === 0) return '';
              // Find the full month name from the short/micro abbreviation
              const fullMonth = item[0].payload.month;
              return fullMonth.charAt(0).toUpperCase() + fullMonth.slice(1);
            }}
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg, rgba(255, 255, 255, 0.95))',
              color: 'var(--tooltip-color, #333)',
              border: 'none',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <Area 
            type="monotone" 
            name="Despesas" 
            dataKey="Expenses" 
            stroke="#FF5733" 
            strokeWidth={2}
            fillOpacity={0.8} 
            fill="url(#colorExpenses)" 
            activeDot={{ r: 6 }}
          />
          <Area 
            type="monotone" 
            name="Vencimentos" 
            dataKey="Earnings" 
            stroke="#33FF57" 
            strokeWidth={2}
            fillOpacity={0.8} 
            fill="url(#colorEarnings)" 
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex justify-center mt-4 space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#FF5733] rounded-full mr-2"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">Despesas</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#33FF57] rounded-full mr-2"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">Vencimentos</span>
        </div>
      </div>
    </div>
  );
};

export default AreaChartComponent;