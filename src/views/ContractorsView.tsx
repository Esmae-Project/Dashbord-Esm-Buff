import { useState } from "react";
import type { Project, Contractor, Transaction } from "../hooks/useDashboardData";
import { insertContractor } from "../lib/insert";
import Modal from "../components/Modal";

interface Props {
  contractors: Contractor[];
  transactions: Transaction[];
  projects: Project[];
  money: (n: number) => string;
  refresh: () => void;
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
  refresh,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await insertContractor({ name: name.trim() });
      setShowModal(false);
      setName("");
      refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره‌سازی");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="toolbar">
        <button className="btn" onClick={() => setShowModal(true)}>
          ＋ پیمانکار جدید
        </button>
      </div>

      {contractors.map((contractor) => {
        const work = transactions.filter(
          (t) => t.contractor_id === contractor.id && t.type === "work"
        );
        const payments = transactions.filter(
          (t) => t.contractor_id === contractor.id && t.type === "payment"
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
          <div className="contractor-card" key={contractor.id}>
            {/* Contractor Header */}
            <div className="contractor-header">
              <div className="contractor-name">👤 {contractor.name}</div>
              <div className="contractor-balance">
                مانده: <b className="danger">{money(bal)}</b>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="contractor-stats">
              <div className="contractor-stat work-stat">
                <span className="contractor-stat-icon">🔨</span>
                <span className="contractor-stat-label">کار انجام‌شده</span>
                <span className="contractor-stat-value work-value">{money(totalWork)}</span>
                <span className="contractor-stat-count">{work.length} مورد</span>
              </div>
              <div className="contractor-stat pay-stat">
                <span className="contractor-stat-icon">💰</span>
                <span className="contractor-stat-label">پرداخت‌ها</span>
                <span className="contractor-stat-value pay-value">{money(totalPayments)}</span>
                <span className="contractor-stat-count">{payments.length} مورد</span>
              </div>
            </div>

            {/* Work Section - Green accent */}
            <div className="contractor-section contractor-section-work">
              <div className="contractor-section-header">
                <span>🔨 کارهای انجام‌شده</span>
                <span className="contractor-section-total">{money(totalWork)} ریال</span>
              </div>
              {work.length > 0 ? (
                <div className="contractor-section-list">
                  {work.map((item) => {
                    const projName =
                      projects.find((p) => p.id === item.project_id)?.name || "";
                    return (
                      <div
                        className="contractor-section-item"
                        key={item.id}
                      >
                        <div className="contractor-item-main">
                          {projName && (
                            <span className="contractor-item-project">
                              🏗️ {projName}
                            </span>
                          )}
                          <span className="contractor-item-desc">
                            {item.description}
                          </span>
                        </div>
                        <div className="contractor-item-right">
                          <span className="contractor-item-amount work-amount">
                            {money(item.amount_rial)} ریال
                          </span>
                          {item.transaction_date && (
                            <span className="contractor-item-date">
                              {dateFa(item.transaction_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="contractor-section-empty">
                  هنوز کاری ثبت نشده
                </div>
              )}
            </div>

            {/* Payments Section - Blue accent */}
            <div className="contractor-section contractor-section-pay">
              <div className="contractor-section-header">
                <span>💰 پرداخت‌ها</span>
                <span className="contractor-section-total">{money(totalPayments)} ریال</span>
              </div>
              {payments.length > 0 ? (
                <div className="contractor-section-list">
                  {payments.map((payment) => (
                    <div
                      className="contractor-section-item"
                      key={payment.id}
                    >
                      <div className="contractor-item-main">
                        <span className="contractor-item-desc">
                          {payment.description}
                        </span>
                      </div>
                      <div className="contractor-item-right">
                        <span className="contractor-item-amount pay-amount">
                          {money(payment.amount_rial)} ریال
                        </span>
                        {payment.transaction_date && (
                          <span className="contractor-item-date">
                            {dateFa(payment.transaction_date)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="contractor-section-empty">
                  هنوز پرداختی ثبت نشده
                </div>
              )}
            </div>
          </div>
        );
      })}

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="👤 پیمانکار جدید"
      >
        {error && <div className="modal-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>نام پیمانکار</label>
            <input
              type="text"
              placeholder="نام پیمانکار را وارد کنید"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "⏳ در حال ذخیره..." : "💾 ذخیره"}
            </button>
            <button
              type="button"
              className="btn light"
              onClick={() => setShowModal(false)}
            >
              انصراف
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
