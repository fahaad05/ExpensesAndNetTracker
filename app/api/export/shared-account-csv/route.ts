import { NextResponse } from "next/server";

import { getDashboardData } from "@/lib/db";

export function GET() {
  const rows = getDashboardData().sharedTransactions;
  const header = "date,description,category,amount,usedBy,notes";
  const body = rows
    .map((row) =>
      [row.transactionDate, row.description, row.category, row.amount, row.usedBy, row.notes]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");

  return new NextResponse(`${header}\n${body}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="shared-account-transactions.csv"'
    }
  });
}
