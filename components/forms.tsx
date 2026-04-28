import {
  saveFixedExpense,
  saveInvestment,
  saveMonthlyReview,
  saveQuarterlyReview,
  saveSharedTransaction
} from "@/app/actions";
import { getTranslations } from "@/lib/translations";

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = true
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} type={type} placeholder={placeholder} required={required} />
    </label>
  );
}

function TextArea({
  label,
  name,
  placeholder,
  required = false
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="field field-full">
      <span>{label}</span>
      <textarea name={name} placeholder={placeholder} rows={3} required={required} />
    </label>
  );
}

export function MonthlyReviewForm() {
  const t = getTranslations();
  return (
    <form action={saveMonthlyReview} className="entry-form">
      <div className="form-grid">
        <Field label={t.forms.reviewDate} name="reviewDate" type="date" />
        <Field label={t.forms.income} name="income" type="number" />
        <Field label={t.forms.expenses} name="expenses" type="number" />
        <Field label={t.forms.investments} name="investments" type="number" />
        <Field label={t.forms.extra} name="extra" type="number" />
        <Field label={t.forms.fixedExpenses} name="fixedExpenses" type="number" />
        <Field label={t.forms.travel} name="travel" type="number" />
        <Field label={t.forms.oneOffExpenses} name="oneOffExpenses" type="number" />
        <TextArea label={t.common.notes} name="notes" placeholder={t.forms.notesMonthlyPlaceholder} />
        <TextArea label={t.forms.wins} name="wins" placeholder={t.forms.optionalReflection} />
        <TextArea label={t.forms.challenges} name="challenges" placeholder={t.forms.optionalReflection} />
        <TextArea label={t.forms.implementableActions} name="actions" placeholder={t.forms.optionalNextActions} />
      </div>
      <button type="submit">{t.forms.saveMonthlyReview}</button>
    </form>
  );
}

export function QuarterlyReviewForm() {
  const t = getTranslations();
  return (
    <form action={saveQuarterlyReview} className="entry-form">
      <div className="form-grid">
        <Field label={t.forms.reviewDate} name="reviewDate" type="date" />
        <Field label={t.forms.mainAccount} name="mainAccount" type="number" />
        <Field label={t.forms.emergencyFund} name="emergencyFund" type="number" />
        <Field label={t.forms.investments} name="investmentsValue" type="number" />
        <Field label={t.forms.crypto} name="crypto" type="number" />
        <Field label={t.forms.debts} name="debts" type="number" />
        <TextArea label={t.common.notes} name="notes" placeholder={t.forms.notesQuarterlyPlaceholder} />
        <TextArea label={t.forms.wins} name="wins" placeholder={t.forms.optionalReflection} />
        <TextArea label={t.forms.challenges} name="challenges" placeholder={t.forms.optionalReflection} />
        <TextArea label={t.forms.implementableActions} name="actions" placeholder={t.forms.optionalNextActions} />
      </div>
      <button type="submit">{t.forms.saveNetReview}</button>
    </form>
  );
}

export function FixedExpenseForm() {
  const t = getTranslations();
  return (
    <form action={saveFixedExpense} className="entry-form compact-form">
      <div className="form-grid">
        <Field label={t.forms.expenseName} name="name" />
        <Field label={t.forms.category} name="category" />
        <Field label={t.forms.amount} name="amount" type="number" />
        <label className="field">
          <span>{t.forms.cadence}</span>
          <select name="cadence" defaultValue="monthly">
            <option value="monthly">{t.forms.monthly}</option>
            <option value="yearly">{t.forms.yearly}</option>
          </select>
        </label>
      </div>
      <button type="submit">{t.forms.addFixedExpense}</button>
    </form>
  );
}

export function InvestmentForm() {
  const t = getTranslations();
  return (
    <form action={saveInvestment} className="entry-form compact-form">
      <div className="form-grid">
        <Field label={t.forms.name} name="name" />
        <Field label={t.forms.account} name="account" />
        <Field label={t.forms.newContribution} name="investedDelta" type="number" />
        <Field label={t.forms.currentTotalValue} name="currentValue" type="number" />
        <Field label={t.forms.asOfDate} name="asOfDate" type="date" />
      </div>
      <button type="submit">{t.forms.addInvestmentSnapshot}</button>
    </form>
  );
}

export function SharedTransactionForm() {
  const t = getTranslations();
  return (
    <form action={saveSharedTransaction} className="entry-form compact-form">
      <input type="hidden" name="category" value="General" />
      <div className="form-grid">
        <Field label={t.forms.date} name="transactionDate" type="date" />
        <Field label={t.forms.description} name="description" />
        <Field label={t.forms.amount} name="amount" type="number" />
        <label className="field">
          <span>{t.forms.usedBy}</span>
          <select name="usedBy" defaultValue="shared">
            <option value="me">{t.forms.me}</option>
            <option value="other">{t.forms.otherPerson}</option>
            <option value="shared">{t.forms.shared5050}</option>
          </select>
        </label>
        <label className="field field-full">
          <span>{t.common.notes}</span>
          <input name="notes" placeholder={t.forms.optionalContext} />
        </label>
      </div>
      <button type="submit">{t.forms.addSharedTransaction}</button>
    </form>
  );
}
