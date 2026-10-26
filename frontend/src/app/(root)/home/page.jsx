import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MdAccountBalanceWallet,
  MdSavings,
  MdCreditCard,
  MdArrowForward,
  MdAdd,
  MdSwapHoriz,
} from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useMainContext } from "../../../context/MainContext";
import AddAmountModal from "../../../components/Amount/AddAmountModal";
import TransferModal from "../../../components/Amount/TransferModal";

export default function HomePage() {
  const { user } = useMainContext();
  const [showAmount, setShowAmount] = useState(true);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const accounts = user?.account_no || [];
  const primaryAccount = accounts[0];

  // Total balance across all accounts
  const totalAmount = accounts.length > 0
    ? accounts.reduce((acc, cur) => acc + (cur.amount || 0), 0)
    : (user?.amount ?? user?.balance ?? 0);

  const formattedAmount = totalAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedFdAmount = (user?.fd_amount ?? user?.fdAmount ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-[#1e2678] p-7 text-white shadow-xl sm:p-10">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-[0.16em] text-indigo-100 uppercase">
              Dashboard Overview
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome back, {user?.name.toUpperCase() || "User"} 👋
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
              Here is your account overview. Manage your total balance, fixed deposits, and ATM cards effortlessly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDepositOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#1e2678] shadow-md transition hover:bg-indigo-50"
            >
              <MdAdd className="text-base" /> Add Money
            </button>
            <span className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold tracking-wider text-white uppercase backdrop-blur-sm">
              {user?.acc_type ? `${user.acc_type} Account` : "Savings Account"}
            </span>
          </div>
        </div>
      </section>

      {/* 3 Main Summary Cards Section */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 1. Amount (Account Balance) Card with Show/Hide & Deposit */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-[0.14em] text-slate-500 uppercase">
                Total Amount
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAmount(!showAmount)}
                  aria-label={showAmount ? "Hide Balance" : "Show Balance"}
                  className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  title={showAmount ? "Hide balance" : "Show balance"}
                >
                  {showAmount ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
                </button>
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-[#1e2678] transition-colors group-hover:bg-[#1e2678] group-hover:text-white">
                  <MdAccountBalanceWallet className="text-2xl" />
                </div>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {showAmount ? `₹${formattedAmount}` : "₹ ••••••••"}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                {primaryAccount ? (
                  <span>
                    Primary A/C •••• {String(primaryAccount.account_no).slice(-4)} ({primaryAccount.ac_type?.toUpperCase() || "SAVINGS"})
                  </span>
                ) : (
                  <span>Available main account balance</span>
                )}
                {accounts.length > 1 && (
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-[#1e2678]">
                    +{accounts.length - 1} more
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <Link
              to="/account"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1e2678] transition hover:underline"
            >
              Manage Accounts <MdArrowForward />
            </Link>
            <button
              type="button"
              onClick={() => setIsDepositOpen(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-[#1e2678] transition hover:bg-[#1e2678] hover:text-white"
            >
              <MdAdd /> Add Money
            </button>
          </div>
        </div>

        {/* 2. FD Amount (Fixed Deposit) Card */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-[0.14em] text-slate-500 uppercase">
                FD Amount
              </span>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <MdSavings className="text-2xl" />
              </div>
            </div>

            <div className="mt-5">
              <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                ₹{formattedFdAmount}
              </p>
              <p className="mt-2 text-xs font-medium text-slate-500">
                Total invested in fixed deposits
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <Link
              to="/fix-deposit"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 transition hover:underline"
            >
              Manage Fixed Deposits <MdArrowForward />
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
              {user?.fdCount ?? 0} Active FDs
            </span>
          </div>
        </div>

        {/* 3. ATM Cards Card */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-[0.14em] text-slate-500 uppercase">
                ATM Cards
              </span>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-50 text-cyan-700 transition-colors group-hover:bg-cyan-600 group-hover:text-white">
                <MdCreditCard className="text-2xl" />
              </div>
            </div>

            <div className="mt-5">
              <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {user?.atms?.length || 1} Card
              </p>
              <p className="mt-2 text-xs font-medium text-slate-500">
                Virtual Visa Debit Card •••• 4829
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <Link
              to="/atm-cards"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 transition hover:underline"
            >
              View Card Controls <MdArrowForward />
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-bold text-cyan-700">
              Active PIN
            </span>
          </div>
        </div>
      </section>

      {/* Quick Actions Bar */}
      <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-base font-bold text-slate-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setIsTransferOpen(true)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/50"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#1e2678] text-white">
              <MdSwapHoriz className="text-xl" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Transfer Money</p>
              <p className="text-xs text-slate-500">Send money instantly</p>
            </div>
          </button>

          <Link
            to="/fix-deposit"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/50"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-700 text-white">
              <MdAdd className="text-xl" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">New Fixed Deposit</p>
              <p className="text-xs text-slate-500">Earn up to 7.5% p.a.</p>
            </div>
          </Link>

          <Link
            to="/atm-cards"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/50"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-700 text-white">
              <MdCreditCard className="text-xl" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Card PIN & Limits</p>
              <p className="text-xs text-slate-500">Manage security settings</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Add Amount Modal */}
      <AddAmountModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        defaultAccountNo={primaryAccount?.account_no}
      />

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        defaultFromAccountNo={primaryAccount?.account_no}
      />
    </div>
  );
}
