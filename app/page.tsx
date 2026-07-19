export const dynamic = "force-dynamic";

import { ArrowUpRight, ChartColumn, HandCoins, Landmark, PiggyBank } from "lucide-react";
import Link from "next/link";

import { NetWorthTrendChart, SavingsTrendChart } from "@/components/dashboard-charts";
import { FixedExpenseManager } from "@/components/fixed-expense-manager";
import { InvestmentManager } from "@/components/investment-manager";
import { FixedExpenseForm, InvestmentForm } from "@/components/forms";
import { getDashboardData } from "@/lib/db";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getMonthlyInsights, getQuarterlyInsights } from "@/lib/insights";
import { getTranslations } from "@/lib/translations";

function StatCard({
  title,
  value,
  detail,
  icon
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span>{title}</span>
        {icon}
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="section-header">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function getPreviousByDate<T extends { id: number; reviewDate: string }>(items: T[], current: T) {
  const previousItems = items.filter((item) => item.id !== current.id && item.reviewDate < current.reviewDate);
  return previousItems.at(-1);
}

export default function HomePage() {
  const t = getTranslations();
  const data = getDashboardData();
  const latestMonthly = data.monthlyReviews.at(-1);
  const latestQuarterly = data.quarterlyReviews.at(-1);
  const recentMonthlyReviews = data.monthlyReviews.slice(-4).reverse();
  const recentQuarterlyReviews = data.quarterlyReviews.slice(-4).reverse();
  const monthlyTrendYear = latestMonthly?.reviewDate.slice(0, 4);
  const quarterlyTrendYear = latestQuarterly?.reviewDate.slice(0, 4);
  const monthlyTrendData = monthlyTrendYear
    ? data.monthlyReviews
        .filter((review) => review.reviewDate.startsWith(monthlyTrendYear))
        .map((review) => ({
          label: review.month,
          amount: review.income - review.expenses - review.investments
        }))
    : data.monthlyTrend;
  const quarterlyTrendData = quarterlyTrendYear
    ? data.quarterlyReviews
        .filter((review) => review.reviewDate.startsWith(quarterlyTrendYear))
        .map((review) => ({
          label: review.quarter,
          amount: review.netWorth
        }))
    : data.netWorthTrend;

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker">{t.home.heroKicker}</span>
          <h1>{t.home.heroTitle}</h1>
          <p>{t.home.heroDescription}</p>
          <div className="hero-links">
            <a href="#reviews">{t.home.jumpToReviews}</a>
            <Link href="/imports">{t.home.cashewImport}</Link>
            <Link href="/shared-account">{t.home.sharedAccount}</Link>
            <Link href="/api/export/json">
              {t.home.exportJson} <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <h3>{t.home.reviewRitual}</h3>
          <ul>
            <li>{t.home.ritualMonthly}</li>
            <li>{t.home.ritualQuarterly}</li>
            <li>{t.home.ritualShared}</li>
          </ul>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          title={t.home.latestMonthlyMargin}
          value={formatCurrency((latestMonthly?.income ?? 0) - (latestMonthly?.expenses ?? 0) - (latestMonthly?.investments ?? 0))}
          detail={latestMonthly ? t.home.capturedOn(latestMonthly.reviewDate) : t.home.noMonthlyReviewYet}
          icon={<PiggyBank size={18} />}
        />
        <StatCard
          title={t.home.currentNetWorth}
          value={formatCurrency(latestQuarterly?.netWorth ?? 0)}
          detail={latestQuarterly ? t.home.capturedOn(latestQuarterly.reviewDate) : t.home.noQuarterlyReviewYet}
          icon={<Landmark size={18} />}
        />
        <StatCard
          title={t.home.sharedAccountUsage}
          value={formatCurrency(data.sharedAccountSummary.myUsage)}
          detail={t.home.yourUsageVs(formatCurrency(data.sharedAccountSummary.otherUsage))}
          icon={<HandCoins size={18} />}
        />
        <StatCard
          title={t.home.investedCapital}
          value={formatCurrency(data.investmentSummary.totalInvested)}
          detail={t.home.nowWorth(formatCurrency(data.investmentSummary.currentValue))}
          icon={<ChartColumn size={18} />}
        />
      </section>

      <section className="content-grid">
        <article className="panel chart-panel">
          <SectionHeader
            eyebrow={t.home.monthlyTrend}
            title={t.home.monthlyMargin}
            description={t.home.monthlyTrendDescription(monthlyTrendYear ?? "your active year")}
          />
          <SavingsTrendChart data={monthlyTrendData} />
        </article>

        <article className="panel chart-panel warm">
          <SectionHeader
            eyebrow={t.home.quarterlyTrend}
            title={t.home.netWorthProgression}
            description={t.home.quarterlyTrendDescription(quarterlyTrendYear ?? "your active year")}
          />
          <NetWorthTrendChart data={quarterlyTrendData} />
        </article>
      </section>

      <section className="panel">
        <SectionHeader
          eyebrow={t.home.workspaces}
          title={t.home.workspacesTitle}
          description={t.home.workspacesDescription}
        />
        <details className="collapsible-panel">
          <summary className="collapsible-summary">
            <div>
              <strong>{t.home.openSideWorkspaces}</strong>
              <span>{t.home.sideWorkspacesDescription}</span>
            </div>
          </summary>
          <div className="collapsible-content">
            <div className="workspace-grid">
              <Link href="/imports" className="workspace-card">
                <span>{t.home.cashewImport}</span>
                <strong>{t.home.importedRows(data.cashewImportSummary.totalRows)}</strong>
                <p>{t.home.importsWorkspaceDescription}</p>
              </Link>
              <Link href="/shared-account" className="workspace-card">
                <span>{t.home.sharedAccount}</span>
                <strong>{t.home.tracked(formatCurrency(data.sharedAccountSummary.total))}</strong>
                <p>{t.home.sharedWorkspaceDescription}</p>
              </Link>
            </div>
          </div>
        </details>
      </section>

      <section id="reviews" className="stack-section">
        <SectionHeader
          eyebrow={t.home.reviews}
          title={t.home.recentReviewsTitle}
          description={t.home.recentReviewsDescription}
        />
        <div className="archive-link-row">
          <Link href="/reviews">{t.home.openArchive}</Link>
        </div>

        <div className="content-grid">
          <article className="panel">
            <h3>{t.home.monthlyReview}</h3>
            <div className="review-list">
              {recentMonthlyReviews.map((review) => (
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
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <h3>{t.home.quarterlyReview}</h3>
            <div className="review-list">
              {recentQuarterlyReviews.map((review) => (
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
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="panel">
        <SectionHeader
          eyebrow={t.home.fixedCosts}
          title={t.home.fixedCostsTitle}
          description={t.home.fixedCostsDescription}
        />
        <div className="mini-stats">
          <div>
            <span>{t.home.monthlyFixedTotal}</span>
            <strong>{formatCurrency(data.fixedExpenseSummary.monthlyTotal)}</strong>
          </div>
          <div>
            <span>{t.home.yearlyFixedTotal}</span>
            <strong>{formatCurrency(data.fixedExpenseSummary.yearlyTotal)}</strong>
          </div>
        </div>
        <FixedExpenseForm />
        <FixedExpenseManager expenses={data.fixedExpenses} />
      </section>

      <section className="panel">
        <SectionHeader
          eyebrow={t.home.investments}
          title={t.home.investmentsTitle}
          description={t.home.investmentsDescription}
        />
        <div className="mini-stats">
          <div>
            <span>{t.home.totalInvested}</span>
            <strong>{formatCurrency(data.investmentSummary.totalInvested)}</strong>
          </div>
          <div>
            <span>{t.home.gainLoss}</span>
            <strong>{formatCurrency(data.investmentSummary.gainLoss)}</strong>
          </div>
        </div>
        <InvestmentForm />
        <InvestmentManager investments={data.investments} />
      </section>

    </main>
  );
}
