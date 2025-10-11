"use client";

import { formatOrderDate } from "@/lib/order-utils";

interface ClientDateProps {
  date: Date | string;
  className?: string;
}

export function ClientDate({ date, className }: ClientDateProps) {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return (
    <span className={className} suppressHydrationWarning>
      {formatOrderDate(dateObj)}
    </span>
  );
}