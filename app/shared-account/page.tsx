export const dynamic = "force-dynamic";

import Link from "next/link";

import { SharedTransactionForm } from "@/components/forms";
import { SharedAccountImportForm } from "@/components/shared-account-import-form";
import { SharedAccountLedger } from "@/components/shared-account-ledger";
import { getDashboardData } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { getTranslations } from "@/lib/translations";

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

export default function SharedAccountPage() {
  const t = getTranslations();
  const data = getDashboardData();

  return (
    <main className="page-shell">
      <section className="panel shared-panel">
        <SectionHeader
          eyebrow={t.sharedAccount.eyebrow}
          title={t.sharedAccount.title}
          description={t.sharedAccount.description}
        />
        <div className="archive-link-row">
          <Link href="/">{t.common.backToDashboard}</Link>
        </div>
        <div className="mini-stats">
          <div>
            <span>{t.sharedAccount.totalTracked}</span>
            <strong>{formatCurrency(data.sharedAccountSummary.total)}</strong>
          </div>
          <div>
            <span>{t.sharedAccount.yourUsage}</span>
            <strong>{formatCurrency(data.sharedAccountSummary.myUsage)}</strong>
          </div>
          <div>
            <span>{t.sharedAccount.otherPersonUsage}</span>
            <strong>{formatCurrency(data.sharedAccountSummary.otherUsage)}</strong>
          </div>
          <div>
            <span>{t.sharedAccount.export}</span>
            <strong>
              <Link href="/api/export/shared-account-csv">{t.sharedAccount.downloadCsv}</Link>
            </strong>
          </div>
        </div>
        <SharedTransactionForm />
        <SharedAccountImportForm />
      </section>

      <section className="panel">
        <SectionHeader
          eyebrow="Ledger"
          title="Analyze and edit shared-account transactions"
          description="Filter by person, switch grouped views, and adjust or delete entries directly in the ledger."
        />
        <SharedAccountLedger transactions={data.sharedTransactions} />
      </section>
    </main>
  );
}
