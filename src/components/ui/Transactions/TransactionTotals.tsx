import React from "react";
import * as LucideIcons from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn/card";
import { CategoryType } from "@prisma/client";

type LucideIconName = keyof typeof LucideIcons;

interface TransactionWithCategory {
  id: string;
  amount: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    type: CategoryType;
    icon: string;
  };
  month: string;
  year: string;
}

interface TransactionTotalsProps {
  transactions: TransactionWithCategory[];
  filteredTransactions: TransactionWithCategory[];
  selectedYear: string | null;
}

export function TransactionTotals({
  transactions,
  filteredTransactions,
  selectedYear
}: TransactionTotalsProps) {
  if (!selectedYear) return null;

  // Group filtered transactions by month
  const filteredTotalsByMonthAndCategory: Record<string, Record<string, number>> = {};
  filteredTransactions.forEach(transaction => {
    if (!filteredTotalsByMonthAndCategory[transaction.month]) {
      filteredTotalsByMonthAndCategory[transaction.month] = {};
    }
    
    const categoryName = transaction.category.name;
    filteredTotalsByMonthAndCategory[transaction.month][categoryName] = 
      (filteredTotalsByMonthAndCategory[transaction.month][categoryName] || 0) + transaction.amount;
  });

  return (
    <>
      {Object.entries(filteredTotalsByMonthAndCategory).map(([month, categories]) => (
        <Card key={month} className="mb-4">
          <CardHeader>
            <CardTitle>
              {month} {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(categories).map(([category, total]) => {
              // Find the specific category details for the current category
              const categoryDetails = transactions.find((t) => t.category.name === category)?.category;
              
              const iconName = categoryDetails?.icon as LucideIconName;
              const IconComponent = (LucideIcons[iconName] || LucideIcons.Banknote) as React.ElementType;
              const isIncome = categoryDetails?.type === CategoryType.VENCIMENTO;
              const colorClass = isIncome ? "text-green-500" : "text-red-500";

              return (
                <div
                  key={category}
                  className="flex items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg shadow mb-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <IconComponent className="text-purple-600 dark:text-purple-500" size={24} />
                  <div className="ml-3 flex-grow">
                    <p className="text-sm font-medium">{category}</p>
                  </div>
                  <span className={`font-semibold ${colorClass}`}>
                    {isIncome ? "+" : "-"}€{total.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </>
  );
}