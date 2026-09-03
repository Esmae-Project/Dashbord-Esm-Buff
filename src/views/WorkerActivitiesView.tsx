import { useState } from "react";
import type { WorkerActivity, Project } from "../hooks/useDashboardData";
import { insertWorkerActivity } from "../lib/insert";
import Modal from "../components/Modal";

interface Props {
  activities: WorkerActivity[];
  projects: Project[];
  loading: boolean;
  refresh: () => void;
}

export default function WorkerActivitiesView({ activities, projects, loading, refresh }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [personName, setPersonName] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
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
      await insertWorkerActivity({
        person_name: personName,
        activity_date: activityDate || today(),
        hours: Number(hours),
        description,
        project_id: projectId || undefined,
      });
      setShowModal(false);
      setPersonName(""); setActivityDate(""); setHours(""); setDescription(""); setProjectId("");
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

  return (
    <div className="card">
      <div className="toolbar">
        <button className="btn" onClick={() => { setError(""); setShowModal(true); }}>
          ＋ فعالیت جدید
        </button>
      </div>
      <h2>👷 فعالیت نیروها</h2>
      <p className="muted">اضافه‌کاری، کارهای خاص و فعالیت روزانه نیروها</p>

      {dates.length === 0 ? (
        <div className="empty" style={{ marginTop: 12 }}>
          👷 هنوز فعالیتی ثبت نشده.
        </div>
      ) : (
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
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} title="👷 فعالیت جدید">
        {error && <div className="modal-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>نام نیرو</label>
            <input type="text" placeholder="نام نیرو" value={personName} onChange={(e) => setPersonName(e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <label>تاریخ</label>
            <input type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} />
          </div>
          <div className="field">
            <label>ساعت</label>
            <input type="number" placeholder="تعداد ساعت" value={hours} onChange={(e) => setHours(e.target.value)} required min={0} step={0.5} />
          </div>
          <div className="field">
            <label>پروژه (اختیاری)</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">بدون پروژه</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>🏗️ {p.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>توضیحات</label>
            <input type="text" placeholder="توضیح فعالیت" value={description} onChange={(e) => setDescription(e.target.value)} required />
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
