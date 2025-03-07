"use client";

import { fetchTransactions } from "@/actions/transactions.action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import { useUser } from "@clerk/nextjs";
import { CategoryType } from "@prisma/client";
import React, { useEffect, useState } from "react";
import AreaChartComponent from "@/components/ui/StatsGraphs/AreaChartComponent";
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import PieChartComponent from "@/components/ui/StatsGraphs/PieChartComponent";
import SummaryCards from "@/components/ui/StatsGraphs/SummaryCards";
import { BarChart } from "lucide-react";
import BarChartComponent from "@/components/ui/StatsGraphs/BarChartComponent";

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
  createdAt: Date;
  description?: string;
}

function StatsPage() {
  const { isSignedIn } = useUser();
  if (!isSignedIn)
    return (
      <div className="w-full h-screen bg-white dark:bg-gray-950 min-h-screen" />
    );

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>(
    []
  );
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const availableYears = Array.from(
    new Set(transactions.map((t) => t.year))
  ).sort((a, b) => parseInt(b) - parseInt(a));

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const data = await fetchTransactions();
        setTransactions(data);
        setSelectedYear(new Date().getFullYear().toString());
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setLoading(false);
      }
    };

    getTransactions();
  }, []);

  const filteredTransactions = transactions.filter(
    (t) => t.year === selectedYear
  );

  const totalExpenses = filteredTransactions
    .filter((t) => t.category.type === "FIXO" || t.category.type === "VARIÁVEL")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = filteredTransactions
    .filter((t) => t.category.type === "VENCIMENTO")
    .reduce((sum, t) => sum + t.amount, 0);


  if (loading) {
    return (
      <div className="space-y-4 p-4 max-w-[1200px] mx-auto">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[250px] w-full rounded-lg" />
          <Skeleton className="h-[250px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-semibold">Estatísticas</h2>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select
            value={selectedYear || ""}
            onValueChange={(year) => setSelectedYear(year)}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!loading && selectedYear && (
        <div className="space-y-6">
          <SummaryCards income={totalIncome} expenses={totalExpenses} />
          
          {/* Area Chart with full width */}
          <AreaChartComponent transactions={filteredTransactions} />

          <BarChartComponent transactions={filteredTransactions} selectedYear={selectedYear} />

          {/* Pie Charts in responsive grid */}

          <PieChartComponent
            transactions={filteredTransactions}
          />
        </div>
      )}
    </div>
  );
}

export default StatsPage;
