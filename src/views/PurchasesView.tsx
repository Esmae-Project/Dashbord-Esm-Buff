import { useState } from "react";
import type { Purchase, Project } from "../hooks/useDashboardData";
import { insertPurchase } from "../lib/insert";
import Modal from "../components/Modal";

interface Props {
  purchases: Purchase[];
  projects: Project[];
  loading: boolean;
  refresh: () => void;
}

export default function PurchasesView({ purchases, projects, loading, refresh }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("عدد");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [amountRial, setAmountRial] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await insertPurchase({
        project_id: projectId,
        item_name: itemName,
        quantity: Number(quantity) || 1,
        unit,
        purchase_date: purchaseDate || today(),
        amount_rial: Number(amountRial),
        description: description || undefined,
      });
      setShowModal(false);
      setProjectId(""); setItemName(""); setQuantity(""); setUnit("عدد"); setPurchaseDate(""); setAmountRial(""); setDescription("");
      refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره‌سازی");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="empty">⏳ در حال دریافت خریدهای پروژه‌ای...</div>
      </div>
    );
  }

  const projectsById: Record<string, string> = {};
  projects.forEach((p) => {
    projectsById[p.id] = p.name;
  });

  const grouped: Record<string, Record<string, Purchase[]>> = {};
  purchases.forEach((item) => {
    const projectName = projectsById[item.project_id] || "بدون پروژه";
    const date = item.purchase_date || "";
    if (!grouped[projectName]) grouped[projectName] = {};
    if (!grouped[projectName][date]) grouped[projectName][date] = [];
    grouped[projectName][date].push(item);
  });

  return (
    <div className="card">
      <div className="row">
        <div>
          <h2>🛒 خریدها</h2>
          <p className="muted">خریدهای ثبت‌شده برای پروژه‌ها</p>
        </div>
        <button className="btn" onClick={() => { setError(""); setShowModal(true); }}>
          ＋ خرید جدید
        </button>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="empty" style={{ marginTop: 12 }}>
          📭 هنوز خریدی ثبت نشده است.
        </div>
      ) : (
        Object.entries(grouped).map(([projectName, dates]) => (
          <details className="accordion" key={projectName} style={{ marginTop: 12 }}>
            <summary>
              <span>🏗️ {projectName}</span>
            </summary>
            <div className="accordion-content">
              {Object.keys(dates)
                .sort()
                .reverse()
                .map((date) => (
                  <details key={date} style={{ marginTop: 10 }}>
                    <summary>📅 {formatDate(date)}</summary>
                    <div style={{ marginTop: 10 }}>
                      {dates[date].map((item) => (
                        <div
                          key={item.id}
                          className="latest-record latest-purchase"
                          style={{ marginTop: 10 }}
                        >
                          <div className="latest-record-main">
                            <div>
                              <div className="latest-record-title">
                                🛒 {item.item_name || "کالای بدون نام"}
                              </div>
                              <div className="latest-record-meta">
                                مقدار: {item.quantity ?? 1} {item.unit || "عدد"}
                                {item.description && <br />}
                                {item.description}
                              </div>
                            </div>
                            <div className="latest-record-amount">
                              {formatRial(item.amount_rial || 0)} ریال
                            </div>
                          </div>
                        </div>
                      ))}
                      <div
                        style={{
                          marginTop: 10,
                          padding: 12,
                          borderRadius: 12,
                          background: "rgba(255,255,255,0.04)",
                          fontWeight: 800,
                          border: "1px solid var(--border-color)",
                        }}
                      >
                        جمع خرید روز: {formatRial(
                          dates[date].reduce(
                            (sum, item) => sum + (item.amount_rial || 0),
                            0
                          )
                        )}{" "}
                        ریال
                      </div>
                    </div>
                  </details>
                ))}
            </div>
          </details>
        ))
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} title="🛒 خرید جدید">
        {error && <div className="modal-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>پروژه</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
              <option value="">انتخاب پروژه...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>🏗️ {p.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>نام کالا</label>
            <input type="text" placeholder="نام کالا" value={itemName} onChange={(e) => setItemName(e.target.value)} required autoFocus />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>مقدار</label>
              <input type="number" placeholder="مقدار" value={quantity} onChange={(e) => setQuantity(e.target.value)} min={0} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>واحد</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="عدد">عدد</option>
                <option value="کیلوگرم">کیلوگرم</option>
                <option value="متر">متر</option>
                <option value="مترمربع">مترمربع</option>
                <option value="لیتر">لیتر</option>
                <option value="بسته">بسته</option>
                <option value="جعبه">جعبه</option>
                <option value="بشقاب">بشقاب</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>مبلغ (ریال)</label>
            <input type="number" placeholder="مبلغ به ریال" value={amountRial} onChange={(e) => setAmountRial(e.target.value)} required min={0} />
          </div>
          <div className="field">
            <label>تاریخ</label>
            <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
          </div>
          <div className="field">
            <label>توضیحات (اختیاری)</label>
            <input type="text" placeholder="توضیحات" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "⏳ ذخیره..." : "💾 ذخیره خرید"}
            </button>
            <button type="button" className="btn light" onClick={() => setShowModal(false)}>
              انصراف
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function formatRial(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value || 0);
}

function formatDate(date: string): string {
  if (!date) return "بدون تاریخ";
  try {
    return new Date(date + "T00:00:00").toLocaleDateString("fa-IR");
  } catch {
    return date;
  }
}
