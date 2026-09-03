import type { Project } from "../hooks/useDashboardData";

interface Props {
  projects: Project[];
  initialTasks: Record<string, [string, string][]>;
  refresh: () => void;
}

export default function TasksView({ projects, initialTasks }: Props) {
  return (
    <>
      <div className="toolbar">
        <button className="btn" disabled>
          ＋ کار جدید (بزودی)
        </button>
      </div>

      <div className="grid-2">
        {projects.map((project) => {
          const tasks = initialTasks[project.name] || [];
          return (
            <div className="card" key={project.id}>
              <strong>🏗️ {project.name}</strong>
              {tasks.length > 0 ? (
                tasks.map((task, i) => (
                  <div className="task" key={i}>
                    <span className={`dot ${task[1]}`} />
                    {task[0]}
                  </div>
                ))
              ) : (
                <p className="muted">کار باقی‌مانده‌ای نیست.</p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
