"use client";

import React, { useMemo, useState, useEffect } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CategoryType } from "@prisma/client";

interface TransactionWithCategory {
  id: string;
  amount: number;
  category: {
    type: CategoryType;
  };
  month: string;
  year: string;
}

interface BarChartComponentProps {
  transactions: TransactionWithCategory[];
  selectedYear: string;
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({
  transactions,
  selectedYear
}) => {
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

  // Month mapping for abbreviations
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

  // Super-short abbreviations for very small screens
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

  // Aggregate savings per month with memoization
  const { chartData, totalSavings } = useMemo(() => {
    const monthlySavings: Record<string, number> = {};
    let totalSavingsAmount = 0;
    
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
    ];

    transactions
      .filter((t) => t.year === selectedYear)
      .forEach(({ amount, category, month }) => {
        if (!monthlySavings[month]) monthlySavings[month] = 0;
        if (category.type === "VENCIMENTO") monthlySavings[month] += amount;
        if (category.type === "VARIÁVEL" || category.type === "FIXO") monthlySavings[month] -= amount;
      });

    // Format data for chart with abbreviated months
    const formattedData = months.map((month, index) => {
      const savings = monthlySavings[month] || 0;
      totalSavingsAmount += savings;
      
      return { 
        month,
        shortMonth: monthAbbreviations[month],
        microMonth: monthMicroAbbreviations[month],
        monthIndex: index, // Keep track of month order
        savings
      };
    });

    return { 
      chartData: formattedData, 
      totalSavings: totalSavingsAmount 
    };
  }, [transactions, selectedYear]);

  return (
    <div className="w-full p-4 md:p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Este ano já poupaste: €{totalSavings.toLocaleString()}
      </h3>
      <div className="h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ top: 10, right: 5, bottom: 5, left: 5 }}
            barGap={isMobile ? 0 : 2}
          >
            <XAxis 
              dataKey={isMobile ? "microMonth" : "shortMonth"}
              axisLine={false}
              tickLine={false}
              tick={{ 
                fill: 'var(--text-color, #6B7280)', 
                fontSize: isMobile ? 10 : 12 
              }}
              dy={10}
              interval={0} // Force display of all ticks
              tickMargin={2}
            />
            <Tooltip 
              formatter={(value) => `€${Number(value).toLocaleString()}`}
              labelFormatter={(_, item) => item.length ? item[0].payload.month.charAt(0).toUpperCase() + item[0].payload.month.slice(1) : ''}
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg, rgba(255, 255, 255, 0.9))',
                color: 'var(--tooltip-color, #333)',
                border: 'none',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
            />
            <Bar
              name="poupanças"
              dataKey="savings" 
              fill="#6366F1" 
              radius={[4, 4, 0, 0]}
              barSize={isMobile ? 12 : 24}
              isAnimationActive={true}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartComponent;