import { editSharedTransaction, removeSharedTransaction } from "@/app/actions";
import type { SharedTransaction } from "@/lib/db";
import { getTranslations } from "@/lib/translations";

function formatUsedByLabel(usedBy: SharedTransaction["usedBy"], t: ReturnType<typeof getTranslations>) {
  if (usedBy === "me") return t.forms.me;
  if (usedBy === "other") return t.forms.otherPerson;
  return t.forms.shared5050;
}

export function SharedAccountManager({
  transactions,
  showUsedBy = true
}: {
  transactions: SharedTransaction[];
  showUsedBy?: boolean;
}) {
  const t = getTranslations();

  return (
    <div className="table-wrap">
      <table className="manager-table">
        <colgroup>
          <col className="col-date" />
          <col className="col-name" />
          {showUsedBy ? <col className="col-cadence" /> : null}
          <col className="col-amount" />
          <col className="col-name" />
          <col className="col-actions" />
        </colgroup>
        <thead>
          <tr>
            <th>{t.forms.date}</th>
            <th>{t.forms.description}</th>
            {showUsedBy ? <th>{t.sharedAccount.usedBy}</th> : null}
            <th>{t.forms.amount}</th>
            <th>{t.common.notes}</th>
            <th>{t.managerTables.actions}</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <input form={`shared-tx-form-${tx.id}`} type="hidden" name="category" value={tx.category} />
              <td>
                <input form={`shared-tx-form-${tx.id}`} name="transactionDate" type="date" defaultValue={tx.transactionDate} required className="table-edit-input table-edit-date" />
              </td>
              <td>
                <input form={`shared-tx-form-${tx.id}`} name="description" defaultValue={tx.description} required className="table-edit-input" />
              </td>
              {showUsedBy ? (
                <td>
                  <select form={`shared-tx-form-${tx.id}`} name="usedBy" defaultValue={tx.usedBy} className="table-edit-input table-edit-select">
                    <option value="me">{formatUsedByLabel("me", t)}</option>
                    <option value="other">{formatUsedByLabel("other", t)}</option>
                    <option value="shared">{formatUsedByLabel("shared", t)}</option>
                  </select>
                </td>
              ) : (
                <input form={`shared-tx-form-${tx.id}`} type="hidden" name="usedBy" value={tx.usedBy} />
              )}
              <td>
                <input form={`shared-tx-form-${tx.id}`} name="amount" type="number" step="0.01" defaultValue={tx.amount} required className="table-edit-input table-edit-number" />
              </td>
              <td>
                <input form={`shared-tx-form-${tx.id}`} name="notes" defaultValue={tx.notes} className="table-edit-input" />
              </td>
              <td className="actions-cell">
                <div className="table-actions">
                  <form id={`shared-tx-form-${tx.id}`} action={editSharedTransaction}>
                    <input type="hidden" name="id" value={tx.id} />
                    <button type="submit" className="ghost-button">
                      {t.common.save}
                    </button>
                  </form>
                  <form action={removeSharedTransaction}>
                    <input type="hidden" name="id" value={tx.id} />
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
