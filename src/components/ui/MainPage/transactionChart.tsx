"use client";

import { getTotalbyMonth } from "@/actions/transactions.action";
import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Total = {
  _sum: {
    amount: any;
  };
  month: string;
};

function TransactionChart() {
  const [total, setTotal] = useState<Total[]>([]);
  const [chartWidth, setChartWidth] = useState(400);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getTotalbyMonth(new Date().getFullYear().toString());
        setTotal(data);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      }
    }
    fetchData();
  }, []);

  
  useEffect(() => {
    const updateWidth = () => setChartWidth(window.innerWidth < 640 ? 300 : 400);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={total}>
          <XAxis dataKey="month" tick={{ fill: "#8884d8" }} />
          <YAxis tick={{ fill: "#8884d8" }} />
          <Tooltip />
          <Line
            name="total"
            type="monotone"
            dataKey="_sum.amount"
            stroke="#7C3AED"
            strokeWidth={3}
            dot={{ r: 4 }}
            strokeLinecap="round"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TransactionChart;
