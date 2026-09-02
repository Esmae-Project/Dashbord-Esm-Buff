import type { Purchase, Project } from "../hooks/useDashboardData";

interface Props {
  purchases: Purchase[];
  projects: Project[];
  loading: boolean;
}

export default function PurchasesView({ purchases, projects, loading }: Props) {
  if (loading) {
    return (
      <div className="card">
        <div className="empty">⏳ در حال دریافت خریدهای پروژه‌ای...</div>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="card">
        <h2>🛒 خریدها</h2>
        <p className="muted">خریدهای ثبت‌شده برای پروژه‌ها</p>
        <div className="empty" style={{ marginTop: 12 }}>
          📭 هنوز خریدی ثبت نشده است.
        </div>
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
      <h2>🛒 خریدها</h2>
      <p className="muted">خریدهای ثبت‌شده برای پروژه‌ها</p>

      {Object.entries(grouped).map(([projectName, dates]) => (
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
      ))}
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
