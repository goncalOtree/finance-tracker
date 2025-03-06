import React, { useState } from "react";
import { Button } from "@/components/ui/shadcn/button";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { CategoryType } from "@prisma/client";

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
  name?: string;
}

interface TransactionListProps {
  transactions: TransactionWithCategory[];
  onEdit: (transactionId: string) => void;
  onDelete: (transactionId: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
}) => {
  const [visibleTransactions, setVisibleTransactions] = useState(40);

  const loadMore = () => {
    setVisibleTransactions((prev) => prev + 40);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-4">All Transactions</h3>
      
      {transactions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No transactions found</p>
      ) : (
        <>
          {/* Desktop view (hidden on small screens) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left py-2 px-3">Data Criação</th>
                  <th className="text-left py-2 px-3">Categoria</th>
                  <th className="text-left py-2 px-3">Descrição</th>
                  <th className="text-right py-2 px-3">Quantidade</th>
                  <th className="text-right py-2 px-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, visibleTransactions).map((transaction) => (
                  <tr 
                    key={transaction.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <td className="py-3 px-3">
                      {format(new Date(transaction.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span>{transaction.category.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {transaction.name || "-"}
                    </td>
                    <td className={`py-3 px-3 text-right font-medium ${
                      transaction.category.type === CategoryType.VENCIMENTO ? "text-green-500" : "text-red-500" 
                    }`}>
                      {transaction.category.type === CategoryType.VENCIMENTO ? "+" : "-"}
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(transaction.id)}
                          title="Edit transaction"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(transaction.id)}
                          title="Delete transaction"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile view (shown only on small screens) */}
          <div className="md:hidden space-y-4">
            {transactions.slice(0, visibleTransactions).map((transaction) => (
              <div 
                key={transaction.id} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{transaction.category.name}</span>
                  </div>
                  <span className={`font-bold ${
                    transaction.category.type === CategoryType.VENCIMENTO ? "text-green-500" : "text-red-500" 
                  }`}>
                    {transaction.category.type === CategoryType.VENCIMENTO ? "+" : "-"}
                    ${Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(transaction.createdAt), "MMM d, yyyy")}
                </div>

                {transaction.name && (
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400"></span> {transaction.name}
                  </div>
                )}
                
                
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(transaction.id)}
                    title="Edit transaction"
                  >
                    <Edit className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(transaction.id)}
                    title="Delete transaction"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Apagar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {visibleTransactions < transactions.length && (
            <div className="flex justify-center mt-4">
              <Button onClick={loadMore}>Load More</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};