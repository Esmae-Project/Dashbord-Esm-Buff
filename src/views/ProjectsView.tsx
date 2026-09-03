import { useState } from "react";
import type { Project } from "../hooks/useDashboardData";
import { insertProject } from "../lib/insert";
import Modal from "../components/Modal";

interface Props {
  projects: Project[];
  initialTasks: Record<string, [string, string][]>;
  refresh: () => void;
}

export default function ProjectsView({ projects, initialTasks, refresh }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [employer, setEmployer] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await insertProject({ name: name.trim(), employer: employer.trim() || undefined });
      setShowModal(false);
      setName("");
      setEmployer("");
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
          ＋ پروژه جدید
        </button>
      </div>

      <div className="grid-2">
        {projects.map((project) => {
          const tasks = initialTasks[project.name] || [];
          return (
            <div className="card" key={project.id}>
              <div className="row">
                <strong>🏗️ {project.name}</strong>
                <span className="pill">
                  {project.employer || "مستقل"}
                </span>
              </div>
              {tasks.length > 0 ? (
                tasks.map((task, i) => (
                  <div className="task" key={i}>
                    <span className={`dot ${task[1]}`} />
                    <span>{task[0]}</span>
                  </div>
                ))
              ) : (
                <p className="muted">کار باقی‌مانده‌ای ندارد.</p>
              )}
            </div>
          );
        })}
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title="🏗️ پروژه جدید">
        {error && <div className="modal-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>نام پروژه</label>
            <input
              type="text"
              placeholder="مثال: خاوران"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label>کارفرما (اختیاری)</label>
            <input
              type="text"
              placeholder="مثال: آرتا پیشرو"
              value={employer}
              onChange={(e) => setEmployer(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "⏳ در حال ذخیره..." : "💾 ذخیره"}
            </button>
            <button type="button" className="btn light" onClick={() => setShowModal(false)}>
              انصراف
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
