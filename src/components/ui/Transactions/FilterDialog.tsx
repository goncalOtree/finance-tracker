import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/shadcn/dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Label } from "@/components/ui/shadcn/label";
import { Filter } from "lucide-react";

interface FilterDialogProps {
  availableMonths: string[];
  selectedMonths: string[];
  onMonthChange: (months: string[]) => void;
}

export function FilterDialog({
  availableMonths,
  selectedMonths,
  onMonthChange,
}: FilterDialogProps) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [tempSelectedMonths, setTempSelectedMonths] = useState<string[]>([]);

  // Initialize temporary selection when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempSelectedMonths([...selectedMonths]);
    }
    setIsFilterDialogOpen(open);
  };

  // Apply filter and close dialog
  const handleApplyFilter = () => {
    onMonthChange(tempSelectedMonths);
    setIsFilterDialogOpen(false);
  };

  // Toggle month selection
  const toggleMonth = (month: string) => {
    setTempSelectedMonths(current => 
      current.includes(month)
        ? current.filter(m => m !== month)
        : [...current, month]
    );
  };

  return (
    <Dialog open={isFilterDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="ml-2" title="Filter by Month">
          <Filter className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Filtrar por Mês
          </DialogTitle>
        </DialogHeader>
        
        {/* Month Filter */}
        <div className="space-y-4 my-4">
          <Label className="text-sm font-medium">Selecionar Meses</Label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {availableMonths.map((month) => (
              <Button
                key={month}
                variant={tempSelectedMonths.includes(month) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMonth(month)}
                className="capitalize"
              >
                {month.charAt(0).toUpperCase() + month.slice(1)}
              </Button>
            ))}
          </div>
          
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => setTempSelectedMonths([])} 
              size="sm"
            >
              Limpar
            </Button>
            <Button
              variant="outline"
              onClick={() => setTempSelectedMonths([...availableMonths])}
              size="sm"
            >
              Selecionar Tudo
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <div className="flex justify-end gap-2 w-full">
            <Button 
              variant="outline" 
              onClick={() => setIsFilterDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleApplyFilter}
            >
              Aplicar Filtro
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}