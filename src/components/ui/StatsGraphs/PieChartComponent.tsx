"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { CategoryType } from "@prisma/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";

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

// Colors for light mode
const LIGHT_COLORS = [
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

// Colors for dark mode (slightly brighter for better contrast)
const DARK_COLORS = [
  "#8B5CF6",
  "#A78BFA",
  "#DDD6FE",
  "#EDE9FE",
  "#C4B5FD",
  "#A5B4FC",
  "#818CF8",
  "#6366F1",
  "#4F46E5",
];

// Progress bar component for expenses
interface ExpenseProgressBarProps {
  category: string;
  amount: number;
  progress: number;
  color: string;
  isDark: boolean;
}

const ExpenseProgressBar: React.FC<ExpenseProgressBarProps> = ({ 
  category, 
  amount, 
  progress, 
  color,
  isDark 
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: color }}></div>
          <span className="text-sm font-medium truncate max-w-[150px] text-gray-800 dark:text-gray-200">
            {category}
          </span>
        </div>
        <span className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-500'}`}>
          - €{Math.abs(amount).toFixed(2)}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const ITEMS_PER_SLIDE = 8;

  // Set isDark based on theme once component is mounted
  useEffect(() => {
    setMounted(true);
    setIsDark(theme === 'dark');
  }, [theme]);

  // Get appropriate color scheme based on theme
  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;

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

  // Sort categories by spending
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount], index) => ({
      name,
      value: Math.abs(amount),
      color: COLORS[index % COLORS.length],
    }));

  // Prepare outer pie data (All categories)
  const outerPieData = sortedCategories.length > 0 ? sortedCategories : [];

  // Prepare inner pie data (FIXO vs VARIÁVEL)
  const innerPieData = [
    { 
      name: "FIXO", 
      value: Math.abs(fixedTotal), 
      color: isDark ? "#F87171" : "#EE4B2B" 
    },
    { 
      name: "VARIÁVEL", 
      value: Math.abs(variableTotal), 
      color: isDark ? "#EF4444" : "#880808" 
    },
  ];

  // Calculate total for progress bar percentages
  const totalExpense = outerPieData.reduce((sum, item) => sum + item.value, 0);

  // Calculate total number of slides
  const totalSlides = Math.ceil(outerPieData.length / ITEMS_PER_SLIDE);

  // Get current slide items
  const currentItems = outerPieData.slice(
    currentSlide * ITEMS_PER_SLIDE,
    (currentSlide + 1) * ITEMS_PER_SLIDE
  );

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Touch handling for swipe
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      // Swipe left
      nextSlide();
    }

    if (touchEnd - touchStart > 100) {
      // Swipe right
      prevSlide();
    }
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 rounded-lg shadow">
      {/* Pie chart */}
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Despesas por categoria</h3>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            {/* Inner Pie (FIXO vs VARIÁVEL) */}
            <Pie
              data={innerPieData}
              dataKey="value"
              nameKey="name"
              outerRadius={80}
              fill="#8884d8"
              stroke={isDark ? "#1F2937" : "#fff"}
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
              stroke={isDark ? "#1F2937" : "#fff"}
              strokeWidth={2}
            >
              {outerPieData.map((entry, index) => (
                <Cell key={`outer-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `€${value.toFixed(2)}`}
              contentStyle={{ 
                backgroundColor: isDark ? '#374151' : '#fff',
                border: `1px solid ${isDark ? '#4B5563' : '#e2e8f0'}`,
                color: isDark ? '#F3F4F6' : '#1F2937',
                borderRadius: '0.375rem'
              }}
              itemStyle={{
                color: isDark ? '#F3F4F6' : '#1F2937'
              }}
              labelStyle={{
                color: isDark ? '#D1D5DB' : '#4B5563'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Top expenses as progress bars with carousel */}
      <div 
        className="p-6 border-t border-gray-200 dark:border-gray-700"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Carousel header with navigation */}
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {`${currentSlide + 1} / ${totalSlides}`}
          </h4>
          <div className="flex space-x-2">
            <button 
              onClick={prevSlide}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              disabled={totalSlides <= 1}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              disabled={totalSlides <= 1}
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Current slide items */}
        <div className="transition-opacity duration-300">
          {currentItems.map((category, index) => (
            <ExpenseProgressBar 
              key={`slide-${currentSlide}-item-${index}`}
              category={category.name}
              amount={category.value}
              progress={(category.value / totalExpense) * 100}
              color={category.color}
              isDark={isDark}
            />
          ))}
          
          {/* Empty state when no items */}
          {currentItems.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No expense data available
            </div>
          )}
        </div>
        
        {/* Pagination indicators */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-4 space-x-1">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={`dot-${index}`}
                className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                  currentSlide === index 
                    ? 'bg-purple-600 dark:bg-purple-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PieChartComponent;