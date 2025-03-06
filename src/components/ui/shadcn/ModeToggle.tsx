"use client";
import * as React from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-full flex items-center space-x-3 p-4 rounded-xl bg-purple-50 dark:bg-gray-800"
    >
      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
        {theme === "dark" ? (
          <SunIcon size={20} className="text-yellow-500" />
        ) : (
          <MoonIcon size={20} className="text-blue-500" />
        )}
      </div>
      <span className="font-medium">Mudar Tema</span>
    </button>
  );
}
