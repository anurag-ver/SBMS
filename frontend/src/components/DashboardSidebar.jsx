import { NavLink } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { useMainContext } from "../context/MainContext";

export default function DashboardSidebar({ isOpen, closeSidebar }) {
  const { user, logoutHandler } = useMainContext();

  const handleLogout = () => {
    closeSidebar();
    logoutHandler();
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col bg-[#1e2678] p-5 text-white shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
        isOpen ? "translate-x-0" : ""
      }`}
    >
      <div className="border-b border-white/15 pb-6">
        <p className="text-2xl font-extrabold tracking-[0.16em]">SBMS</p>
        <p className="mt-2 text-sm text-indigo-200">Smart Banking Management</p>
      </div>

      <nav className="mt-8 flex-1 space-y-2" aria-label="Dashboard navigation">
        <NavLink
          to="/"
          onClick={closeSidebar}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              isActive ? "bg-white text-[#1e2678] shadow-lg" : "text-indigo-100 hover:bg-white/10 hover:text-white"
            }`
          }
        >
          <MdDashboard className="text-xl" />
          Dashboard
        </NavLink>
      </nav>

      <div className="border-t border-white/15 pt-5">
        <p className="truncate text-sm font-semibold">{user?.name}</p>
        <p className="mt-1 truncate text-xs text-indigo-200">{user?.email}</p>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-5 w-full rounded-xl border border-white/30 px-4 py-3 text-sm font-bold transition hover:bg-white hover:text-[#1e2678]"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
