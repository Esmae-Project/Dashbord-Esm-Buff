import type { Project, Contractor, Transaction } from "../hooks/useDashboardData";

interface Props {
  contractors: Contractor[];
  transactions: Transaction[];
  projects: Project[];
  money: (n: number) => string;
}

function dateFa(date?: string): string | null {
  if (!date) return null;
  try {
    return new Date(date + "T00:00:00").toLocaleDateString("fa-IR");
  } catch {
    return date;
  }
}

export default function ContractorsView({
  contractors,
  transactions,
  projects,
  money,
}: Props) {
  return (
    <>
      <div className="toolbar">
        <button className="btn">＋ پیمانکار جدید</button>
      </div>

      {contractors.map((contractor) => {
        const work = transactions.filter(
          (t) =>
            t.contractor_id === contractor.id && t.type === "work"
        );
        const payments = transactions.filter(
          (t) =>
            t.contractor_id === contractor.id && t.type === "payment"
        );
        const totalWork = work
          .filter((t) => t.status !== "replaced")
          .reduce((s, t) => s + (t.amount_rial || 0), 0);
        const totalPayments = payments.reduce(
          (s, t) => s + (t.amount_rial || 0),
          0
        );
        const bal = totalWork - totalPayments;

        return (
          <div className="card" key={contractor.id} style={{ marginBottom: 12 }}>
            <div className="row">
              <strong>👤 {contractor.name}</strong>
              <strong className="danger">{money(bal)}</strong>
            </div>

            <details open>
              <summary>کارهای انجام‌شده</summary>
              {work.length > 0 ? (
                work.map((item) => {
                  const projName =
                    projects.find((p) => p.id === item.project_id)?.name || "";
                  return (
                    <p key={item.id}>
                      {projName} — {item.description}
                      <br />
                      <b>{money(item.amount_rial)}</b>
                      {item.transaction_date && (
                        <span className="muted">
                          — {dateFa(item.transaction_date)}
                        </span>
                      )}
                    </p>
                  );
                })
              ) : (
                <p className="muted">موردی نیست.</p>
              )}
            </details>

            <details>
              <summary>پرداخت‌ها</summary>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <p key={payment.id}>
                    {payment.description}
                    <br />
                    <b className="success">{money(payment.amount_rial)}</b>
                    {payment.transaction_date && (
                      <span className="muted">
                        — {dateFa(payment.transaction_date)}
                      </span>
                    )}
                  </p>
                ))
              ) : (
                <p className="muted">پرداختی ثبت نشده.</p>
              )}
            </details>
          </div>
        );
      })}
    </>
  );
}
