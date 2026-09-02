import type {
  Transaction,
  Purchase,
  WorkerActivity,
  PersonalAccount,
  PersonalExpense,
  DailyReport,
  Project,
  Contractor,
} from "../hooks/useDashboardData";

interface Props {
  transactions: Transaction[];
  purchases: Purchase[];
  workerActivities: WorkerActivity[];
  personalAccounts: PersonalAccount[];
  personalExpenses: PersonalExpense[];
  dailyReports: DailyReport[];
  projects: Project[];
  contractors: Contractor[];
}

export default function LatestRecords({
  transactions,
  purchases,
  workerActivities,
  personalAccounts,
  personalExpenses,
  dailyReports,
  projects,
  contractors,
}: Props) {
  const projectsById: Record<string, string> = {};
  projects.forEach((p) => {
    projectsById[p.id] = p.name;
  });

  const contractorsById: Record<string, string> = {};
  contractors.forEach((c) => {
    contractorsById[c.id] = c.name;
  });

  type RecordItem = {
    date: string;
    type: string;
    icon: string;
    title: string;
    person: string;
    project: string;
    description: string;
    amount: number | null;
  };

  const records: RecordItem[] = [];

  transactions.forEach((item) => {
    if (item.status === "replaced") return;
    const isPayment = item.type === "payment";
    records.push({
      date: item.transaction_date || "",
      type: isPayment ? "payment" : "work",
      icon: isPayment ? "💰" : "🟢",
      title: isPayment ? "پرداخت" : "کار انجام‌شده",
      person: contractorsById[item.contractor_id] || "نامشخص",
      project: projectsById[item.project_id] || "نامشخص",
      description: item.description || "",
      amount: item.amount_rial || 0,
    });
  });

  purchases.forEach((item) => {
    records.push({
      date: item.purchase_date || "",
      type: "purchase",
      icon: "🛒",
      title: "خرید",
      person: "",
      project: projectsById[item.project_id] || "نامشخص",
      description: item.item_name || "",
      amount: item.amount_rial || 0,
    });
  });

  workerActivities.forEach((item) => {
    records.push({
      date: item.activity_date || "",
      type: "worker",
      icon: "👷",
      title: "فعالیت نیرو",
      person: item.person_name || "نامشخص",
      project: item.project_id
        ? projectsById[item.project_id] || "نامشخص"
        : "",
      description: item.description || `${item.hours || 0} ساعت`,
      amount: null,
    });
  });

  personalAccounts.forEach((item) => {
    records.push({
      date: item.account_date || "",
      type: "personal",
      icon: "👤",
      title: "حساب شخصی",
      person: item.person_name || "نامشخص",
      project: "",
      description: item.account_type || "",
      amount: item.amount_rial || 0,
    });
  });

  personalExpenses.forEach((item) => {
    records.push({
      date: item.expense_date || "",
      type: "expense",
      icon: "🛍️",
      title: "هزینه شخصی",
      person: "",
      project: "",
      description: item.item_name || "",
      amount: item.amount_rial || 0,
    });
  });

  dailyReports.forEach((item) => {
    records.push({
      date: item.report_date || "",
      type: "daily-report",
      icon: "📋",
      title: "گزارش روزانه",
      person: "",
      project: projectsById[item.project_id] || "نامشخص",
      description: item.report_text || "",
      amount: null,
    });
  });

  records.sort((a, b) => {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return 0;
  });

  const latest = records.slice(0, 10);

  if (!latest.length) {
    return <div className="empty">📭 هنوز ثبتی وجود ندارد.</div>;
  }

  return (
    <>
      {latest.map((item, i) => (
        <details
          key={i}
          className={`latest-record latest-${item.type}`}
        >
          <summary>
            <div className="latest-record-main">
              <span className="latest-record-title">
                {item.icon} {item.title}
              </span>
              {item.amount !== null && (
                <span className="latest-record-amount">
                  {new Intl.NumberFormat("fa-IR").format(item.amount || 0)} ریال
                </span>
              )}
            </div>
          </summary>
          <div className="latest-record-meta">
            {item.person && (
              <>
                👤 {item.person}
                <br />
              </>
            )}
            {item.project && (
              <>
                🏗️ پروژه: {item.project}
                <br />
              </>
            )}
            {item.description && (
              <>
                📝 {item.description}
                <br />
              </>
            )}
            📅 {formatDate(item.date)}
          </div>
        </details>
      ))}
    </>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const value = String(dateStr).slice(0, 10);
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
