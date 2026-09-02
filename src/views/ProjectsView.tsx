import type { Project } from "../hooks/useDashboardData";

interface Props {
  projects: Project[];
  initialTasks: Record<string, [string, string][]>;
}

export default function ProjectsView({ projects, initialTasks }: Props) {
  return (
    <>
      <div className="toolbar">
        <button className="btn">＋ پروژه جدید</button>
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
    </>
  );
}
