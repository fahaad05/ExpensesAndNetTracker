import { editFixedExpense, removeFixedExpense } from "@/app/actions";
import type { FixedExpense } from "@/lib/db";
import { getTranslations } from "@/lib/translations";

export function FixedExpenseManager({ expenses }: { expenses: FixedExpense[] }) {
  const t = getTranslations();
  return (
    <div className="table-wrap">
      <table className="manager-table">
        <colgroup>
          <col className="col-name" />
          <col className="col-category" />
          <col className="col-cadence" />
          <col className="col-amount" />
          <col className="col-actions" />
        </colgroup>
        <thead>
          <tr>
            <th>{t.managerTables.name}</th>
            <th>{t.managerTables.category}</th>
            <th>{t.managerTables.cadence}</th>
            <th>{t.managerTables.amount}</th>
            <th>{t.managerTables.actions}</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>
                <input form={`fixed-expense-form-${expense.id}`} name="name" defaultValue={expense.name} required className="table-edit-input" />
              </td>
              <td>
                <input form={`fixed-expense-form-${expense.id}`} name="category" defaultValue={expense.category} required className="table-edit-input" />
              </td>
              <td>
                <select form={`fixed-expense-form-${expense.id}`} name="cadence" defaultValue={expense.cadence} className="table-edit-input table-edit-select">
                  <option value="monthly">{t.forms.monthly}</option>
                  <option value="yearly">{t.forms.yearly}</option>
                </select>
              </td>
              <td>
                <input
                  form={`fixed-expense-form-${expense.id}`}
                  name="amount"
                  type="number"
                  step="0.01"
                  defaultValue={expense.amount}
                  required
                  className="table-edit-input table-edit-number"
                />
              </td>
              <td className="actions-cell">
                <div className="table-actions">
                  <form id={`fixed-expense-form-${expense.id}`} action={editFixedExpense}>
                    <input type="hidden" name="id" value={expense.id} />
                    <button type="submit" className="ghost-button">
                      {t.common.save}
                    </button>
                  </form>
                  <form action={removeFixedExpense}>
                    <input type="hidden" name="id" value={expense.id} />
                    <button type="submit" className="warn-button">
                      {t.common.delete}
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
