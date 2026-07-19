export function getSalaryMonthPeriod(transactionDate: string) {
  const date = new Date(`${transactionDate.slice(0, 10)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 7);
  return date.toISOString().slice(0, 7);
}
