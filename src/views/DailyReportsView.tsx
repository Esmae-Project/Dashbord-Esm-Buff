import { useState } from "react";
import type { DailyReport, Project } from "../hooks/useDashboardData";
import { insertDailyReport } from "../lib/insert";
import Modal from "../components/Modal";

interface Props {
  reports: DailyReport[];
  projects: Project[];
  loading: boolean;
  refresh: () => void;
}

export default function DailyReportsView({ reports, projects, loading, refresh }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [reportText, setReportText] = useState("");
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
      await insertDailyReport({
        project_id: projectId,
        report_date: reportDate || today(),
        report_text: reportText,
      });
      setShowModal(false);
      setProjectId(""); setReportDate(""); setReportText("");
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
        <div className="empty">⏳ در حال دریافت گزارش‌ها...</div>
      </div>
    );
  }

  const projectsById: Record<string, string> = {};
  projects.forEach((p) => {
    projectsById[p.id] = p.name;
  });

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
        <button className="btn" onClick={() => { setError(""); setShowModal(true); }}>
          ＋ گزارش جدید
        </button>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="empty" style={{ marginTop: 15 }}>
          📭 هنوز گزارشی ثبت نشده است.
        </div>
      ) : (
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
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)} title="📋 گزارش جدید">
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
            <label>تاریخ</label>
            <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
          </div>
          <div className="field">
            <label>متن گزارش</label>
            <textarea
              placeholder="گزارش روزانه را بنویسید..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              required
              rows={6}
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "⏳ ذخیره..." : "💾 ذخیره گزارش"}
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
