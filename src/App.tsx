import { useEffect, useState } from "react";
import { useDashboardData } from "./hooks/useDashboardData";
import { useIsMobile } from "./hooks/useIsMobile";
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
import PersianClock from "./components/PersianClock";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const data = useDashboardData();

  const currentLabel =
    NAV_ITEMS.find((i) => i.id === activeView)?.label ?? "داشبورد";

  function go(view: ViewId) {
    setActiveView(view);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  }

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

  /* ================= DESKTOP LAYOUT ================= */
  if (!isMobile) {
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

            <PersianClock />

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
              onClick={() => go(item.id as ViewId)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {renderView()}

        <footer>
          اطلاعات حسابداری از Supabase به‌صورت آنلاین خوانده می‌شود.
          <br />
          ثبت تغییرات حسابداری فعلاً از داخل ChatGPT انجام می‌شود.
        </footer>
      </div>
    );
  }

  /* ================= MOBILE LAYOUT ================= */
  return (
    <div className="app mobile-app">
      <header className="mobile-header">
        <div className="mobile-header-top">
          <button
            className="icon-btn"
            onClick={() => setMenuOpen(true)}
            title="منو"
          >
            ☰
          </button>
          <div className="mobile-title">داشبورد یاشار</div>
          <button
            className="icon-btn"
            onClick={toggleTheme}
            title="تغییر تم"
          >
            🌓
          </button>
        </div>
        <div className="mobile-clock"><PersianClock /></div>
      </header>

      <div className={noticeClass}>{data.connectionMessage}</div>

      {/* عنوان صفحه فعلی */}
      <div className="mobile-current-page">{currentLabel}</div>

      {renderView()}

      {/* Drawer منو */}
      {menuOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setMenuOpen(false)} />
          <aside className="drawer">
            <div className="drawer-header">
              <span className="drawer-title">🏗️ داشبورد یاشار</span>
              <button className="icon-btn" onClick={() => setMenuOpen(false)}>
                ✕
              </button>
            </div>
            <nav className="drawer-nav">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  className={
                    "drawer-item" + (activeView === item.id ? " active" : "")
                  }
                  onClick={() => go(item.id as ViewId)}
                >
                  <span>{item.label}</span>
                  {activeView === item.id && <span className="drawer-arrow">◂</span>}
                </button>
              ))}
            </nav>
          </aside>
        </>
      )}

      {/* تب‌بار پایین — ۴ بخش اصلی */}
      <nav className="bottom-tabs">
        {(
          [
            { id: "dashboard", label: "داشبورد", icon: "🏠" },
            { id: "contractors", label: "پیمانکار", icon: "👷" },
            { id: "accounting", label: "حسابداری", icon: "💰" },
            { id: "purchases", label: "خرید", icon: "🛒" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            className={
              "bottom-tab" + (activeView === tab.id ? " active" : "")
            }
            onClick={() => go(tab.id as ViewId)}
          >
            <span className="bottom-tab-icon">{tab.icon}</span>
            <span className="bottom-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );

  function renderView() {
    return (
      <>
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
        <ProjectsView projects={data.projects} initialTasks={INITIAL_TASKS} refresh={data.refresh} />
      )}
      {activeView === "dailyReports" && (
        <DailyReportsView
          reports={data.dailyReports}
          projects={data.projects}
          loading={data.loading}
          refresh={data.refresh}
        />
      )}
      {activeView === "contractors" && (
        <ContractorsView
          contractors={data.contractors}
          transactions={data.transactions}
          projects={data.projects}
          money={money}
          refresh={data.refresh}
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
          refresh={data.refresh}
        />
      )}
      {activeView === "tasks" && (
        <TasksView projects={data.projects} initialTasks={INITIAL_TASKS} refresh={data.refresh} />
      )}
      {activeView === "workerActivities" && (
        <WorkerActivitiesView
          activities={data.workerActivities}
          projects={data.projects}
          loading={data.loading}
          refresh={data.refresh}
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
          refresh={data.refresh}
        />
      )}
      {activeView === "purchases" && (
        <PurchasesView
          purchases={data.purchases}
          projects={data.projects}
          loading={data.loading}
          refresh={data.refresh}
        />
      )}
      </>
    );
  }
}
