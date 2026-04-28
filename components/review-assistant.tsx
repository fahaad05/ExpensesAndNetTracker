"use client";

import { useEffect, useMemo, useState } from "react";

import { CashewExcludeToggle } from "@/components/importer-forms";
import type { CashewTransaction } from "@/lib/db";
import { formatCurrency, formatCurrencyByCode } from "@/lib/format";
import { getTranslations } from "@/lib/translations";

type ReviewBucket = "expenses" | "fixed" | "travel" | "extra" | "oneOff" | "ignore";

type CategorySettings = {
  bucket: ReviewBucket;
  included: boolean;
};

type CategoryRow = {
  key: string;
  label: string;
  month: string;
  amount: number;
  count: number;
  bucket: ReviewBucket;
  included: boolean;
  hasConverted: boolean;
};

function guessBucket(category: string, subcategory: string, type: string): ReviewBucket {
  const text = `${category} ${subcategory} ${type}`.toLowerCase();

  if (text.includes("abbon")) return "fixed";
  if (text.includes("trasport") || text.includes("parcheggio") || text.includes("ricarica")) return "travel";
  if (text.includes("tasse") || text.includes("salute") || text.includes("psicolog")) return "oneOff";

  return "expenses";
}

export function ReviewAssistant({ transactions }: { transactions: CashewTransaction[] }) {
  const t = getTranslations();
  const months = useMemo(
    () =>
      [...new Set(transactions.filter((tx) => !tx.income && tx.amount < 0).map((tx) => tx.transactionDate.slice(0, 7)))].sort((a, b) =>
        b.localeCompare(a)
      ),
    [transactions]
  );
  const [selectedMonth, setSelectedMonth] = useState(months[0] ?? "");
  const effectiveSelectedMonth = months.includes(selectedMonth) ? selectedMonth : (months[0] ?? "");
  const [categorySettings, setCategorySettings] = useState<Record<string, CategorySettings>>({});
  const [conversionMap, setConversionMap] = useState<Record<string, number>>({});
  const [conversionError, setConversionError] = useState("");
  const [converting, setConverting] = useState(false);

  const visibleTransactions = useMemo(
    () =>
      transactions
        .filter((tx) => tx.transactionDate.slice(0, 7) === effectiveSelectedMonth && tx.amount < 0 && !tx.income)
        .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate) || b.id - a.id),
    [effectiveSelectedMonth, transactions]
  );

  useEffect(() => {
    const foreignRows = visibleTransactions.filter((tx) => !tx.excluded && tx.reportCurrency === "foreign");
    if (!foreignRows.length) {
      return;
    }

    const uniqueRequests = [...new Set(foreignRows.map((tx) => `${tx.transactionDate.slice(0, 10)}|${tx.currency}|${Math.abs(tx.amount)}`))];
    let cancelled = false;

    async function loadConversions() {
      setConverting(true);
      setConversionError("");

      try {
        const entries = await Promise.all(
          uniqueRequests.map(async (key) => {
            const [date, currency, amount] = key.split("|");
            const response = await fetch(
              `/api/fx/convert?date=${encodeURIComponent(date)}&from=${encodeURIComponent(currency)}&amount=${encodeURIComponent(amount)}`
            );

            if (!response.ok) {
              throw new Error("FX conversion failed");
            }

            const data = (await response.json()) as { convertedAmount: number };
            return [key, data.convertedAmount] as const;
          })
        );

        if (!cancelled) {
          setConversionMap(Object.fromEntries(entries));
        }
      } catch {
        if (!cancelled) {
          setConversionError(t.reviewBuilder.fxError);
        }
      } finally {
        if (!cancelled) {
          setConverting(false);
        }
      }
    }

    void loadConversions();

    return () => {
      cancelled = true;
    };
  }, [t.reviewBuilder.fxError, visibleTransactions]);

  const categoryRows = useMemo(() => {
    const grouped = new Map<string, CategoryRow>();

    for (const tx of visibleTransactions) {
      const label = tx.subcategoryName || tx.categoryName || t.reviewBuilder.uncategorized;
      const key = `${effectiveSelectedMonth}::${label}`;
      const convertedAmount =
        tx.reportCurrency === "CHF"
          ? Math.abs(tx.amount)
          : conversionMap[`${tx.transactionDate.slice(0, 10)}|${tx.currency}|${Math.abs(tx.amount)}`] ?? 0;

      if (!grouped.has(key)) {
        const defaults = categorySettings[key] ?? {
          bucket: guessBucket(tx.categoryName, tx.subcategoryName, tx.transactionType),
          included: true
        };

        grouped.set(key, {
          key,
          label,
          month: effectiveSelectedMonth,
          amount: 0,
          count: 0,
          bucket: defaults.bucket,
          included: defaults.included,
          hasConverted: false
        });
      }

      const current = grouped.get(key)!;
      if (!tx.excluded) {
        current.amount += convertedAmount;
      }
      current.count += 1;
      if (tx.reportCurrency === "foreign") {
        current.hasConverted = true;
      }
    }

    return [...grouped.values()].sort((a, b) => b.amount - a.amount);
  }, [categorySettings, conversionMap, effectiveSelectedMonth, t.reviewBuilder.uncategorized, visibleTransactions]);

  const totals = categoryRows.reduce(
    (acc, row) => {
      if (!row.included || row.bucket === "ignore") return acc;
      if (row.bucket === "expenses") acc.expenses += row.amount;
      if (row.bucket === "fixed") acc.fixed += row.amount;
      if (row.bucket === "travel") acc.travel += row.amount;
      if (row.bucket === "extra") acc.extra += row.amount;
      if (row.bucket === "oneOff") acc.oneOff += row.amount;
      return acc;
    },
    { expenses: 0, fixed: 0, travel: 0, extra: 0, oneOff: 0 }
  );

  const availablePeriods = months.join(", ") || t.common.empty;

  function updateSettings(key: string, patch: Partial<CategorySettings>) {
    setCategorySettings((current) => {
      const existing = current[key] ?? { bucket: "expenses" as ReviewBucket, included: true };
      return { ...current, [key]: { ...existing, ...patch } };
    });
  }

  return (
    <section className="panel">
      <div className="section-header">
        <span>{t.reviewBuilder.eyebrow}</span>
        <h2>{t.reviewBuilder.title}</h2>
        <p>{t.reviewBuilder.description}</p>
        <p>{t.reviewBuilder.availablePeriodsText(availablePeriods)}</p>
        {conversionError ? <p>{conversionError}</p> : null}
      </div>

      <div className="mini-stats review-builder-stats">
        <div>
          <span>{t.reviewBuilder.selectedMonth}</span>
          <strong>{effectiveSelectedMonth || t.common.empty}</strong>
        </div>
        <div>
          <span>{t.forms.expenses}</span>
          <strong>{formatCurrency(totals.expenses)}</strong>
        </div>
        <div>
          <span>{t.reviewBuilder.fixed}</span>
          <strong>{formatCurrency(totals.fixed)}</strong>
        </div>
        <div>
          <span>{t.forms.travel}</span>
          <strong>{formatCurrency(totals.travel)}</strong>
        </div>
        <div>
          <span>{t.forms.extra}</span>
          <strong>{formatCurrency(totals.extra)}</strong>
        </div>
        <div>
          <span>{t.forms.oneOffExpenses}</span>
          <strong>{formatCurrency(totals.oneOff)}</strong>
        </div>
      </div>

      <div className="entry-form compact-form">
        <div className="form-grid">
          <label className="field">
            <span>{t.reviewBuilder.month}</span>
            <div className="select-shell">
              <select className="select-input" value={effectiveSelectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>
      </div>

      <details className="collapsible-panel" open>
        <summary className="collapsible-summary">
          <div>
            <strong>{t.reviewBuilder.assignmentTitle(effectiveSelectedMonth || t.reviewBuilder.selectedMonthFallback)}</strong>
            <span>{t.reviewBuilder.assignmentDescription}</span>
          </div>
        </summary>
        <div className="collapsible-content">
          {converting ? <p className="helper-note">{t.reviewBuilder.converting}</p> : null}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t.reviewBuilder.use}</th>
                  <th>{t.forms.category}</th>
                  <th>{t.reviewBuilder.transactions}</th>
                  <th>{t.forms.amount}</th>
                  <th>{t.reviewBuilder.reviewBucket}</th>
                </tr>
              </thead>
              <tbody>
                {categoryRows.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <label className="checkbox-shell" aria-label={t.reviewBuilder.toggleCategory(row.label)}>
                        <input
                          className="checkbox-input"
                          type="checkbox"
                          checked={row.included}
                          onChange={(event) => updateSettings(row.key, { included: event.target.checked })}
                        />
                        <span className="checkbox-ui" />
                      </label>
                    </td>
                    <td>
                      <div className="category-cell">
                        <span>{row.label}</span>
                        {row.hasConverted ? <span className="fx-badge">{t.reviewBuilder.includesFx}</span> : null}
                      </div>
                    </td>
                    <td>{row.count}</td>
                    <td>{formatCurrency(row.amount)}</td>
                    <td>
                      <div className="select-shell table-select">
                        <select
                          className="select-input"
                          value={row.bucket}
                          onChange={(event) => updateSettings(row.key, { bucket: event.target.value as ReviewBucket })}
                        >
                          <option value="expenses">{t.reviewBuilder.bucketExpenses}</option>
                          <option value="fixed">{t.reviewBuilder.bucketFixed}</option>
                          <option value="travel">{t.reviewBuilder.bucketTravel}</option>
                          <option value="extra">{t.reviewBuilder.bucketExtra}</option>
                          <option value="oneOff">{t.reviewBuilder.bucketOneOff}</option>
                          <option value="ignore">{t.reviewBuilder.bucketIgnore}</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>

      <details className="collapsible-panel month-ledger-panel" open>
        <summary className="collapsible-summary">
          <div>
            <strong>{t.reviewBuilder.transactionsTitle(effectiveSelectedMonth || t.reviewBuilder.selectedMonthFallback)}</strong>
            <span>{t.reviewBuilder.transactionsDescription}</span>
          </div>
        </summary>
        <div className="collapsible-content">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t.forms.date}</th>
                  <th>{t.forms.name}</th>
                  <th>{t.forms.category}</th>
                  <th>{t.forms.amount}</th>
                  <th>{t.reviewBuilder.status}</th>
                  <th>{t.reviewBuilder.action}</th>
                </tr>
              </thead>
              <tbody>
                {visibleTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.transactionDate.slice(0, 10)}</td>
                    <td>
                      <div>{tx.title}</div>
                      {tx.note ? <small>{tx.note}</small> : null}
                      {tx.reportCurrency === "foreign" ? <small>{t.reviewBuilder.convertedToChf}</small> : null}
                    </td>
                    <td>{tx.subcategoryName || tx.categoryName || t.common.empty}</td>
                    <td>{formatCurrencyByCode(Math.abs(tx.amount), tx.currency)}</td>
                    <td>{tx.excluded ? t.reviewBuilder.excluded : t.reviewBuilder.included}</td>
                    <td>
                      <CashewExcludeToggle id={tx.id} excluded={tx.excluded} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </section>
  );
}
