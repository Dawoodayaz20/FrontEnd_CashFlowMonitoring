import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { SignOut } from "./authentication/authMethods";
import AddTransactionModal from "./components/transactionModal/addTransaction";
import useTransactionStore from "./store/useTransactionStore";
import useAuthStore from "./store/useAuthStore";
import { getInitials } from "./pages/ProfilePage/profilePage";
import useSettingsStore from "./store/useSettingsStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TransactionForm {
  type: "income" | "expense";
  amount: string;
  category: string;
  date: string;
  note: string;
  isRecurring: boolean;
  frequency: "weekly" | "monthly" | "yearly";
  endDate: string;
}

// ─── Nav Config ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: "▦"  },
  { label: "Income",    path: "/income",    icon: "💰"  },
  { label: "Expense",   path: "/expense",   icon: "💸"  },
  { label: "Forecast",  path: "/forecast",  icon: "📈"  },
  { label: "Settings",  path: "/settings",  icon: "⚙️"  },
  { label: "Profile",   path: "/profile",   icon: "👤"  },
];

// ─── Page title map ───────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  "/dashboard": { title: "Cash Flow Monitor", sub: "Overview"         },
  "/income":    { title: "Income",            sub: "Manage your income"    },
  "/expense":   { title: "Expenses",          sub: "Track your spending"   },
  "/forecast":  { title: "Forecast",          sub: "Future projections"    },
  "/settings":  { title: "Settings",          sub: "App preferences"       },
  "/profile":   { title: "Profile",           sub: "Your account"          },
};

// ─── AppLayout ────────────────────────────────────────────────────────────────

const AppLayout: React.FC = () => {
  const [collapsed,  setCollapsed]  = useState<boolean>(true);
  const [modalOpen,  setModalOpen]  = useState<boolean>(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { addTransaction } = useTransactionStore();
  const { user } = useAuthStore();
  const { fetchSettings } = useSettingsStore();

  const initials = getInitials(user?.name)

  useEffect(() => {
    fetchSettings();
  }, [])

  const pageInfo  = PAGE_TITLES[location.pathname] ?? { title: "Cash Flow Monitor", sub: "Overview" };

  const handleTransactionSubmit = async (data: TransactionForm) => {
    console.log("New transaction:", data);
    await addTransaction(data);
    // → wire to useTransactionStore later
  };

  return (
    <div className="flex w-full h-screen bg-gray-50 overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={`
          ${collapsed ? "w-16" : "w-60"}
          shrink-0 bg-white border-r border-gray-100 shadow-sm
          flex flex-col transition-all duration-300 ease-in-out overflow-hidden
        `}
      >
        {/* Avatar + toggle */}
        <div className="flex flex-col items-center pt-5 pb-4 border-b border-gray-100 px-2">
          <div
            className="rounded-full flex items-center justify-center text-white font-bold shadow-md mb-2 shrink-0 transition-all duration-300"
            style={{
              width:      collapsed ? 36 : 52,
              height:     collapsed ? 36 : 52,
              fontSize:   collapsed ? 16 : 22,
              background: "linear-gradient(135deg, #0f766e, #14b8a6)",
            }}
          >{
            user ?
            `${initials}`
          :
          "😊"}
          </div>

          {!collapsed && (
            <span className="text-sm font-semibold text-gray-700 mt-1 mb-0.5 truncate w-full text-center">
              {
              user ?
              `${user?.name}`
              :
              "Name"
              }
            </span>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mt-2 w-7 h-7 rounded-lg bg-gray-100 hover:bg-teal-50 hover:text-teal-600 flex items-center justify-center text-gray-400 text-sm transition"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-2 py-4 flex-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-2 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150
                ${collapsed ? "justify-center" : "justify-start"}
                ${isActive
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-2 pb-5">
          <button
            onClick={() => SignOut(navigate)}
            className={`
              w-full flex items-center gap-3 px-2 py-2.5 rounded-xl
              text-sm font-medium text-rose-500 hover:bg-rose-50 transition
              ${collapsed ? "justify-center" : "justify-start"}
            `}
            title={collapsed ? "Sign Out" : undefined}
          >
            <span className="text-base shrink-0">🚪</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Right side: top header + page content ───────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Top Header */}
        <header className="shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              {pageInfo.sub}
            </p>
            <h1 className="text-xl font-bold text-gray-800">
              {pageInfo.title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Date */}
            <span className="text-sm text-gray-400 hidden md:block">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month:   "long",
                day:     "numeric",
              })}
            </span>

            {/* Add Transaction — global CTA */}
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white shadow-md hover:opacity-90 active:scale-95 transition-all"
              style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)" }}
            >
              <span className="text-base leading-none">+</span>
              Add Transaction
            </button>
          </div>
        </header>

        {/* Page content — Outlet renders the matched child route here */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Global Add Transaction Modal ─────────────────────────────────────── */}
      <AddTransactionModal
        transactType='income'
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleTransactionSubmit}
      />
    </div>
  );
};

export default AppLayout;