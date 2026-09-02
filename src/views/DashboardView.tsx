import LatestRecords from "../components/LatestRecords";
import type {
  Project,
  Contractor,
  Transaction,
  DailyReport,
  WorkerActivity,
  PersonalAccount,
  PersonalExpense,
  Purchase,
} from "../hooks/useDashboardData";

interface Props {
  projects: Project[];
  contractors: Contractor[];
  transactions: Transaction[];
  dailyReports: DailyReport[];
  workerActivities: WorkerActivity[];
  personalAccounts: PersonalAccount[];
  personalExpenses: PersonalExpense[];
  purchases: Purchase[];
  initialTasks: Record<string, [string, string][]>;
  money: (n: number) => string;
}

export default function DashboardView({
  projects,
  contractors,
  transactions,
  dailyReports,
  workerActivities,
  personalAccounts,
  personalExpenses,
  purchases,
  initialTasks,
  money,
}: Props) {
  function totalWork(name: string): number {
    const c = contractors.find((x) => x.name === name);
    if (!c) return 0;
    return transactions
      .filter(
        (t) =>
          t.contractor_id === c.id &&
          t.type === "work" &&
          t.status !== "replaced"
      )
      .reduce((sum, t) => sum + (t.amount_rial || 0), 0);
  }

  function totalPayments(name: string): number {
    const c = contractors.find((x) => x.name === name);
    if (!c) return 0;
    return transactions
      .filter((t) => t.contractor_id === c.id && t.type === "payment")
      .reduce((sum, t) => sum + (t.amount_rial || 0), 0);
  }

  function balance(name: string): number {
    return totalWork(name) - totalPayments(name);
  }

  const names = contractors.map((c) => c.name);
  let totalW = 0;
  let totalP = 0;
  names.forEach((n) => {
    totalW += totalWork(n);
    totalP += totalPayments(n);
  });

  const artaProjects = projects
    .filter((p) => p.employer === "آرتا پیشرو")
    .map((p) => p.name);

  let artaWork = 0;
  let artaPayments = 0;
  names.forEach((name) => {
    const c = contractors.find((x) => x.name === name)!;
    transactions
      .filter(
        (t) =>
          t.contractor_id === c.id &&
          t.type === "work" &&
          t.status !== "replaced" &&
          artaProjects.includes(
            projects.find((p) => p.id === t.project_id)?.name || ""
          )
      )
      .forEach((t) => {
        artaWork += t.amount_rial || 0;
      });
    transactions
      .filter(
        (t) =>
          t.contractor_id === c.id &&
          t.type === "payment" &&
          (!t.project_id ||
            artaProjects.includes(
              projects.find((p) => p.id === t.project_id)?.name || ""
            ))
      )
      .forEach((t) => {
        artaPayments += t.amount_rial || 0;
      });
  });

  return (
    <>
      {/* Stats */}
      <div className="grid-4">
        <div className="card stat">
          <small>پروژه‌ها</small>
          <strong>{projects.length}</strong>
        </div>
        <div className="card stat">
          <small>پیمانکاران</small>
          <strong>{contractors.length}</strong>
        </div>
        <div className="card stat">
          <small>کل کار انجام‌شده</small>
          <strong>{money(totalW)}</strong>
        </div>
        <div className="card stat">
          <small>کل مانده بدهی</small>
          <strong className="danger">{money(totalW - totalP)}</strong>
        </div>
      </div>

      {/* Latest Records */}
      <div style={{ marginTop: 24 }}>
        <div className="card">
          <div className="row">
            <div>
              <h2 style={{ margin: 0 }}>🕘 آخرین ثبت‌ها</h2>
              <p className="muted" style={{ marginBottom: 0 }}>
                آخرین فعالیت‌های ثبت‌شده در سیستم
              </p>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <LatestRecords
              transactions={transactions}
              purchases={purchases}
              workerActivities={workerActivities}
              personalAccounts={personalAccounts}
              personalExpenses={personalExpenses}
              dailyReports={dailyReports}
              projects={projects}
              contractors={contractors}
            />
          </div>
        </div>
      </div>

      {/* Contractor Cards */}
      <div style={{ marginTop: 24 }}>
        <h2>👷 پیمانکاران</h2>
        <div className="grid-2">
          {names.map((name) => (
            <div className="card" key={name}>
              <div className="row">
                <strong>👤 {name}</strong>
                <strong className={balance(name) >= 0 ? "danger" : "success"}>
                  {money(balance(name))}
                </strong>
              </div>
              <p className="muted">
                کار انجام‌شده: {money(totalWork(name))}
                <br />
                پرداخت: {money(totalPayments(name))}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Arta */}
      <div style={{ marginTop: 24 }}>
        <h2>🏢 آرتا پیشرو</h2>
        <div className="card">
          <div className="row">
            <div>
              <strong>🏢 آرتا پیشرو</strong>
              <p className="muted">{artaProjects.join(" • ")}</p>
            </div>
            <strong className="danger">{money(artaWork - artaPayments)}</strong>
          </div>
          <p>
            کل کار: <b>{money(artaWork)}</b>
            <br />
            پرداخت: <b>{money(artaPayments)}</b>
            <br />
            مانده: <b className="danger">{money(artaWork - artaPayments)}</b>
          </p>
        </div>
      </div>
    </>
  );
}
