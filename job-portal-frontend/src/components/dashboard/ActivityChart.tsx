"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "cn";

export interface ActivityChartProps {
  title?: string;
  description?: string;
  weeklyData: Array<{ name: string; applications?: number; count?: number; applicants?: number }>;
  monthlyData: Array<{ name: string; applications?: number; count?: number; applicants?: number }>;
  yearlyData: Array<{ name: string; applications?: number; count?: number; applicants?: number }>;
  dataKey?: string;
  color?: string;
}

export function ActivityChart({
  title = "Application Activity",
  description = "Track your job application rhythm over time",
  weeklyData,
  monthlyData,
  yearlyData,
  dataKey = "applications",
  color = "#18181b",
}: ActivityChartProps) {
  const [filter, setFilter] = useState<"weekly" | "monthly" | "yearly">("monthly");

  const currentData =
    filter === "weekly" ? weeklyData : filter === "monthly" ? monthlyData : yearlyData;

  return (
    <Card className="rounded-2xl border-neutral-200/80 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </CardTitle>
          {description && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
          {(["weekly", "monthly", "yearly"] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setFilter(period)}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-medium capitalize transition-all",
                filter === period
                  ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-neutral-100 font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={currentData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.6} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#888888" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#888888" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderColor: "#e5e7eb",
                  borderRadius: "0.75rem",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#activityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
