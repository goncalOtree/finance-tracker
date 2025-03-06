"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/shadcn/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";
import { Input } from "@/components/ui/shadcn/input";
import { Button } from "@/components/ui/shadcn/button";
import { Switch } from "@/components/ui/shadcn/switch";
import { toast } from "sonner";
import { Euro } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  fetchCategories,
  createTransaction,
} from "@/actions/transactions.action";
import { CategoryType } from "@prisma/client";
import { ptBR } from "date-fns/locale";

type TransactionType = "income" | "expense";

interface TransactionSheetProps {
  type: TransactionType;
  children: React.ReactNode;
}

interface Category {
  id: string;
  name: string;
  type: CategoryType;
}

// Map month numbers to Portuguese month names
const portugueseMonths = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export default function TransactionSheet({
  type,
  children,
}: TransactionSheetProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [name, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [month, setMonth] = useState(portugueseMonths[new Date().getMonth()]); // Default to current month in Portuguese
  const [year, setYear] = useState(new Date().getFullYear().toString()); // Default to current year as string
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        const filteredCategories = fetchedCategories.filter((cat: Category) =>
          type === "expense"
            ? cat.type === CategoryType.FIXO ||
              cat.type === CategoryType.VARIÁVEL
            : cat.type === CategoryType.VENCIMENTO
        );
        setCategories(filteredCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast("Failed to fetch categories. Please try again.");
      }
    };

    loadCategories();
  }, [type]);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const selectedMonth = portugueseMonths[date.getMonth()];
      const selectedYear = date.getFullYear().toString();
      setMonth(selectedMonth);
      setYear(selectedYear);
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast("Please enter a valid amount");
      return;
    }

    if (!category) {
      toast("Please select a category");
      return;
    }

    try {
      setLoading(true);
      const finalAmount = Math.abs(parseFloat(amount));
      await createTransaction({
        amount: finalAmount,
        month: month, // Month in lowercase Portuguese
        year: parseInt(year), // Year as number
        categoryId: category,
        name: name || undefined,
      });

      toast(
        `${type === "income" ? "Income" : "Expense"} of €${Math.abs(
          finalAmount
        )} saved successfully`
      );
      setAmount("");
      setDescription("");
      setCategory("");
      setOpen(false);
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast("Failed to save transaction. Please try again.");
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl pt-6 h-[85vh] overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          <div
            className={`p-6 -mt-6 -mx-6 mb-4 ${
              type === "expense" ? "bg-red-500" : "bg-green-500"
            } text-white`}
          >
            <h2 className="text-lg font-medium mb-2">Quanto?</h2>
            <div className="flex items-center text-4xl font-bold">
              <Euro />
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent border-none text-4xl font-bold text-white focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/70 h-auto p-0"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {/* Category Select */}
            <div className="space-y-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Input
                placeholder="Nome (opcional)"
                value={name}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Month and Year Picker */}
            <div className="space-y-2">
              <DatePicker
                selected={(() => {
                  // Create date object with correct month index (0-based)
                  const monthIndex = portugueseMonths.indexOf(month);
                  return new Date(parseInt(year), monthIndex, 1);
                })()}
                onChange={handleDateChange}
                dateFormat="MMMM yyyy"
                showMonthYearPicker
                locale={ptBR}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-4">
            <Button
              className="w-full py-6 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "A Processar..." : "Continuar"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
