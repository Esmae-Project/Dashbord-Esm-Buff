import type {
  Project,
  Contractor,
  Transaction,
  PersonalAccount,
  PersonalExpense,
} from "../hooks/useDashboardData";

interface Props {
  contractors: Contractor[];
  transactions: Transaction[];
  projects: Project[];
  personalAccounts: PersonalAccount[];
  personalExpenses: PersonalExpense[];
  money: (n: number) => string;
}

export default function AccountingView({
  contractors,
  transactions,
  personalAccounts,
  personalExpenses,
  money,
}: Props) {
  return (
    <>
      <div className="toolbar">
        <button className="btn">＋ کار انجام‌شده</button>
        <button className="btn green">＋ پرداخت</button>
      </div>

      {/* Contractor Accounts */}
      <details className="accordion">
        <summary>
          <span>👷 حساب پیمانکاران</span>
        </summary>
        <div className="accordion-content">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>پیمانکار</th>
                  <th>کار انجام‌شده</th>
                  <th>پرداخت</th>
                  <th>مانده</th>
                </tr>
              </thead>
              <tbody>
                {contractors.map((c) => {
                  const totalWork = transactions
                    .filter(
                      (t) =>
                        t.contractor_id === c.id &&
                        t.type === "work" &&
                        t.status !== "replaced"
                    )
                    .reduce((s, t) => s + (t.amount_rial || 0), 0);
                  const totalPayments = transactions
                    .filter(
                      (t) =>
                        t.contractor_id === c.id && t.type === "payment"
                    )
                    .reduce((s, t) => s + (t.amount_rial || 0), 0);
                  const bal = totalWork - totalPayments;
                  return (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{money(totalWork)}</td>
                      <td className="success">{money(totalPayments)}</td>
                      <td className="danger">
                        <b>{money(bal)}</b>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </details>

      {/* Personal Accounts */}
      <details className="accordion">
        <summary>
          <span>👤 حساب‌های شخصی</span>
        </summary>
        <div className="accordion-content">
          {personalAccounts.length === 0 ? (
            <div className="empty">👤 هنوز حساب شخصی ثبت نشده.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>شخص</th>
                    <th>نوع حساب</th>
                    <th>مبلغ</th>
                    <th>پرداخت‌شده</th>
                    <th>مانده</th>
                    <th>تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {personalAccounts.map((item) => {
                    const amount = item.amount_rial || 0;
                    const paid = item.paid_rial || 0;
                    const remaining = Math.max(amount - paid, 0);
                    const type = (item.account_type || "").toLowerCase();
                    const isDebt =
                      type === "debt" ||
                      type.includes("debt") ||
                      type.includes("owe");
                    const label = isDebt ? "💸 بدهکارم" : "💰 طلبکارم";
                    const cls = isDebt ? "danger" : "success";
                    return (
                      <tr key={item.id}>
                        <td>
                          <b>👤 {item.person_name || "بدون نام"}</b>
                        </td>
                        <td>
                          <span className="pill">{label}</span>
                        </td>
                        <td>{money(amount)}</td>
                        <td>{money(paid)}</td>
                        <td>
                          <b className={cls}>{money(remaining)}</b>
                        </td>
                        <td>{item.account_date || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </details>

      {/* Personal Expenses */}
      <details className="accordion">
        <summary>
          <span>🛍️ هزینه‌های شخصی</span>
        </summary>
        <div className="accordion-content">
          {personalExpenses.length === 0 ? (
            <div className="empty">🛍️ هنوز هزینه شخصی ثبت نشده.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>مورد</th>
                    <th>دسته‌بندی</th>
                    <th>مبلغ</th>
                    <th>تاریخ</th>
                    <th>توضیحات</th>
                  </tr>
                </thead>
                <tbody>
                  {personalExpenses.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <b>🛍️ {item.item_name || "بدون عنوان"}</b>
                      </td>
                      <td>
                        {item.category ? (
                          <span className="pill">{item.category}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <b>{money(item.amount_rial)}</b>
                      </td>
                      <td>{item.expense_date || "-"}</td>
                      <td>{item.description || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </details>
    </>
  );
}
