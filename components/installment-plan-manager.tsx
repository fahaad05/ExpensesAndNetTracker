import { editInstallmentPlan, markInstallmentAsPaid, removeInstallmentPlan } from "@/app/actions";
import type { InstallmentPlan } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

function addMonths(dateStr: string, months: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const targetYear = y + Math.floor((m - 1 + months) / 12);
  const targetMonth = ((m - 1 + months) % 12 + 12) % 12 + 1;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
  const day = Math.min(d, lastDay);
  return `${String(targetYear).padStart(4, "0")}-${String(targetMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function InstallmentPlanManager({ plans }: { plans: InstallmentPlan[] }) {
  if (plans.length === 0) {
    return (
      <p style={{ color: "var(--muted)", fontSize: "0.92rem", margin: "16px 0 0" }}>
        No installment plans yet. Add a leasing, loan, or financing schedule above.
      </p>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="installment-plan-list">
      {plans.map((plan) => {
        const isCompleted = plan.paidInstallments >= plan.totalInstallments;
        const progress =
          plan.totalInstallments > 0
            ? Math.round((plan.paidInstallments / plan.totalInstallments) * 100)
            : 100;
        const remaining = Math.max(
          0,
          plan.totalAmount - plan.paidInstallments * plan.installmentAmount
        );
        const endDate = addMonths(plan.startDate, plan.totalInstallments - 1);

        const schedule = Array.from({ length: plan.totalInstallments }, (_, i) => {
          const dueDate = addMonths(plan.startDate, i);
          const isPaid = i < plan.paidInstallments;
          const isOverdue = !isPaid && dueDate < today;
          return { num: i + 1, dueDate, isPaid, isOverdue };
        });

        return (
          <div key={plan.id} className="installment-card">
            <div className="installment-header">
              <div>
                <strong style={{ color: "var(--ink)", fontSize: "1.05rem" }}>{plan.name}</strong>
                {plan.category && (
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      color: "var(--muted)",
                      marginTop: "2px"
                    }}
                  >
                    {plan.category}
                  </span>
                )}
              </div>
              <span
                className={`installment-badge ${
                  isCompleted ? "installment-badge-done" : "installment-badge-active"
                }`}
              >
                {isCompleted
                  ? "Completed"
                  : `${plan.paidInstallments}/${plan.totalInstallments} paid`}
              </span>
            </div>

            <div className="installment-progress-track">
              <div className="installment-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="installment-stats">
              <span>{formatCurrency(plan.installmentAmount)}/month</span>
              <span>Remaining: {formatCurrency(remaining)}</span>
              <span>Ends: {endDate}</span>
            </div>

            {plan.notes && (
              <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--muted)" }}>
                {plan.notes}
              </p>
            )}

            <details className="collapsible-panel">
              <summary className="collapsible-summary">
                <div>
                  <strong>Payment schedule</strong>
                  <span>
                    {plan.totalInstallments} installments · total{" "}
                    {formatCurrency(plan.totalAmount)}
                  </span>
                </div>
              </summary>
              <div className="collapsible-content">
                <div className="table-wrap">
                  <table className="manager-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Due date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((row) => (
                        <tr key={row.num} className={row.isPaid ? "schedule-paid" : ""}>
                          <td>{row.num}</td>
                          <td>{row.dueDate}</td>
                          <td>{formatCurrency(plan.installmentAmount)}</td>
                          <td>
                            <span
                              className={
                                row.isPaid
                                  ? "status-paid"
                                  : row.isOverdue
                                  ? "status-overdue"
                                  : "status-upcoming"
                              }
                            >
                              {row.isPaid ? "Paid" : row.isOverdue ? "Overdue" : "Upcoming"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </details>

            <details className="edit-review-panel">
              <summary className="edit-review-summary">Edit plan</summary>
              <form id={`installment-plan-form-${plan.id}`} action={editInstallmentPlan}>
                <input type="hidden" name="id" value={plan.id} />
                <div className="form-grid" style={{ marginTop: "14px" }}>
                  <label className="field">
                    <span>Name</span>
                    <input
                      name="name"
                      defaultValue={plan.name}
                      required
                      className="table-edit-input"
                    />
                  </label>
                  <label className="field">
                    <span>Category</span>
                    <input
                      name="category"
                      defaultValue={plan.category}
                      className="table-edit-input"
                    />
                  </label>
                  <label className="field">
                    <span>Total amount</span>
                    <input
                      name="totalAmount"
                      type="number"
                      step="0.01"
                      defaultValue={plan.totalAmount}
                      required
                      className="table-edit-input table-edit-number"
                    />
                  </label>
                  <label className="field">
                    <span>Monthly rate</span>
                    <input
                      name="installmentAmount"
                      type="number"
                      step="0.01"
                      defaultValue={plan.installmentAmount}
                      required
                      className="table-edit-input table-edit-number"
                    />
                  </label>
                  <label className="field">
                    <span>Total installments</span>
                    <input
                      name="totalInstallments"
                      type="number"
                      step="1"
                      min="1"
                      defaultValue={plan.totalInstallments}
                      required
                      className="table-edit-input table-edit-number"
                    />
                  </label>
                  <label className="field">
                    <span>Already paid</span>
                    <input
                      name="paidInstallments"
                      type="number"
                      step="1"
                      min="0"
                      defaultValue={plan.paidInstallments}
                      required
                      className="table-edit-input table-edit-number"
                    />
                  </label>
                  <label className="field">
                    <span>First payment date</span>
                    <input
                      name="startDate"
                      type="date"
                      defaultValue={plan.startDate}
                      required
                      className="table-edit-input table-edit-date"
                    />
                  </label>
                  <label className="field field-full">
                    <span>Notes</span>
                    <input
                      name="notes"
                      defaultValue={plan.notes}
                      className="table-edit-input"
                    />
                  </label>
                </div>
                <button type="submit" className="ghost-button" style={{ marginTop: "12px" }}>
                  Save changes
                </button>
              </form>
            </details>

            <div className="installment-actions">
              {!isCompleted && (
                <form action={markInstallmentAsPaid}>
                  <input type="hidden" name="id" value={plan.id} />
                  <button type="submit" className="ghost-button">
                    Mark next as paid
                  </button>
                </form>
              )}
              <form action={removeInstallmentPlan}>
                <input type="hidden" name="id" value={plan.id} />
                <button type="submit" className="warn-button">
                  Delete
                </button>
              </form>
            </div>
          </div>
        );
      })}
    </div>
  );
}
