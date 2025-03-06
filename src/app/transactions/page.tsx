"use client";

import React, { useEffect, useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/shadcn/select";
import { 
  deleteTransaction,
  fetchTransactions, 
  getTotalByMonthAndCategory 
} from "@/actions/transactions.action";
import { CategoryType } from "@prisma/client";
import { Skeleton } from "@/components/ui/shadcn/skeleton";
import { FilterDialog } from "@/components/ui/Transactions/FilterDialog";
import { TransactionTotals } from "@/components/ui/Transactions/TransactionTotals";
import { Button } from "@/components/ui/shadcn/button";
import { Layers, ListFilter } from "lucide-react";
import { TransactionList } from "@/components/ui/Transactions/TransactionList";
import { useUser } from "@clerk/nextjs";

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

export default function TransactionsView() {
  const { isSignedIn } = useUser();

  if (!isSignedIn) return <div className="w-full h-screen bg-white dark:bg-gray-950 min-h-screen" />;
  
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [totalsByMonthAndCategory, setTotalsByMonthAndCategory] = useState<Record<string, Record<string, number>>>({});
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  
  // View mode state
  const [viewMode, setViewMode] = useState<'totals' | 'list'>('totals');

  // Sorting and filtering functions
  const applySortAndFilter = (transactionsToSort: TransactionWithCategory[]) => {
    let processedTransactions = [...transactionsToSort];

    // Filter by selected year
    if (selectedYear) {
      processedTransactions = processedTransactions.filter(t => t.year === selectedYear);
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      processedTransactions = processedTransactions.filter(t => 
        selectedCategories.includes(t.category.name)
      );
    }

    // Apply month filter
    if (selectedMonths.length > 0) {
      processedTransactions = processedTransactions.filter(t => 
        selectedMonths.includes(t.month)
      );
    }

    return processedTransactions;
  };

  // Fetch transactions and initialize data
  useEffect(() => {
    const getTransactions = async () => {
      try {
        const data = await fetchTransactions();
        setTransactions(data);

        // Sort transactions by year in descending order
        const sortedTransactions = data.sort((a, b) => parseInt(b.year) - parseInt(a.year));

        // Set the most recent year as the default
        if (sortedTransactions.length > 0) {
          const mostRecentYear = sortedTransactions[0].year;
          setSelectedYear(mostRecentYear);

          // Fetch totals for the most recent year
          const totals = await getTotalByMonthAndCategory(mostRecentYear);
          setTotalsByMonthAndCategory(totals);
        }
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setLoading(false);
      }
    };

    getTransactions();
  }, []);

  // Apply filtering when year or other filters change
  useEffect(() => {
    if (transactions.length > 0) {
      const filtered = applySortAndFilter(transactions);
      setFilteredTransactions(filtered);
    }
  }, [selectedYear, selectedCategories, selectedMonths, transactions]);

  // Fetch totals when year changes
  useEffect(() => {
    if (selectedYear) {
      const fetchTotals = async () => {
        const totals = await getTotalByMonthAndCategory(selectedYear);
        setTotalsByMonthAndCategory(totals);
      };

      fetchTotals();
    }
  }, [selectedYear]);


  const availableYears = Array.from(new Set(transactions.map((t) => t.year))).sort((a, b) => parseInt(b) - parseInt(a));


  const availableCategories = Array.from(
    new Set(transactions.filter(t => t.year === selectedYear).map((t) => t.category.name))
  ).sort();
  const availableMonths = Array.from(
    new Set(transactions.filter(t => t.year === selectedYear).map((t) => t.month))
  ).sort();

  const handleEditTransaction = (transactionId: string) => {
    console.log(`Edit transaction: ${transactionId}`);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        
        await deleteTransaction(transactionId);
        
        // Update local state after successful deletion
        const updatedTransactions = transactions.filter(t => t.id !== transactionId);
        setTransactions(updatedTransactions);
        
        // Update filtered transactions as well
        setFilteredTransactions(prevFiltered => 
          prevFiltered.filter(t => t.id !== transactionId)
        );
  
        // If we're in the totals view, refresh the totals data
        if (selectedYear && viewMode === 'totals') {
          const totals = await getTotalByMonthAndCategory(selectedYear);
          setTotalsByMonthAndCategory(totals);
        }
      } catch (error) {
        console.error("Failed to delete transaction", error);
        alert("Failed to delete transaction");
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-lg font-semibold">Transações</h2>
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <Select value={selectedYear || ""} onValueChange={(year) => setSelectedYear(year)}>
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
          <FilterDialog 
            availableCategories={availableCategories}
            availableMonths={availableMonths}
            selectedCategories={selectedCategories}
            selectedMonths={selectedMonths}
            onCategoryChange={setSelectedCategories}
            onMonthChange={setSelectedMonths}
          />
          <div className="flex rounded-md shadow-sm w-full md:w-auto">
            <Button
              variant={viewMode === 'totals' ? "default" : "outline"}
              onClick={() => setViewMode('totals')}
              className="rounded-l-md rounded-r-none flex-1 md:flex-none"
            >
              <Layers className="h-4 w-4 mr-1" />
              Sumário
            </Button>
            <Button
              variant={viewMode === 'list' ? "default" : "outline"}
              onClick={() => setViewMode('list')}
              className="rounded-r-md rounded-l-none flex-1 md:flex-none"
            >
              <ListFilter className="h-4 w-4 mr-1" />
              Ver Todas
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'totals' ? (
        <TransactionTotals 
          transactions={transactions}
          filteredTransactions={filteredTransactions}
          selectedYear={selectedYear}
        />
      ) : (
        <TransactionList
          transactions={filteredTransactions.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      )}
    </div>
  );
}