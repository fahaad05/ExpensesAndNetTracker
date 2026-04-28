"use client";

import { useMemo, useState } from "react";

import { SharedMonthlyTrendChart, SharedUsageChart } from "@/components/dashboard-charts";
import { SharedAccountManager } from "@/components/shared-account-manager";
import type { SharedTransaction } from "@/lib/db";
import { getTranslations } from "@/lib/translations";

type UsedByFilter = "all" | SharedTransaction["usedBy"];
type ViewMode = "table" | "grouped";

function getUsedByLabel(usedBy: SharedTransaction["usedBy"], t: ReturnType<typeof getTranslations>) {
  if (usedBy === "me") return t.forms.me;
  if (usedBy === "other") return t.forms.otherPerson;
  return t.forms.shared5050;
}

export function SharedAccountLedger({ transactions }: { transactions: SharedTransaction[] }) {
  const t = getTranslations();
  const [filter, setFilter] = useState<UsedByFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const years = useMemo(
    () => [...new Set(transactions.map((transaction) => transaction.transactionDate.slice(0, 4)))].sort((a, b) => b.localeCompare(a)),
    [transactions]
  );
  const [yearFilter, setYearFilter] = useState<string>("all");

  const filteredTransactions = useMemo(() => {
    const byYear = yearFilter === "all"
      ? transactions
      : transactions.filter((transaction) => transaction.transactionDate.startsWith(yearFilter));

    if (filter === "all") {
      return byYear;
    }

    return byYear.filter((transaction) => transaction.usedBy === filter);
  }, [filter, transactions, yearFilter]);

  const groupedTransactions = useMemo(
    () => ({
      me: filteredTransactions.filter((transaction) => transaction.usedBy === "me"),
      other: filteredTransactions.filter((transaction) => transaction.usedBy === "other"),
      shared: filteredTransactions.filter((transaction) => transaction.usedBy === "shared")
    }),
    [filteredTransactions]
  );

  const usageChartData = useMemo(() => {
    const myUsage = filteredTransactions.reduce((sum, transaction) => {
      if (transaction.usedBy === "me") return sum + transaction.amount;
      if (transaction.usedBy === "shared") return sum + transaction.amount / 2;
      return sum;
    }, 0);

    const otherUsage = filteredTransactions.reduce((sum, transaction) => {
      if (transaction.usedBy === "other") return sum + transaction.amount;
      if (transaction.usedBy === "shared") return sum + transaction.amount / 2;
      return sum;
    }, 0);

    if (filter === "me") {
      return [{ label: t.forms.me, amount: myUsage }];
    }

    if (filter === "other") {
      return [{ label: t.forms.otherPerson, amount: otherUsage }];
    }

    if (filter === "shared") {
      return [{ label: t.forms.shared5050, amount: filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0) }];
    }

    return [
      { label: t.forms.me, amount: myUsage },
      { label: t.forms.otherPerson, amount: otherUsage }
    ];
  }, [filter, filteredTransactions, t.forms.me, t.forms.otherPerson, t.forms.shared5050]);

  const monthlyTrendData = useMemo(() => {
    const monthlyTotalsMap = new Map<string, number>();
    for (const transaction of filteredTransactions) {
      const month = transaction.transactionDate.slice(0, 7);
      monthlyTotalsMap.set(month, (monthlyTotalsMap.get(month) ?? 0) + transaction.amount);
    }

    return [...monthlyTotalsMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, amount]) => ({ label, amount }));
  }, [filteredTransactions]);

  return (
    <div className="ledger-workspace">
      <div className="ledger-toolbar">
        <label className="field ledger-toolbar-field">
          <span>Filter</span>
          <div className="select-shell">
            <select className="select-input" value={filter} onChange={(event) => setFilter(event.target.value as UsedByFilter)}>
              <option value="all">All people</option>
              <option value="me">{t.forms.me}</option>
              <option value="other">{t.forms.otherPerson}</option>
              <option value="shared">{t.forms.shared5050}</option>
            </select>
          </div>
        </label>

        <label className="field ledger-toolbar-field">
          <span>Year</span>
          <div className="select-shell">
            <select className="select-input" value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
              <option value="all">All years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="field ledger-toolbar-field">
          <span>View</span>
          <div className="select-shell">
            <select className="select-input" value={viewMode} onChange={(event) => setViewMode(event.target.value as ViewMode)}>
              <option value="table">Single table</option>
              <option value="grouped">Grouped by person</option>
            </select>
          </div>
        </label>
      </div>

      <div className="content-grid">
        <article className="panel chart-panel">
          <div className="section-header">
            <span>Usage view</span>
            <h2>Who used the shared money</h2>
            <p>See the split after 50/50 items are divided, using the current person filter.</p>
          </div>
          <SharedUsageChart data={usageChartData} />
        </article>

        <article className="panel chart-panel warm">
          <div className="section-header">
            <span>Monthly trend</span>
            <h2>Shared spending over time</h2>
            <p>A month-by-month view of the transactions currently included by the filter.</p>
          </div>
          <SharedMonthlyTrendChart data={monthlyTrendData} />
        </article>
      </div>

      {viewMode === "table" ? (
        <SharedAccountManager transactions={filteredTransactions} showUsedBy />
      ) : (
        <div className="ledger-group-list">
          {(["me", "other", "shared"] as const).map((usedBy) => (
            <details key={usedBy} className="ledger-group-card" open={groupedTransactions[usedBy].length > 0}>
              <summary className="ledger-group-header ledger-group-summary">
                <strong>{getUsedByLabel(usedBy, t)}</strong>
                <span>{groupedTransactions[usedBy].length} rows</span>
              </summary>
              {groupedTransactions[usedBy].length ? (
                <SharedAccountManager transactions={groupedTransactions[usedBy]} showUsedBy={false} />
              ) : (
                <p className="helper-note">No transactions in this group.</p>
              )}
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
