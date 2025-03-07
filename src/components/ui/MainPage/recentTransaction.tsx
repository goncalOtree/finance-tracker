import { useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";
import { fetchRecentTransactions } from "@/actions/transactions.action";
import { CategoryType } from "@prisma/client";


type LucideIconName = keyof typeof LucideIcons;

type TransactionWithCategory = {
  id: string;
  amount: any;
  categoryId: string;
  category: {
    id: string;
    name: string;
    type: CategoryType;
    icon: string; 
  };
  month: string;
  year: string;
  day: String;
};

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTransactions() {
      try {
        const data = await fetchRecentTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setLoading(false);
      }
    }

    getTransactions();
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Transações mais recentes</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const iconName = transaction.category.icon as LucideIconName;
            const IconComponent = (LucideIcons[iconName as LucideIconName] || LucideIcons["Banknote"]) as React.ElementType;


            return (
              <div
                key={transaction.id}
                className="flex items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg shadow"
              >
                <IconComponent className="text-purple-500" size={24} />
                <div className="ml-3">
                  <p className="text-sm font-medium">{transaction.category.name}</p>
                  <p className="text-xs text-gray-500">{transaction.day} {transaction.month} {transaction.year}</p>
                </div>
                {transaction.category.type === CategoryType.VENCIMENTO ? (
                  <span className="ml-auto text-green-500 font-semibold">
                    +€{parseFloat(transaction.amount).toFixed(2)}
                  </span>
                ) : (
                  <span className="ml-auto text-red-500 font-semibold">
                    -€{parseFloat(transaction.amount).toFixed(2)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
