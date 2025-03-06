"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
  HomeIcon,
  PieChartIcon,
  BanknoteIcon,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import TransactionSheet from "../TransactionSheet";
import ProfileSheet from "../Profile/ProfileSheet";
import { usePathname } from "next/navigation";

export default function NavBarStyle() {
  const { theme, setTheme } = useTheme();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex justify-center items-center">
      <div className="w-full max-w-screen-lg px-4 flex justify-between items-center relative">
        <Link
          href="/"
          className={`flex flex-col items-center text-gray-400 dark:text-gray-500 ${
            pathname === "/"
              ? "text-purple-600 dark:text-purple-500"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          <HomeIcon size={24} />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link
          href="/transactions"
          className={`flex flex-col items-center text-gray-400 dark:text-gray-500 ${
            pathname === "/transactions"
              ? "text-purple-600 dark:text-purple-500"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          <BanknoteIcon size={24} />
          <span className="text-xs mt-1">Transações</span>
        </Link>

        <div className="relative flex items-center justify-center">
          <button
            onClick={() => setIsFabOpen(!isFabOpen)}
            className="absolute -top-12 bg-purple-500 text-white p-4 rounded-full shadow-lg focus:outline-none"
          >
            {isFabOpen ? <X size={28} /> : <Plus size={28} />}
          </button>

          {isFabOpen && (
            <div className="absolute bottom-16 flex flex-col items-center space-y-3">
              <TransactionSheet type="income">
                <button className="bg-green-500 text-white p-3 rounded-full shadow-md">
                  <ArrowUp size={20} />
                </button>
              </TransactionSheet>

              <TransactionSheet type="expense">
                <button className="bg-red-500 text-white p-3 rounded-full shadow-md">
                  <ArrowDown size={20} />
                </button>
              </TransactionSheet>
            </div>
          )}
        </div>

        <Link
          href="/budget"
          className={`flex flex-col items-center text-gray-400 dark:text-gray-500 ${
            pathname === "/budget"
              ? "text-purple-600 dark:text-purple-500"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          <PieChartIcon size={24} />
          <span className="text-xs mt-1">Estatísticas</span>
        </Link>

        <ProfileSheet />
      </div>
    </div>
  );
}
