import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";
import { useMainContext } from "../context/MainContext";

export default function MainLayout() {
  const { user } = useMainContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#f7f8fc] text-slate-900">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <DashboardSidebar
        isOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
      />

      <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
        <button
          type="button"
          aria-label="Open sidebar"
          className="mb-8 rounded-xl bg-[#1e2678] p-3 text-white shadow-lg lg:hidden"
          onClick={() => setIsSidebarOpen(true)}
        >
          <span className="block h-0.5 w-5 bg-white" />
          <span className="mt-1 block h-0.5 w-5 bg-white" />
          <span className="mt-1 block h-0.5 w-5 bg-white" />
        </button>
        <Outlet />
      </main>
    </div>
  );
}
