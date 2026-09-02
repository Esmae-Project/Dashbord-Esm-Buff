import type { WorkerActivity, Project } from "../hooks/useDashboardData";

interface Props {
  activities: WorkerActivity[];
  projects: Project[];
  loading: boolean;
}

export default function WorkerActivitiesView({ activities, projects, loading }: Props) {
  if (loading) {
    return (
      <div className="card">
        <div className="empty">⏳ در حال دریافت فعالیت‌ها...</div>
      </div>
    );
  }

  const projectsById: Record<string, string> = {};
  projects.forEach((p) => {
    projectsById[p.id] = p.name;
  });

  const grouped: Record<string, WorkerActivity[]> = {};
  activities.forEach((item) => {
    if (!item.activity_date) return;
    const date = item.activity_date.slice(0, 10);
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  });

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (dates.length === 0) {
    return (
      <div className="card">
        <h2>👷 فعالیت نیروها</h2>
        <p className="muted">اضافه‌کاری، کارهای خاص و فعالیت روزانه نیروها</p>
        <div className="empty" style={{ marginTop: 12 }}>
          👷 هنوز فعالیتی ثبت نشده.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="toolbar">
        <button className="btn light">🔄 تازه‌سازی</button>
      </div>
      <h2>👷 فعالیت نیروها</h2>
      <p className="muted">اضافه‌کاری، کارهای خاص و فعالیت روزانه نیروها</p>
      <div style={{ marginTop: 12 }}>
        {dates.map((date) => {
          const dayActivities = grouped[date];
          const people: Record<
            string,
            { hours: number; projects: string[]; descriptions: string[] }
          > = {};
          dayActivities.forEach((item) => {
            const person = item.person_name || "بدون نام";
            if (!people[person])
              people[person] = { hours: 0, projects: [], descriptions: [] };
            people[person].hours += Number(item.hours || 0);
            if (item.project_id) {
              const pname = projectsById[item.project_id] || "";
              if (pname && !people[person].projects.includes(pname))
                people[person].projects.push(pname);
            }
            if (
              item.description &&
              !people[person].descriptions.includes(item.description)
            )
              people[person].descriptions.push(item.description);
          });
          const peopleEntries = Object.entries(people);
          return (
            <details className="accordion" key={date} style={{ marginTop: 10 }}>
              <summary>
                <span>📅 {formatDate(date)}</span>
                <span className="pill">{peopleEntries.length} نفر</span>
              </summary>
              <div className="accordion-content">
                {peopleEntries.map(([person, info]) => (
                  <div
                    key={person}
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
                      <strong>👤 {person}</strong>
                      <strong className="success">
                        ⏱️ {info.hours} ساعت
                      </strong>
                    </div>
                    {info.projects.length > 0 && (
                      <div className="muted" style={{ marginTop: 8 }}>
                        🏗️ پروژه: {info.projects.join(" • ")}
                      </div>
                    )}
                    {info.descriptions.length > 0 && (
                      <div className="muted" style={{ marginTop: 7 }}>
                        📝 {info.descriptions.join(" • ")}
                      </div>
                    )}
                  </div>
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
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day))
    return dateStr;
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-arabext", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day, 12, 0, 0)));
}
