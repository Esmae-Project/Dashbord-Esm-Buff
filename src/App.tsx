import { useEffect, useState } from "react";
import { useDashboardData } from "./hooks/useDashboardData";
import DashboardView from "./views/DashboardView";
import ProjectsView from "./views/ProjectsView";
import DailyReportsView from "./views/DailyReportsView";
import ContractorsView from "./views/ContractorsView";
import AccountingView from "./views/AccountingView";
import TasksView from "./views/TasksView";
import WorkerActivitiesView from "./views/WorkerActivitiesView";
import EmployersView from "./views/EmployersView";
import InventoryView from "./views/InventoryView";
import PurchasesView from "./views/PurchasesView";

const NAV_ITEMS = [
  { id: "dashboard", label: "🏠 داشبورد" },
  { id: "projects", label: "🏗️ پروژه‌ها" },
  { id: "dailyReports", label: "📋 گزارش روزانه کارگاه" },
  { id: "contractors", label: "👷 پیمانکاران" },
  { id: "accounting", label: "💰 حسابداری" },
  { id: "tasks", label: "📋 کارها" },
  { id: "workerActivities", label: "👷 فعالیت نیروها" },
  { id: "employers", label: "🏢 کارفرماها" },
  { id: "inventory", label: "📦 انبار" },
  { id: "purchases", label: "🛒 خرید" },
];

export type ViewId = (typeof NAV_ITEMS)[number]["id"];

const INITIAL_TASKS: Record<string, [string, string][]> = {
  خاوران: [
    ["اجرای نرده راه پله", "red"],
    ["کاشی کاری لابی", "yellow"],
    ["ورودی جلوی آسانسور", "yellow"],
    ["راه اندازی آسانسور", "yellow"],
    ["سقف کاذب پارکینگ", "yellow"],
    ["نصبیات برقی", "yellow"],
    ["کف حیاط", "yellow"],
    ["کف پارکینگ", "yellow"],
    ["اصلاحیه وال مش", "yellow"],
  ],
  "باغ فردوس": [
    ["اجرای وال پست های طبقات", "yellow"],
    ["اجرای دیوار های طبقات بعد اجرای وال پست", "yellow"],
  ],
  گازران: [["تمیزکاری روی آهن ها", "yellow"]],
  لاله: [],
  قطب: [["تمیزکاری و ضدزنگ زنی درب", "yellow"]],
  قونقا: [],
  همایش: [
    ["اجرای دیوار", "yellow"],
    ["سیمانکاری", "yellow"],
  ],
};

function money(num: number): string {
  return new Intl.NumberFormat("fa-IR").format(num || 0) + " ریال";
}

export default function App() {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const data = useDashboardData();

  // Theme
  useEffect(() => {
    if (localStorage.getItem("yashar-theme") === "light") {
      document.documentElement.classList.add("light");
    }
  }, []);

  function toggleTheme() {
    document.documentElement.classList.toggle("light");
    localStorage.setItem(
      "yashar-theme",
      document.documentElement.classList.contains("light") ? "light" : "dark"
    );
  }

  // Connection notice
  const noticeClass =
    data.connectionStatus === "connected"
      ? "notice success-box"
      : data.connectionStatus === "error"
        ? "notice error-box"
        : "notice";

  return (
    <div className="app">
      <header>
        <div className="header-inner">
          <div>
            <h1>
              <span className="gold-line">🏗️ داشبورد مدیریت پروژه یاشار</span>
            </h1>
            <div className="subtitle">پروژه‌ها • پیمانکاران • حسابداری • کارفرماها</div>
          </div>

          <div className="theme-toggle">
            <span className="theme-toggle-label">☀️</span>
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title="تغییر تم"
            />
            <span className="theme-toggle-label">🌙</span>
          </div>
        </div>
      </header>

      <div className={noticeClass}>{data.connectionMessage}</div>

      <nav>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={activeView === item.id ? "active" : ""}
            onClick={() => setActiveView(item.id as ViewId)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {activeView === "dashboard" && (
        <DashboardView
          projects={data.projects}
          contractors={data.contractors}
          transactions={data.transactions}
          dailyReports={data.dailyReports}
          workerActivities={data.workerActivities}
          personalAccounts={data.personalAccounts}
          personalExpenses={data.personalExpenses}
          purchases={data.purchases}
          initialTasks={INITIAL_TASKS}
          money={money}
        />
      )}
      {activeView === "projects" && (
        <ProjectsView projects={data.projects} initialTasks={INITIAL_TASKS} />
      )}
      {activeView === "dailyReports" && (
        <DailyReportsView
          reports={data.dailyReports}
          projects={data.projects}
          loading={data.loading}
        />
      )}
      {activeView === "contractors" && (
        <ContractorsView
          contractors={data.contractors}
          transactions={data.transactions}
          projects={data.projects}
          money={money}
        />
      )}
      {activeView === "accounting" && (
        <AccountingView
          contractors={data.contractors}
          transactions={data.transactions}
          projects={data.projects}
          personalAccounts={data.personalAccounts}
          personalExpenses={data.personalExpenses}
          money={money}
        />
      )}
      {activeView === "tasks" && (
        <TasksView projects={data.projects} initialTasks={INITIAL_TASKS} />
      )}
      {activeView === "workerActivities" && (
        <WorkerActivitiesView
          activities={data.workerActivities}
          projects={data.projects}
          loading={data.loading}
        />
      )}
      {activeView === "employers" && (
        <EmployersView
          projects={data.projects}
          contractors={data.contractors}
          transactions={data.transactions}
          money={money}
        />
      )}
      {activeView === "inventory" && (
        <InventoryView
          inventoryItems={data.inventoryItems}
          inventoryMovements={data.inventoryMovements}
          projects={data.projects}
          loading={data.loading}
        />
      )}
      {activeView === "purchases" && (
        <PurchasesView
          purchases={data.purchases}
          projects={data.projects}
          loading={data.loading}
        />
      )}

      <footer>
        اطلاعات حسابداری از Supabase به‌صورت آنلاین خوانده می‌شود.
        <br />
        ثبت تغییرات حسابداری فعلاً از داخل ChatGPT انجام می‌شود.
      </footer>
    </div>
  );
}
