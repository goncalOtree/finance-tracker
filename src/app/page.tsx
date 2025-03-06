"use client";

import RecentTransactions from "@/components/ui/MainPage/recentTransaction";
import TransactionsChart from "@/components/ui/MainPage/transactionChart";
import { useUser } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn } = useUser();

  if (!isSignedIn) return <div className="w-full h-screen bg-white dark:bg-gray-950 min-h-screen" />;

  return (
    <div className="p-4 bg-white dark:bg-gray-950 min-h-screen space-y-6">
      <TransactionsChart/>
      <RecentTransactions />
    </div>
  );
}