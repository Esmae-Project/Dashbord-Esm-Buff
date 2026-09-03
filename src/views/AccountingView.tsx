import { useState } from "react";
import type {
  Project,
  Contractor,
  Transaction,
  PersonalAccount,
  PersonalExpense,
} from "../hooks/useDashboardData";
import { insertTransaction, insertPersonalAccount, insertPersonalExpense } from "../lib/insert";
import Modal from "../components/Modal";

interface Props {
  contractors: Contractor[];
  transactions: Transaction[];
  projects: Project[];
  personalAccounts: PersonalAccount[];
  personalExpenses: PersonalExpense[];
  money: (n: number) => string;
  refresh: () => void;
}

export default function AccountingView({
  contractors,
  transactions,
  projects,
  personalAccounts,
  personalExpenses,
  money,
  refresh,
}: Props) {
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPersonalAccountModal, setShowPersonalAccountModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Work form state
  const [workContractor, setWorkContractor] = useState("");
  const [workProject, setWorkProject] = useState("");
  const [workDesc, setWorkDesc] = useState("");
  const [workAmount, setWorkAmount] = useState("");
  const [workDate, setWorkDate] = useState("");

  // Payment form state
  const [payContractor, setPayContractor] = useState("");
  const [payProject, setPayProject] = useState("");
  const [payDesc, setPayDesc] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState("");

  // Personal account form state
  const [paName, setPaName] = useState("");
  const [paType, setPaType] = useState("debt");
  const [paAmount, setPaAmount] = useState("");
  const [paPaid, setPaPaid] = useState("");
  const [paDate, setPaDate] = useState("");

  // Expense form state
  const [expName, setExpName] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState("");
  const [expCategory, setExpCategory] = useState("");
  const [expDesc, setExpDesc] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  async function handleWorkSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await insertTransaction({
        contractor_id: workContractor,
        project_id: workProject,
        type: "work",
        description: workDesc,
        amount_rial: Number(workAmount),
        transaction_date: workDate || today(),
      });
      setShowWorkModal(false);
      resetWorkForm();
      refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره‌سازی");
    } finally {
      setSaving(false);
    }
  }

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await insertTransaction({
        contractor_id: payContractor,
        project_id: payProject,
        type: "payment",
        description: payDesc,
        amount_rial: Number(payAmount),
        transaction_date: payDate || today(),
      });
      setShowPaymentModal(false);
      resetPayForm();
      refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره‌سازی");
    } finally {
      setSaving(false);
    }
  }

  async function handlePersonalAccountSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await insertPersonalAccount({
        person_name: paName,
        account_type: paType,
        amount_rial: Number(paAmount),
        paid_rial: Number(paPaid) || 0,
        account_date: paDate || today(),
      });
      setShowPersonalAccountModal(false);
      setPaName(""); setPaType("debt"); setPaAmount(""); setPaPaid(""); setPaDate("");
      refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره‌سازی");
    } finally {
      setSaving(false);
    }
  }

  async function handleExpenseSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await insertPersonalExpense({
        item_name: expName,
        amount_rial: Number(expAmount),
        expense_date: expDate || today(),
        category: expCategory || undefined,
        description: expDesc || undefined,
      });
      setShowExpenseModal(false);
      setExpName(""); setExpAmount(""); setExpDate(""); setExpCategory(""); setExpDesc("");
      refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره‌سازی");
    } finally {
      setSaving(false);
    }
  }

  function resetWorkForm() {
    setWorkContractor(""); setWorkProject(""); setWorkDesc(""); setWorkAmount(""); setWorkDate("");
  }
  function resetPayForm() {
    setPayContractor(""); setPayProject(""); setPayDesc(""); setPayAmount(""); setPayDate("");
  }

  return (
    <>
      <div className="toolbar">
        <button className="btn" onClick={() => { setError(""); setShowWorkModal(true); }}>
          ＋ کار انجام‌شده
        </button>
        <button className="btn green" onClick={() => { setError(""); setShowPaymentModal(true); }}>
          ＋ پرداخت
        </button>
        <button className="btn" onClick={() => { setError(""); setShowPersonalAccountModal(true); }}>
          ＋ حساب شخصی
        </button>
        <button className="btn" onClick={() => { setError(""); setShowExpenseModal(true); }}>
          ＋ هزینه شخصی
        </button>
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

      {/* ===== Work Modal ===== */}
      <Modal show={showWorkModal} onClose={() => setShowWorkModal(false)} title="🔨 ثبت کار انجام‌شده">
        {error && <div className="modal-error">{error}</div>}
        <form onSubmit={handleWorkSubmit}>
          <div className="field">
            <label>پیمانکار</label>
            <select value={workContractor} onChange={(e) => setWorkContractor(e.target.value)} required>
              <option value="">انتخاب پیمانکار...</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>👤 {c.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>پروژه</label>
            <select value={workProject} onChange={(e) => setWorkProject(e.target.value)} required>
              <option value="">انتخاب پروژه...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>🏗️ {p.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>توضیحات</label>
            <input
              type="text"
              placeholder="توضیح کار انجام‌شده"
              value={workDesc}
              onChange={(e) => setWorkDesc(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>مبلغ (ریال)</label>
            <input
              type="number"
              placeholder="مبلغ به ریال"
              value={workAmount}
              onChange={(e) => setWorkAmount(e.target.value)}
              required
              min={0}
            />
          </div>
          <div className="field">
            <label>تاریخ</label>
            <input
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "⏳ ذخیره..." : "💾 ذخیره"}
            </button>
            <button type="button" className="btn light" onClick={() => setShowWorkModal(false)}>
              انصراف
            </button>
          </div>
        </form>
      </Modal>

      {/* ===== Payment Modal ===== */}
      <Modal show={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="💰 ثبت پرداخت">
        {error && <div className="modal-error">{error}</div>}
        <form onSubmit={handlePaymentSubmit}>
          <div className="field">
            <label>پیمانکار</label>
            <select value={payContractor} onChange={(e) => setPayContractor(e.target.value)} required>
              <option value="">انتخاب پیمانکار...</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>👤 {c.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>پروژه</label>
            <select value={payProject} onChange={(e) => setPayProject(e.target.value)} required>
              <option value="">انتخاب پروژه...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>🏗️ {p.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>توضیحات</label>
            <input
              type="text"
              placeholder="توضیح پرداخت"
              value={payDesc}
              onChange={(e) => setPayDesc(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>مبلغ (ریال)</label>
            <input
              type="number"
              placeholder="مبلغ به ریال"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              required
              min={0}
            />
          </div>
          <div className="field">
            <label>تاریخ</label>
            <input
              type="date"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn green" disabled={saving}>
              {saving ? "⏳ ذخیره..." : "💾 ذخیره پرداخت"}
            </button>
            <button type="button" className="btn light" onClick={() => setShowPaymentModal(false)}>
              انصراف
            </button>
          </div>
        </form>
      </Modal>

      {/* ===== Personal Account Modal ===== */}
      <Modal show={showPersonalAccountModal} onClose={() => setShowPersonalAccountModal(false)} title="👤 حساب شخصی جدید">
        {error && <div className="modal-error">{error}</div>}
        <form onSubmit={handlePersonalAccountSubmit}>
          <div className="field">
            <label>نام شخص</label>
            <input type="text" placeholder="نام شخص" value={paName} onChange={(e) => setPaName(e.target.value)} required />
          </div>
          <div className="field">
            <label>نوع حساب</label>
            <select value={paType} onChange={(e) => setPaType(e.target.value)}>
              <option value="debt">💸 بدهکارم</option>
              <option value="credit">💰 طلبکارم</option>
            </select>
          </div>
          <div className="field">
            <label>مبلغ کل (ریال)</label>
            <input type="number" placeholder="مبلغ کل" value={paAmount} onChange={(e) => setPaAmount(e.target.value)} required min={0} />
          </div>
          <div className="field">
            <label>پرداخت‌شده (ریال)</label>
            <input type="number" placeholder="مبلغ پرداخت شده" value={paPaid} onChange={(e) => setPaPaid(e.target.value)} min={0} />
          </div>
          <div className="field">
            <label>تاریخ</label>
            <input type="date" value={paDate} onChange={(e) => setPaDate(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "⏳ ذخیره..." : "💾 ذخیره"}
            </button>
            <button type="button" className="btn light" onClick={() => setShowPersonalAccountModal(false)}>
              انصراف
            </button>
          </div>
        </form>
      </Modal>

      {/* ===== Expense Modal ===== */}
      <Modal show={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="🛍️ هزینه شخصی جدید">
        {error && <div className="modal-error">{error}</div>}
        <form onSubmit={handleExpenseSubmit}>
          <div className="field">
            <label>نام کالا / مورد</label>
            <input type="text" placeholder="نام هزینه" value={expName} onChange={(e) => setExpName(e.target.value)} required />
          </div>
          <div className="field">
            <label>مبلغ (ریال)</label>
            <input type="number" placeholder="مبلغ به ریال" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} required min={0} />
          </div>
          <div className="field">
            <label>تاریخ</label>
            <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} />
          </div>
          <div className="field">
            <label>دسته‌بندی (اختیاری)</label>
            <input type="text" placeholder="مثال: حمل‌ونقل، غذا" value={expCategory} onChange={(e) => setExpCategory(e.target.value)} />
          </div>
          <div className="field">
            <label>توضیحات (اختیاری)</label>
            <input type="text" placeholder="توضیحات اضافی" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "⏳ ذخیره..." : "💾 ذخیره"}
            </button>
            <button type="button" className="btn light" onClick={() => setShowExpenseModal(false)}>
              انصراف
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
