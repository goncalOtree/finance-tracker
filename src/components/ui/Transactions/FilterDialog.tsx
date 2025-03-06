import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/shadcn/dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { Label } from "@/components/ui/shadcn/label";
import { Input } from "@/components/ui/shadcn/input";
import { Filter, X, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";

interface FilterDialogProps {
  availableCategories: string[];
  availableMonths: string[];
  selectedCategories: string[];
  selectedMonths: string[];
  onCategoryChange: (categories: string[]) => void;
  onMonthChange: (months: string[]) => void;
}

export function FilterDialog({
  availableCategories,
  availableMonths,
  selectedCategories,
  selectedMonths,
  onCategoryChange,
  onMonthChange,
}: FilterDialogProps) {
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  const filteredCategories = availableCategories.filter((category) =>
    category.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  return (
    <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="ml-2">
          <Filter className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-6 overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Filtrar Transações
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 flex-grow overflow-auto">
          {/* Category Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Categorias</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search categories..."
                className="pl-10"
                value={categorySearchTerm}
                onChange={(e) => setCategorySearchTerm(e.target.value)}
              />
              {categorySearchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setCategorySearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <ScrollArea className="h-[300px] border rounded-lg p-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {filteredCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) => {
                        onCategoryChange(
                          checked
                            ? [...selectedCategories, category]
                            : selectedCategories.filter((c) => c !== category)
                        );
                      }}
                    />
                    <label
                      htmlFor={`category-${category}`}
                      className="text-sm font-medium truncate"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={() => onCategoryChange([])} size="sm">
                Limpar
              </Button>
              <Button
                variant="outline"
                onClick={() => onCategoryChange(availableCategories)}
                size="sm"
              >
                Selecionar Tudo
              </Button>
            </div>
          </div>

          {/* Month Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Meses</Label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {availableMonths.map((month) => (
                <Button
                  key={month}
                  variant={selectedMonths.includes(month) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    onMonthChange(
                      selectedMonths.includes(month)
                        ? selectedMonths.filter((m) => m !== month)
                        : [...selectedMonths, month]
                    );
                  }}
                >
                  {month}
                </Button>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => onMonthChange([])} size="sm">
                Limpar
              </Button>
              <Button
                variant="outline"
                onClick={() => onMonthChange(availableMonths)}
                size="sm"
              >
                Selecionar Tudo
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
