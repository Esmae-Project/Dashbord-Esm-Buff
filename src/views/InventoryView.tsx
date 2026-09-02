import type { InventoryItem, InventoryMovement, Project } from "../hooks/useDashboardData";

const NON_INVENTORY_WORDS = [
  "کرایه", "حمل", "باربری", "بارگیری", "تخلیه",
  "ناهار", "غذا", "صبحانه", "شام", "پذیرایی",
  "تعمیر", "سرویس", "خدمات", "دستمزد", "اجرت", "هزینه",
];

function isRealInventoryItem(item: InventoryItem): boolean {
  const name = (item.item_name || "").trim().toLowerCase();
  if (!name) return false;
  return !NON_INVENTORY_WORDS.some((w) => name.includes(w));
}

interface Props {
  inventoryItems: InventoryItem[];
  inventoryMovements: InventoryMovement[];
  projects: Project[];
  loading: boolean;
}

export default function InventoryView({
  inventoryItems,
  inventoryMovements,
  projects,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="card">
        <div className="empty">⏳ در حال دریافت موجودی انبار...</div>
      </div>
    );
  }

  const filteredItems = inventoryItems.filter(isRealInventoryItem);

  const projectsById: Record<string, string> = {};
  projects.forEach((p) => {
    projectsById[p.id] = p.name;
  });

  const inventoryById: Record<string, InventoryItem> = {};
  filteredItems.forEach((item) => {
    inventoryById[item.id] = item;
  });

  type MovementEntry = {
    item: InventoryItem;
    quantity: number;
    unit: string;
    description: string;
  };

  const grouped: Record<string, Record<string, MovementEntry[]>> = {};

  inventoryMovements
    .filter((m) => m.movement_type === "in")
    .forEach((movement) => {
      const item = inventoryById[movement.item_id];
      if (!item) return;
      const projectName = projectsById[item.project_id || ""] || "پروژه نامشخص";
      const dateKey = movement.movement_date
        ? movement.movement_date.slice(0, 10)
        : "بدون تاریخ";
      if (!grouped[projectName]) grouped[projectName] = {};
      if (!grouped[projectName][dateKey]) grouped[projectName][dateKey] = [];
      grouped[projectName][dateKey].push({
        item,
        quantity: Number(movement.quantity || 0),
        unit: movement.unit || item.unit || "عدد",
        description: movement.description || "",
      });
    });

  if (Object.keys(grouped).length === 0) {
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>📦 موجودی انبار</h2>
        <p className="muted">فقط کالاها و اقلامی که موجودی فیزیکی دارند</p>
        <div className="empty" style={{ marginTop: 12 }}>
          📦 هنوز ورود واقعی به انبار ثبت نشده.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>📦 موجودی انبار</h2>
      <p className="muted">فقط کالاها و اقلامی که موجودی فیزیکی دارند</p>

      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b, "fa"))
        .map(([projectName, dates]) => {
          const dateEntries = Object.entries(dates)
            .sort(([a], [b]) => b.localeCompare(a));
          return (
            <details className="accordion" key={projectName} style={{ marginTop: 12 }}>
              <summary>
                <span>🏗️ {projectName}</span>
                <span className="pill">{dateEntries.length} روز</span>
              </summary>
              <div className="accordion-content">
                {dateEntries.map(([dateKey, movements]) => (
                  <details
                    className="accordion"
                    key={dateKey}
                    style={{ margin: "10px 0", border: "1px solid var(--border-color)" }}
                  >
                    <summary>
                      <span>📅 {formatDate(dateKey)}</span>
                      <span className="pill">{movements.length} قلم</span>
                    </summary>
                    <div className="accordion-content">
                      {movements.map((m, i) => (
                        <div
                          key={i}
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid var(--border-color)",
                            borderRadius: 14,
                            padding: 16,
                            marginBottom: 10,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <strong>📦 {m.item.item_name}</strong>
                            <strong className={m.quantity > 0 ? "success" : "danger"}>
                              +{m.quantity.toLocaleString("fa-IR")} {m.unit}
                            </strong>
                          </div>
                          <div style={{ marginTop: 8, fontSize: 13 }}>
                            موجودی فعلی:{" "}
                            <strong>
                              {(m.item.current_quantity || 0).toLocaleString("fa-IR")}{" "}
                              {m.item.unit || m.unit}
                            </strong>
                          </div>
                          {m.description && (
                            <div className="muted" style={{ marginTop: 8 }}>
                              {m.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </details>
          );
        })}
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "بدون تاریخ";
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("fa-IR");
  } catch {
    return dateStr;
  }
}
