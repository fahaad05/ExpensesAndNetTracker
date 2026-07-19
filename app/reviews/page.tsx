export const dynamic = "force-dynamic";

import Link from "next/link";

import { MonthlyReviewForm, QuarterlyReviewForm } from "@/components/forms";
import { MonthlyReviewEditor, QuarterlyReviewEditor } from "@/components/review-manager";
import { getDashboardData } from "@/lib/db";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getMonthlyInsights, getQuarterlyInsights } from "@/lib/insights";
import { getTranslations } from "@/lib/translations";

function groupByYear<T extends { reviewDate: string }>(items: T[]) {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const year = item.reviewDate.slice(0, 4);
    if (!grouped.has(year)) {
      grouped.set(year, []);
    }
    grouped.get(year)!.push(item);
  }

  return [...grouped.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

function getPreviousByDate<T extends { id: number; reviewDate: string }>(items: T[], current: T) {
  const previousItems = items.filter((item) => item.id !== current.id && item.reviewDate < current.reviewDate);
  return previousItems.at(-1);
}

export default function ReviewsArchivePage() {
  const t = getTranslations();
  const data = getDashboardData();
  const monthlyByYear = groupByYear([...data.monthlyReviews].reverse());
  const quarterlyByYear = groupByYear([...data.quarterlyReviews].reverse());

  return (
    <main className="page-shell">
      <section className="panel">
        <div className="section-header">
          <span>{t.reviews.archive}</span>
          <h2>{t.reviews.archiveTitle}</h2>
          <p>{t.reviews.archiveDescription}</p>
        </div>
        <div className="archive-link-row">
          <Link href="/">{t.common.backToDashboard}</Link>
        </div>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="section-header">
            <span>{t.reviews.newReview}</span>
            <h2>{t.reviews.monthlyEntryTitle}</h2>
            <p>{t.reviews.monthlyEntryDescription}</p>
          </div>
          <MonthlyReviewForm />
        </article>

        <article className="panel">
          <div className="section-header">
            <span>{t.reviews.newReview}</span>
            <h2>{t.reviews.quarterlyEntryTitle}</h2>
            <p>{t.reviews.quarterlyEntryDescription}</p>
          </div>
          <QuarterlyReviewForm />
        </article>
      </section>

      {monthlyByYear.map(([year, monthlyReviews]) => {
        const yearlyQuarterly = quarterlyByYear.find(([quarterYear]) => quarterYear === year)?.[1] ?? [];
        const isLatestYear = year === monthlyByYear[0]?.[0];

        return (
          <details key={year} className="panel archive-year-card" open={isLatestYear}>
            <summary className="archive-year-summary">
              <div className="section-header archive-year-header">
                <span>{t.reviews.year(year)}</span>
                <h2>{t.reviews.yearReviews(year)}</h2>
                <p>{t.reviews.yearDescription}</p>
              </div>
            </summary>

            <div className="archive-year-content">
              <div className="content-grid">
                <article className="panel nested-panel">
                  <h3>{t.reviews.monthlyReviews}</h3>
                  <div className="review-list">
                    {monthlyReviews.map((review) => (
                      <div key={review.id} className="review-card">
                        <div className="review-card-top">
                          <h4>{review.reviewDate}</h4>
                          <span>{t.home.margin(formatCurrency(review.income - review.expenses - review.investments))}</span>
                        </div>
                        <p>{t.home.incomeExpensesInvestments(formatCurrency(review.income), formatCurrency(review.expenses), formatCurrency(review.investments))}</p>
                        <p>{t.home.rates(formatPercent(review.expenseRate), formatPercent(review.investmentRate), formatPercent(review.extraRate))}</p>
                        <p>{t.home.fixedTravelOneOff(formatCurrency(review.fixedExpenses), formatPercent(review.fixedExpenseRate), formatCurrency(review.travel), formatCurrency(review.oneOffExpenses))}</p>
                        {review.notes ? <p><strong>{t.common.notes}:</strong> {review.notes}</p> : null}
                        {review.wins ? <p><strong>{t.common.good}:</strong> {review.wins}</p> : null}
                        {review.challenges ? <p><strong>{t.common.bad}:</strong> {review.challenges}</p> : null}
                        {review.actions ? <p><strong>{t.common.actions}:</strong> {review.actions}</p> : null}
                        {(() => {
                          const previous = getPreviousByDate(data.monthlyReviews, review);
                          const insights = getMonthlyInsights(review, previous);
                          return insights.length ? (
                            <div className="insight-block">
                              <strong>{t.common.insights}</strong>
                              <ul className="insight-list">
                                {insights.map((insight) => (
                                  <li key={insight}>{insight}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null;
                        })()}
                        <MonthlyReviewEditor review={review} />
                      </div>
                    ))}
                  </div>
                </article>

                <article className="panel nested-panel">
                  <h3>{t.reviews.quarterlyReviews}</h3>
                  <div className="review-list">
                    {yearlyQuarterly.length ? (
                      yearlyQuarterly.map((review) => (
                        <div key={review.id} className="review-card">
                          <div className="review-card-top">
                            <h4>{review.quarter}</h4>
                            <span>{formatCurrency(review.netWorth)} net worth</span>
                          </div>
                          <p>{t.home.reviewDateTotalActive(review.reviewDate, formatCurrency(review.totalActive))}</p>
                          <p>{t.home.mainEmergencyInvestmentsCrypto(formatCurrency(review.mainAccount), formatCurrency(review.emergencyFund), formatCurrency(review.investmentsValue), formatCurrency(review.crypto))}</p>
                          <p><strong>{t.home.debts(formatCurrency(review.debts))}</strong></p>
                          {review.notes ? <p><strong>{t.common.notes}:</strong> {review.notes}</p> : null}
                          {review.wins ? <p><strong>{t.common.good}:</strong> {review.wins}</p> : null}
                          {review.challenges ? <p><strong>{t.common.bad}:</strong> {review.challenges}</p> : null}
                          {review.actions ? <p><strong>{t.common.actions}:</strong> {review.actions}</p> : null}
                          {(() => {
                            const previous = getPreviousByDate(data.quarterlyReviews, review);
                            const insights = getQuarterlyInsights(review, previous);
                            return insights.length ? (
                              <div className="insight-block">
                                <strong>{t.common.insights}</strong>
                                <ul className="insight-list">
                                  {insights.map((insight) => (
                                    <li key={insight}>{insight}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null;
                          })()}
                          <QuarterlyReviewEditor review={review} />
                        </div>
                      ))
                    ) : (
                      <div className="review-card">
                        <p>{t.reviews.noQuarterlyForYear(year)}</p>
                      </div>
                    )}
                  </div>
                </article>
              </div>
            </div>
          </details>
        );
      })}
    </main>
  );
}
