import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import MainLayout from "./layout/MainLayout";
import Login from "./app/auth/Login/page";
import Register from "./app/auth/Register/page";

export default function App() {
  return (
    <div className="min-h-screen w-full">
      <ToastContainer />

      <Routes>
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={
              <section className="rounded-3xl bg-white p-7 shadow-sm sm:p-10">
                <p className="text-sm font-bold tracking-[0.16em] text-[#1e2678]">DASHBOARD</p>
                <h1 className="mt-3 text-3xl font-bold text-slate-900">Welcome to SBMS</h1>
                <p className="mt-3 text-slate-600">Your account overview will appear here as you build banking features.</p>
              </section>
            }
          />
        </Route>

        <Route path="/login" element={<><Navbar /><Login /></>} />
        <Route path="/register" element={<><Navbar /><Register /></>} />
      </Routes>
    </div>
  );
}
