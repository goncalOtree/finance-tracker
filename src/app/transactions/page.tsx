"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import {
  deleteTransaction,
  fetchTransactions,
  getTotalByMonthAndCategory,
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
  day: string;
  createdAt: Date;
  description?: string;
}

export default function TransactionsView() {
  const { isSignedIn } = useUser();

  if (!isSignedIn)
    return (
      <div className="w-full h-screen bg-white dark:bg-gray-950 min-h-screen" />
    );

  const [transactions, setTransactions] = useState<TransactionWithCategory[]>(
    []
  );
  const [filteredTransactions, setFilteredTransactions] = useState<
    TransactionWithCategory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [totalsByMonthAndCategory, setTotalsByMonthAndCategory] = useState<
    Record<string, Record<string, number>>
  >({});

  // Permanent filter states (set via FilterDialog)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  // Temporary filter states (set via clicking on summary)
  const [tempCategory, setTempCategory] = useState<string | null>(null);
  const [tempMonth, setTempMonth] = useState<string | null>(null);

  // View mode state
  const [viewMode, setViewMode] = useState<"totals" | "list">("totals");

  // Sorting and filtering functions
  const applySortAndFilter = (
    transactionsToSort: TransactionWithCategory[]
  ) => {
    let processedTransactions = [...transactionsToSort];

    // Filter by selected year
    if (selectedYear) {
      processedTransactions = processedTransactions.filter(
        (t) => t.year === selectedYear
      );
    }

    // Apply permanent category filter
    if (selectedCategories.length > 0) {
      processedTransactions = processedTransactions.filter((t) =>
        selectedCategories.includes(t.category.name)
      );
    }

    // Apply permanent month filter
    if (selectedMonths.length > 0) {
      processedTransactions = processedTransactions.filter((t) =>
        selectedMonths.includes(t.month)
      );
    }

    // Apply temporary category filter if in list view
    if (viewMode === "list" && tempCategory) {
      processedTransactions = processedTransactions.filter(
        (t) => t.category.name === tempCategory
      );
    }

    // Apply temporary month filter if in list view
    if (viewMode === "list" && tempMonth) {
      processedTransactions = processedTransactions.filter(
        (t) => t.month === tempMonth
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
        const sortedTransactions = data.sort(
          (a, b) => parseInt(b.year) - parseInt(a.year)
        );

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

  // Apply filtering when filters change
  useEffect(() => {
    if (transactions.length > 0) {
      const filtered = applySortAndFilter(transactions);
      setFilteredTransactions(filtered);
    }
  }, [
    selectedYear,
    selectedCategories,
    selectedMonths,
    tempCategory,
    tempMonth,
    viewMode,
    transactions,
  ]);

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

  // Clear temporary filters when switching back to totals view
  useEffect(() => {
    if (viewMode === "totals") {
      setTempCategory(null);
      setTempMonth(null);
    }
  }, [viewMode]);

  const availableYears = Array.from(
    new Set(transactions.map((t) => t.year))
  ).sort((a, b) => parseInt(b) - parseInt(a));

  const availableCategories = Array.from(
    new Set(
      transactions
        .filter((t) => t.year === selectedYear)
        .map((t) => t.category.name)
    )
  ).sort();

  const availableMonths = Array.from(
    new Set(
      transactions.filter((t) => t.year === selectedYear).map((t) => t.month)
    )
  ).sort();

  const handleEditTransaction = (transactionId: string) => {
    console.log(`Edit transaction: ${transactionId}`);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(transactionId);

        // Update local state after successful deletion
        const updatedTransactions = transactions.filter(
          (t) => t.id !== transactionId
        );
        setTransactions(updatedTransactions);

        // Update filtered transactions as well
        setFilteredTransactions((prevFiltered) =>
          prevFiltered.filter((t) => t.id !== transactionId)
        );

        // If we're in the totals view, refresh the totals data
        if (selectedYear && viewMode === "totals") {
          const totals = await getTotalByMonthAndCategory(selectedYear);
          setTotalsByMonthAndCategory(totals);
        }
      } catch (error) {
        console.error("Failed to delete transaction", error);
        alert("Failed to delete transaction");
      }
    }
  };

  // Handler for applying permanent filters via the dialog
  const handleFilterDialogChange = {
    categories: (categories: string[]) => {
      setSelectedCategories(categories);
      // Clear any temporary category filter when applying permanent ones
      setTempCategory(null);
    },
    months: (months: string[]) => {
      setSelectedMonths(months);
      // Clear any temporary month filter when applying permanent ones
      setTempMonth(null);
    },
  };

  // Handler for clicking on a transaction in Sumário view
  const handleSummaryItemClick = (month: string, category: string) => {
    // Set temporary filters
    setTempMonth(month);
    setTempCategory(category);

    // Switch to the "Ver Todas" view
    setViewMode("list");
  };

  // Handler for switching view modes
  const handleViewModeChange = (mode: "totals" | "list") => {
    // If switching to totals, clear temporary filters
    if (mode === "totals") {
      setTempCategory(null);
      setTempMonth(null);
    }

    setViewMode(mode);
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
          <FilterDialog
            availableMonths={availableMonths}
            selectedMonths={selectedMonths}
            onMonthChange={handleFilterDialogChange.months}
          />
          <div className="flex rounded-md shadow-sm w-full md:w-auto">
            <Button
              variant={viewMode === "totals" ? "default" : "outline"}
              onClick={() => handleViewModeChange("totals")}
              className="rounded-l-md rounded-r-none flex-1 md:flex-none"
            >
              <Layers className="h-4 w-4 mr-1" />
              Sumário
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => handleViewModeChange("list")}
              className="rounded-r-md rounded-l-none flex-1 md:flex-none"
            >
              <ListFilter className="h-4 w-4 mr-1" />
              Ver Todas
            </Button>
          </div>
        </div>
      </div>

      {/* Display active temporary filters if they exist */}
      {viewMode === "list" && (tempCategory || tempMonth) && (
        <div className="mb-4 px-2 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-purple-700 dark:text-purple-300">
              <span className="font-medium">Filtro Temporário:</span>
              {tempMonth && (
                <span>
                  {tempMonth.charAt(0).toUpperCase() + tempMonth.slice(1)}
                </span>
              )}
              {tempMonth && tempCategory && <span>•</span>}
              {tempCategory && <span>{tempCategory}</span>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800/30"
              onClick={() => {
                setTempCategory(null);
                setTempMonth(null);
              }}
            >
              Limpar
            </Button>
          </div>
        </div>
      )}

      {viewMode === "totals" ? (
        <TransactionTotals
          transactions={transactions}
          filteredTransactions={filteredTransactions}
          selectedYear={selectedYear}
          onItemClick={handleSummaryItemClick}
        />
      ) : (
        <TransactionList
          transactions={filteredTransactions.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      )}
    </div>
  );
}
