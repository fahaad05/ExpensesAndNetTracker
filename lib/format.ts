const currencyFormatter = new Intl.NumberFormat("en-CH", {
  style: "currency",
  currency: "CHF",
  maximumFractionDigits: 0
});

const percentFormatter = new Intl.NumberFormat("en-CH", {
  style: "percent",
  maximumFractionDigits: 0
});

export function formatCurrency(value: number) {
  return normalizeFormattedNumber(currencyFormatter.format(value));
}

export function formatPercent(value: number) {
  return percentFormatter.format(value / 100);
}

export function formatCurrencyByCode(value: number, currency: string) {
  return normalizeFormattedNumber(new Intl.NumberFormat("en-CH", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value));
}

function normalizeFormattedNumber(value: string) {
  return value.replaceAll("’", "'");
}
