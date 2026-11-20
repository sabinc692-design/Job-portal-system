"use client";

import * as React from "react";
import { cn } from "cn";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: Array<{ label: string; value: string }>;
}

export function Select({
  className,
  children,
  options,
  ...props
}: SelectProps) {
  return (
    <div className="relative inline-block w-full">
      <select
        className={cn(
          "w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2 pr-8 text-sm shadow-xs transition-colors focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-100 dark:focus:ring-neutral-100 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {options ? (
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        ) : (
          children
        )}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
    </div>
  );
}
