import { Navigate, Outlet } from "react-router-dom";
import { useMainContext } from "../context/MainContext";

export default function MainLayout() {
  const { user, logoutHandler } = useMainContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <span className="text-xl font-extrabold tracking-[0.14em] text-[#1e2678]">SBMS</span>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={logoutHandler}
              className="rounded-lg border border-[#1e2678] px-4 py-2 text-sm font-semibold text-[#1e2678] transition hover:bg-[#1e2678] hover:text-white"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}
