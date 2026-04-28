import en from "@/resources/en.json";

export type Locale = "en" | "it";

export const defaultLocale: Locale = "en";

function format(template: string, values: Record<string, string | number>) {
  return template.replaceAll(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}

export function getTranslations(_locale: Locale = defaultLocale) {
  const raw = en;

  return {
    ...raw,
    common: {
      ...raw.common,
      importedAt: (value: string) => format(raw.common.importedAt, { value }),
      rows: (count: number) => format(raw.common.rows, { count })
    },
    reviewBuilder: {
      ...raw.reviewBuilder,
      availablePeriodsText: (value: string) => format(raw.reviewBuilder.availablePeriodsText, { value }),
      assignmentTitle: (month: string) => format(raw.reviewBuilder.assignmentTitle, { month }),
      transactionsTitle: (month: string) => format(raw.reviewBuilder.transactionsTitle, { month }),
      toggleCategory: (label: string) => format(raw.reviewBuilder.toggleCategory, { label })
    },
    reviews: {
      ...raw.reviews,
      year: (value: string) => format(raw.reviews.year, { value }),
      yearReviews: (value: string) => format(raw.reviews.yearReviews, { value }),
      noQuarterlyForYear: (value: string) => format(raw.reviews.noQuarterlyForYear, { value })
    },
    home: {
      ...raw.home,
      capturedOn: (date: string) => format(raw.home.capturedOn, { date }),
      yourUsageVs: (other: string) => format(raw.home.yourUsageVs, { other }),
      nowWorth: (value: string) => format(raw.home.nowWorth, { value }),
      monthlyTrendDescription: (year: string) => format(raw.home.monthlyTrendDescription, { year }),
      quarterlyTrendDescription: (year: string) => format(raw.home.quarterlyTrendDescription, { year }),
      importedRows: (count: number) => format(raw.home.importedRows, { count }),
      tracked: (value: string) => format(raw.home.tracked, { value }),
      margin: (value: string) => format(raw.home.margin, { value }),
      incomeExpensesInvestments: (income: string, expenses: string, investments: string) =>
        format(raw.home.incomeExpensesInvestments, { income, expenses, investments }),
      rates: (expenseRate: string, investmentRate: string, extraRate: string) =>
        format(raw.home.rates, { expenseRate, investmentRate, extraRate }),
      fixedTravelOneOff: (fixed: string, fixedRate: string, travel: string, oneOff: string) =>
        format(raw.home.fixedTravelOneOff, { fixed, fixedRate, travel, oneOff }),
      reviewDateTotalActive: (date: string, totalActive: string) =>
        format(raw.home.reviewDateTotalActive, { date, totalActive }),
      mainEmergencyInvestmentsCrypto: (main: string, emergency: string, investments: string, crypto: string) =>
        format(raw.home.mainEmergencyInvestmentsCrypto, { main, emergency, investments, crypto }),
      debts: (value: string) => format(raw.home.debts, { value })
    },
    insights: {
      ...raw.insights,
      monthlyMarginImproved: (value: string) => format(raw.insights.monthlyMarginImproved, { value }),
      monthlyMarginFell: (value: string) => format(raw.insights.monthlyMarginFell, { value }),
      monthlyExpenseRateMore: (value: string) => format(raw.insights.monthlyExpenseRateMore, { value }),
      monthlyExpenseRateLess: (value: string) => format(raw.insights.monthlyExpenseRateLess, { value }),
      monthlyTravelHigh: (value: string) => format(raw.insights.monthlyTravelHigh, { value }),
      monthlyOneOffHigh: (value: string) => format(raw.insights.monthlyOneOffHigh, { value }),
      monthlyFixedHeavy: (value: string) => format(raw.insights.monthlyFixedHeavy, { value }),
      quarterlyNetWorthImproved: (value: string) => format(raw.insights.quarterlyNetWorthImproved, { value }),
      quarterlyNetWorthDropped: (value: string) => format(raw.insights.quarterlyNetWorthDropped, { value }),
      quarterlyDebtsDecreased: (value: string) => format(raw.insights.quarterlyDebtsDecreased, { value }),
      quarterlyDebtsIncreased: (value: string) => format(raw.insights.quarterlyDebtsIncreased, { value })
    }
  };
}
