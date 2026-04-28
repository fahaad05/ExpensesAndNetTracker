import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const amountValue = searchParams.get("amount");

  if (!date || !from || !amountValue) {
    return NextResponse.json({ error: "Missing required params." }, { status: 400 });
  }

  const amount = Number(amountValue);
  if (Number.isNaN(amount)) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  if (from.toUpperCase() === "CHF") {
    return NextResponse.json({
      date,
      from: "CHF",
      to: "CHF",
      originalAmount: amount,
      convertedAmount: amount
    });
  }

  const response = await fetch(
    `https://api.frankfurter.dev/v1/${date}?base=${encodeURIComponent(from.toUpperCase())}&symbols=CHF`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return NextResponse.json({ error: "Rate lookup failed." }, { status: 502 });
  }

  const data = (await response.json()) as {
    date: string;
    rates?: Record<string, number>;
  };

  const rate = data.rates?.CHF;
  if (!rate) {
    return NextResponse.json({ error: "CHF rate unavailable." }, { status: 404 });
  }

  return NextResponse.json({
    date: data.date,
    from: from.toUpperCase(),
    to: "CHF",
    originalAmount: amount,
    convertedAmount: amount * rate
  });
}
