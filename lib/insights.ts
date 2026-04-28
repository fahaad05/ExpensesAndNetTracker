import type { MonthlyReview, QuarterlyReview } from "@/lib/db";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getTranslations } from "@/lib/translations";

export function getMonthlyInsights(review: MonthlyReview, previous?: MonthlyReview) {
  const t = getTranslations();
  const insights: string[] = [];
  const margin = review.income - review.expenses - review.investments;

  if (previous) {
    const previousMargin = previous.income - previous.expenses - previous.investments;
    const marginDelta = margin - previousMargin;
    if (Math.abs(marginDelta) >= 150) {
      insights.push(
        marginDelta > 0
          ? t.insights.monthlyMarginImproved(formatCurrency(marginDelta))
          : t.insights.monthlyMarginFell(formatCurrency(Math.abs(marginDelta)))
      );
    }

    const expenseRateDelta = review.expenseRate - previous.expenseRate;
    if (Math.abs(expenseRateDelta) >= 3) {
      insights.push(
        expenseRateDelta > 0
          ? t.insights.monthlyExpenseRateMore(formatPercent(expenseRateDelta))
          : t.insights.monthlyExpenseRateLess(formatPercent(Math.abs(expenseRateDelta)))
      );
    }
  }

  if (review.travel >= 400) {
    insights.push(t.insights.monthlyTravelHigh(formatCurrency(review.travel)));
  }

  if (review.oneOffExpenses >= 400) {
    insights.push(t.insights.monthlyOneOffHigh(formatCurrency(review.oneOffExpenses)));
  }

  if (review.fixedExpenseRate >= 50) {
    insights.push(t.insights.monthlyFixedHeavy(formatPercent(review.fixedExpenseRate)));
  }

  return insights.slice(0, 3);
}

export function getQuarterlyInsights(review: QuarterlyReview, previous?: QuarterlyReview) {
  const t = getTranslations();
  const insights: string[] = [];

  if (previous) {
    const netWorthDelta = review.netWorth - previous.netWorth;
    if (Math.abs(netWorthDelta) >= 500) {
      insights.push(
        netWorthDelta > 0
          ? t.insights.quarterlyNetWorthImproved(formatCurrency(netWorthDelta))
          : t.insights.quarterlyNetWorthDropped(formatCurrency(Math.abs(netWorthDelta)))
      );
    }

    const debtDelta = review.debts - previous.debts;
    if (Math.abs(debtDelta) >= 500) {
      insights.push(
        debtDelta < 0
          ? t.insights.quarterlyDebtsDecreased(formatCurrency(Math.abs(debtDelta)))
          : t.insights.quarterlyDebtsIncreased(formatCurrency(debtDelta))
      );
    }
  }

  const liquidBuffer = review.mainAccount + review.emergencyFund;
  if (review.debts > 0 && liquidBuffer / review.debts < 0.4) {
    insights.push(t.insights.quarterlyLiquidBufferLight);
  }

  if (review.investmentsValue + review.crypto > review.mainAccount + review.emergencyFund) {
    insights.push(t.insights.quarterlyMoreCapitalWorking);
  }

  return insights.slice(0, 3);
}
