import { NextResponse } from "next/server";

import { exportSnapshot } from "@/lib/db";

export function GET() {
  return new NextResponse(JSON.stringify(exportSnapshot(), null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="expenses-and-net-tracker-export.json"'
    }
  });
}
