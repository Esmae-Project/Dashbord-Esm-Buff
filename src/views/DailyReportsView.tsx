import type { DailyReport, Project } from "../hooks/useDashboardData";

interface Props {
  reports: DailyReport[];
  projects: Project[];
  loading: boolean;
}

export default function DailyReportsView({ reports, projects, loading }: Props) {
  if (loading) {
    return (
      <div className="card">
        <div className="empty">⏳ در حال دریافت گزارش‌ها...</div>
      </div>
    );
  }

  const projectsById: Record<string, string> = {};
  projects.forEach((p) => {
    projectsById[p.id] = p.name;
  });

  if (reports.length === 0) {
    return (
      <div className="card">
        <div className="row">
          <div>
            <h2 style={{ margin: 0 }}>📋 گزارش روزانه کارگاه</h2>
            <p className="muted">گزارش روزانه وضعیت پروژه‌ها</p>
          </div>
        </div>
        <div className="empty" style={{ marginTop: 15 }}>
          📭 هنوز گزارشی ثبت نشده است.
        </div>
      </div>
    );
  }

  const grouped: Record<string, Record<string, DailyReport[]>> = {};
  reports.forEach((report) => {
    const projectName = projectsById[report.project_id] || "پروژه نامشخص";
    const date = (report.report_date || "").slice(0, 10);
    if (!grouped[projectName]) grouped[projectName] = {};
    if (!grouped[projectName][date]) grouped[projectName][date] = [];
    grouped[projectName][date].push(report);
  });

  return (
    <div className="card">
      <div className="row">
        <div>
          <h2 style={{ margin: 0 }}>📋 گزارش روزانه کارگاه</h2>
          <p className="muted">گزارش روزانه وضعیت پروژه‌ها</p>
        </div>
      </div>

      <div style={{ marginTop: 15 }}>
        {Object.entries(grouped).map(([projectName, dates]) => {
          const totalReports = Object.values(dates).reduce(
            (sum, r) => sum + r.length,
            0
          );
          return (
            <details className="accordion" key={projectName}>
              <summary>
                <span>🏗️ {projectName}</span>
                <span className="pill">{totalReports} گزارش</span>
              </summary>
              <div className="accordion-content">
                {Object.entries(dates)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([date, dayReports]) => (
                    <details
                      className="accordion"
                      key={date}
                      style={{ marginBottom: 10 }}
                    >
                      <summary>
                        <span>📅 {formatDate(date)}</span>
                        <span className="pill">{dayReports.length} گزارش</span>
                      </summary>
                      <div className="accordion-content">
                        {dayReports.map((report) => (
                          <div
                            key={report.id}
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid var(--border-color)",
                              borderRadius: 14,
                              padding: 16,
                              marginBottom: 10,
                            }}
                          >
                            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.9 }}>
                              {report.report_text}
                            </div>
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
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const value = dateStr.slice(0, 10);
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day))
    return value;
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day, 12, 0, 0)));
}
