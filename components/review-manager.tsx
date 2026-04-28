import {
  editMonthlyReview,
  editQuarterlyReview,
  removeMonthlyReview,
  removeQuarterlyReview
} from "@/app/actions";
import type { MonthlyReview, QuarterlyReview } from "@/lib/db";
import { getTranslations } from "@/lib/translations";

export function MonthlyReviewEditor({ review }: { review: MonthlyReview }) {
  const t = getTranslations();
  return (
    <details className="edit-review-panel">
      <summary className="edit-review-summary">{t.reviews.editReview}</summary>
      <form action={editMonthlyReview} className="entry-form compact-form">
        <input type="hidden" name="id" value={review.id} />
        <div className="form-grid">
          <label className="field"><span>{t.forms.reviewDate}</span><input name="reviewDate" type="date" defaultValue={review.reviewDate} required /></label>
          <label className="field"><span>{t.forms.income}</span><input name="income" type="number" defaultValue={review.income} required /></label>
          <label className="field"><span>{t.forms.expenses}</span><input name="expenses" type="number" defaultValue={review.expenses} required /></label>
          <label className="field"><span>{t.forms.investments}</span><input name="investments" type="number" defaultValue={review.investments} required /></label>
          <label className="field"><span>{t.forms.extra}</span><input name="extra" type="number" defaultValue={review.extra} required /></label>
          <label className="field"><span>{t.forms.fixedExpenses}</span><input name="fixedExpenses" type="number" defaultValue={review.fixedExpenses} required /></label>
          <label className="field"><span>{t.forms.travel}</span><input name="travel" type="number" defaultValue={review.travel} required /></label>
          <label className="field"><span>{t.forms.oneOffExpenses}</span><input name="oneOffExpenses" type="number" defaultValue={review.oneOffExpenses} required /></label>
          <label className="field field-full"><span>{t.common.notes}</span><textarea name="notes" rows={3} defaultValue={review.notes} /></label>
          <label className="field field-full"><span>{t.forms.wins}</span><textarea name="wins" rows={3} defaultValue={review.wins} /></label>
          <label className="field field-full"><span>{t.forms.challenges}</span><textarea name="challenges" rows={3} defaultValue={review.challenges} /></label>
          <label className="field field-full"><span>{t.forms.implementableActions}</span><textarea name="actions" rows={3} defaultValue={review.actions} /></label>
        </div>
        <button type="submit">{t.reviews.saveChanges}</button>
      </form>
      <form action={removeMonthlyReview} className="inline-actions">
        <input type="hidden" name="id" value={review.id} />
        <button type="submit" className="warn-button">{t.reviews.deleteReview}</button>
      </form>
    </details>
  );
}

export function QuarterlyReviewEditor({ review }: { review: QuarterlyReview }) {
  const t = getTranslations();
  return (
    <details className="edit-review-panel">
      <summary className="edit-review-summary">{t.reviews.editReview}</summary>
      <form action={editQuarterlyReview} className="entry-form compact-form">
        <input type="hidden" name="id" value={review.id} />
        <div className="form-grid">
          <label className="field"><span>{t.forms.reviewDate}</span><input name="reviewDate" type="date" defaultValue={review.reviewDate} required /></label>
          <label className="field"><span>{t.forms.mainAccount}</span><input name="mainAccount" type="number" defaultValue={review.mainAccount} required /></label>
          <label className="field"><span>{t.forms.emergencyFund}</span><input name="emergencyFund" type="number" defaultValue={review.emergencyFund} required /></label>
          <label className="field"><span>{t.forms.investments}</span><input name="investmentsValue" type="number" defaultValue={review.investmentsValue} required /></label>
          <label className="field"><span>{t.forms.crypto}</span><input name="crypto" type="number" defaultValue={review.crypto} required /></label>
          <label className="field"><span>{t.forms.debts}</span><input name="debts" type="number" defaultValue={review.debts} required /></label>
          <label className="field field-full"><span>{t.common.notes}</span><textarea name="notes" rows={3} defaultValue={review.notes} /></label>
          <label className="field field-full"><span>{t.forms.wins}</span><textarea name="wins" rows={3} defaultValue={review.wins} /></label>
          <label className="field field-full"><span>{t.forms.challenges}</span><textarea name="challenges" rows={3} defaultValue={review.challenges} /></label>
          <label className="field field-full"><span>{t.forms.implementableActions}</span><textarea name="actions" rows={3} defaultValue={review.actions} /></label>
        </div>
        <button type="submit">{t.reviews.saveChanges}</button>
      </form>
      <form action={removeQuarterlyReview} className="inline-actions">
        <input type="hidden" name="id" value={review.id} />
        <button type="submit" className="warn-button">{t.reviews.deleteReview}</button>
      </form>
    </details>
  );
}
