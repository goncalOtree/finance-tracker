"use client";

import React from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface SummaryCardsProps {
  income: number;
  expenses: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ income, expenses }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-4">
      {/* Income Card */}
      <div className="flex items-center justify-between bg-green-600 text-white p-4 rounded-2xl w-full max-w-xs sm:w-60 shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-white p-2 rounded-lg">
            <ArrowDownCircle className="text-green-600" size={28} />
          </div>
          <div>
            <p className="text-sm">Vencimentos</p>
            <p className="text-lg font-bold">€{income.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      {/* Expenses Card */}
      <div className="flex items-center justify-between bg-red-500 text-white p-4 rounded-2xl w-full max-w-xs sm:w-60 shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-white p-2 rounded-lg">
            <ArrowUpCircle className="text-red-500" size={28} />
          </div>
          <div>
            <p className="text-sm">Despesas</p>
            <p className="text-lg font-bold">€{expenses.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
