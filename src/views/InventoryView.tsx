import { useState } from "react";
import type { InventoryItem, InventoryMovement, Project } from "../hooks/useDashboardData";
import { insertInventoryItem } from "../lib/insert";
import Modal from "../components/Modal";

interface Props {
  inventoryItems: InventoryItem[];
  inventoryMovements: InventoryMovement[];
  projects: Project[];
  loading: boolean;
  refresh: () => void;
}

export default function InventoryView({
  inventoryItems,
  inventoryMovements,
  projects,
  loading,
  refresh,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemUnit, setItemUnit] = useState("عدد");
  const [quantity, setQuantity] = useState("");
  const [projectId, setProjectId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const projectsById: Record<string, string> = {};
  projects.forEach((p) => {
    projectsById[p.id] = p.name;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await insertInventoryItem({
        item_name: itemName,
        unit: itemUnit,
        current_quantity: Number(quantity) || 0,
        project_id: projectId || undefined,
      });
      setShowModal(false);
      setItemName(""); setItemUnit("عدد"); setQuantity(""); setProjectId("");
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
        <div className="empty">⏳ در حال دریافت اطلاعات انبار...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="row">
        <div>
          <h2>📦 انبار</h2>
          <p className="muted">وضعیت کالاها و گردش انبار</p>
        </div>
        <button className="btn" onClick={() => { setError(""); setShowModal(true); }}>
          ＋ کالای جدید
        </button>
      </div>

      {inventoryItems.length === 0 ? (
        <div className="empty" style={{ marginTop: 12 }}>
          📭 هنوز کالایی در انبار ثبت نشده.
        </div>
      ) : (
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table>
            <thead>
              <tr>
                <th>کالا</th>
                <th>واحد</th>
                <th>موجودی</th>
                <th>پروژه</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((item) => (
                <tr key={item.id}>
                  <td><b>📦 {item.item_name}</b></td>
                  <td>{item.unit}</td>
                  <td><b>{item.current_quantity}</b></td>
                  <td>{projectsById[item.project_id || ""] || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {inventoryMovements.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>📋 گردش انبار</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>نوع</th>
                  <th>مقدار</th>
                  <th>واحد</th>
                  <th>تاریخ</th>
                  <th>توضیحات</th>
                </tr>
              </thead>
              <tbody>
                {inventoryMovements.map((mov) => (
                  <tr key={mov.id}>
                    <td>
                      <span className={`pill ${mov.movement_type === "in" ? "" : "danger"}`}>
                        {mov.movement_type === "in" ? "📥 ورود" : "📤 خروج"}
                      </span>
                    </td>
                    <td><b>{mov.quantity}</b></td>
                    <td>{mov.unit}</td>
                    <td>{mov.movement_date}</td>
                    <td>{mov.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} title="📦 کالای جدید">
        {error && <div className="modal-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>نام کالا</label>
            <input type="text" placeholder="نام کالا" value={itemName} onChange={(e) => setItemName(e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <label>واحد</label>
            <select value={itemUnit} onChange={(e) => setItemUnit(e.target.value)}>
              <option value="عدد">عدد</option>
              <option value="کیلوگرم">کیلوگرم</option>
              <option value="متر">متر</option>
              <option value="لیتر">لیتر</option>
              <option value="بسته">بسته</option>
            </select>
          </div>
          <div className="field">
            <label>موجودی اولیه</label>
            <input type="number" placeholder="تعداد" value={quantity} onChange={(e) => setQuantity(e.target.value)} min={0} />
          </div>
          <div className="field">
            <label>پروژه (اختیاری)</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">ندارد</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>🏗️ {p.name}</option>
              ))}
            </select>
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "⏳ ذخیره..." : "💾 ذخیره"}
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
