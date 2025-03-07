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
import { CalendarIcon } from "lucide-react";
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
import { format } from "date-fns";

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Derived state from selectedDate
  const month = portugueseMonths[selectedDate.getMonth()];
  const year = selectedDate.getFullYear().toString();
  const day = selectedDate.getDate().toString();

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
        month: month,
        year: parseInt(year),
        day: day,
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

            {/* Date Picker with Day Selection */}
            <div className="space-y-2">
              <div className="relative">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date | null) => {
                    if (date) setSelectedDate(date);
                  }}
                  dateFormat="dd MMMM yyyy"
                  locale={ptBR}
                  className="w-full p-3 pr-10 border rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  calendarClassName="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700"
                  dayClassName={(date) => 
                    date.getDate() === selectedDate.getDate() && 
                    date.getMonth() === selectedDate.getMonth() && 
                    date.getFullYear() === selectedDate.getFullYear()
                      ? "bg-purple-500 text-white rounded-full"
                      : ""
                  }
                  popperClassName="z-[1000]"
                  customInput={
                    <div className="relative w-full cursor-pointer">
                      <Input
                        className="pl-10 cursor-pointer"
                        value={format(selectedDate, "dd MMMM yyyy", { locale: ptBR })}
                        readOnly
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                    </div>
                  }
                />
              </div>
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