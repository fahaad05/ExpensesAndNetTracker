import { editInvestment, removeInvestment } from "@/app/actions";
import type { Investment } from "@/lib/db";
import { getTranslations } from "@/lib/translations";

export function InvestmentManager({ investments }: { investments: Investment[] }) {
  const t = getTranslations();
  return (
    <div className="table-wrap">
      <table className="manager-table">
        <colgroup>
          <col className="col-name" />
          <col className="col-account" />
          <col className="col-invested" />
          <col className="col-value" />
          <col className="col-date" />
          <col className="col-actions" />
        </colgroup>
        <thead>
          <tr>
            <th>{t.managerTables.name}</th>
            <th>{t.managerTables.account}</th>
            <th>{t.managerTables.invested}</th>
            <th>{t.managerTables.value}</th>
            <th>{t.managerTables.asOf}</th>
            <th>{t.managerTables.actions}</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((investment) => (
            <tr key={investment.id}>
              <td>
                <input form={`investment-form-${investment.id}`} name="name" defaultValue={investment.name} required className="table-edit-input" />
              </td>
              <td>
                <input form={`investment-form-${investment.id}`} name="account" defaultValue={investment.account} required className="table-edit-input" />
              </td>
              <td>
                <input
                  form={`investment-form-${investment.id}`}
                  name="investedAmount"
                  type="number"
                  step="0.01"
                  defaultValue={investment.investedAmount}
                  required
                  className="table-edit-input table-edit-number"
                />
              </td>
              <td>
                <input
                  form={`investment-form-${investment.id}`}
                  name="currentValue"
                  type="number"
                  step="0.01"
                  defaultValue={investment.currentValue}
                  required
                  className="table-edit-input table-edit-number"
                />
              </td>
              <td>
                <input
                  form={`investment-form-${investment.id}`}
                  name="asOfDate"
                  type="date"
                  defaultValue={investment.asOfDate}
                  required
                  className="table-edit-input table-edit-date"
                />
              </td>
              <td className="actions-cell">
                <div className="table-actions">
                  <form id={`investment-form-${investment.id}`} action={editInvestment}>
                    <input type="hidden" name="id" value={investment.id} />
                    <button type="submit" className="ghost-button">
                      {t.common.save}
                    </button>
                  </form>
                  <form action={removeInvestment}>
                    <input type="hidden" name="id" value={investment.id} />
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
