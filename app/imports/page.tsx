import Link from "next/link";

import {
  CashewDeleteAllImportsButton,
  CashewDeleteImportButton,
  CashewImportForm,
  CashewRenameImportForm
} from "@/components/importer-forms";
import { FloatingMonthlyReview } from "@/components/floating-monthly-review";
import { ReviewAssistant } from "@/components/review-assistant";
import { getDashboardData } from "@/lib/db";
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

export default function ImportsPage() {
  const t = getTranslations();
  const data = getDashboardData();
  const months = [...new Set(data.cashewTransactions.filter((tx) => !tx.income && tx.amount < 0).map((tx) => tx.transactionDate.slice(0, 7)))];

  return (
    <main className="page-shell">
      <section className="panel">
        <SectionHeader
          eyebrow={t.imports.eyebrow}
          title={t.imports.title}
          description={t.imports.description}
        />
        <div className="archive-link-row">
          <Link href="/">{t.common.backToDashboard}</Link>
        </div>
        <div className="review-card compact-card">
          <p><strong>{t.imports.availablePeriods}:</strong> {months.join(", ") || t.common.empty}</p>
        </div>
        <CashewImportForm />
      </section>

      <ReviewAssistant transactions={data.cashewTransactions} />

      <section className="panel">
        <SectionHeader
          eyebrow={t.imports.importFilesEyebrow}
          title={t.imports.importFilesTitle}
          description={t.imports.importFilesDescription}
        />
        <div className="inline-actions spaced-actions">
          <CashewDeleteAllImportsButton />
        </div>
        <div className="review-list">
          {data.cashewImports.length ? (
            data.cashewImports.map((file) => (
              <div key={file.sourceFile} className="review-card compact-card">
                <div className="review-card-top">
                  <h4>{file.importLabel}</h4>
                  <span>{t.common.rows(file.rows)}</span>
                </div>
                <p><strong>{t.common.sourceFile}:</strong> {file.sourceFile}</p>
                <p>{t.common.importedAt(file.importedAt)}</p>
                <div className="inline-actions">
                  <CashewRenameImportForm sourceFile={file.sourceFile} importLabel={file.importLabel} />
                  <CashewDeleteImportButton sourceFile={file.sourceFile} />
                </div>
              </div>
            ))
          ) : (
            <div className="review-card compact-card">
              <p>{t.imports.noImportFiles}</p>
            </div>
          )}
        </div>
      </section>
      <FloatingMonthlyReview />
    </main>
  );
}
