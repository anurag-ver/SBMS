import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import MainLayout from "./layout/MainLayout";
import Login from "./app/auth/Login/page";
import Register from "./app/auth/Register/page";

import HomePage from "./app/(root)/home/page";
import AccountPage from "./app/(root)/account/page";
import FixDepositPage from "./app/(root)/fix-deposit/page";
import TransactionsPage from "./app/(root)/transactions/page";
import AtmCardsPage from "./app/(root)/atm-cards/page";

export default function App() {
  return (
    <div className="min-h-screen w-full">
      <ToastContainer />

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/amount" element={<AccountPage />} />
          <Route path="/fix-deposit" element={<FixDepositPage />} />
          <Route path="/fd-amount" element={<FixDepositPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/atm-cards" element={<AtmCardsPage />} />
        </Route>

        <Route path="/login" element={<><Navbar /><Login /></>} />
        <Route path="/register" element={<><Navbar /><Register /></>} />
      </Routes>
    </div>
  );
}
