import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MdAccountBalance,
  MdAdd,
  MdSwapHoriz,
  MdContentCopy,
  MdCheck,
  MdArrowUpward,
  MdCreditCard,
  MdLockOutline,
} from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useMainContext } from "../../../context/MainContext";
import AddAmountModal from "../../../components/Amount/AddAmountModal";
import AddAccountModal from "../../../components/Amount/AddAccountModal";
import TransferModal from "../../../components/Amount/TransferModal";

export default function AccountPage() {
  const { user, fetchUserProfile } = useMainContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [copiedAccNo, setCopiedAccNo] = useState(null);
  const [selectedAccForDeposit, setSelectedAccForDeposit] = useState(null);
  const [selectedAccForTransfer, setSelectedAccForTransfer] = useState(null);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      toast.success("Payment verified! Funds have been added to your account.");
      fetchUserProfile();
      setSearchParams({}, { replace: true });
    } else if (paymentStatus === "failed") {
      toast.error(searchParams.get("msg") || "Razorpay payment failed or was cancelled.");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const accounts = user?.account_no || [];

  const totalBalance = accounts.reduce((acc, cur) => acc + (cur.amount || 0), 0);

  const handleCopy = (accNo) => {
    navigator.clipboard.writeText(String(accNo));
    setCopiedAccNo(accNo);
    toast.info(`Account number ${accNo} copied to clipboard!`);
    setTimeout(() => setCopiedAccNo(null), 2500);
  };

  const openDeposit = (accNo) => {
    setSelectedAccForDeposit(accNo);
    setIsDepositOpen(true);
  };

  const openTransfer = (accNo) => {
    setSelectedAccForTransfer(accNo);
    setIsTransferOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Top Header / Account Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-[#1e2678] p-7 text-white shadow-xl sm:p-10">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-[0.16em] text-indigo-100 uppercase backdrop-blur-sm">
              SBMS Bank Accounts
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Amount & Accounts
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
              View your bank accounts, deposit instant funds, and manage multiple accounts under one login.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openDeposit(accounts[0]?.account_no)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#1e2678] shadow-lg transition hover:bg-indigo-50"
            >
              <MdAdd className="text-lg" /> Add Money
            </button>
            <button
              type="button"
              onClick={() => setIsNewAccountOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-[#1e2678]"
            >
              <MdAccountBalance className="text-lg" /> + Open Account
            </button>
          </div>
        </div>

        {/* Aggregate Stats Bar */}
        <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 border-t border-white/15 pt-6 sm:grid-cols-3">
          <div>
            <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">
              Total Combined Balance
            </p>
            <p className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
              ₹{totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">
              Total Active Accounts
            </p>
            <p className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
              {accounts.length} {accounts.length === 1 ? "Account" : "Accounts"}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">
              IFSC Code
            </p>
            <p className="mt-1 text-xl font-bold tracking-wider text-indigo-100 sm:text-2xl">
              SBMS0001024
            </p>
          </div>
        </div>
      </section>

      {/* Account Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Your Bank Accounts</h2>
          <span className="text-xs font-semibold text-slate-500">
            {accounts.length} registered {accounts.length === 1 ? "account" : "accounts"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* Render Each Account Card */}
          {accounts.map((cur, i) => (
            <AccountCard
              key={cur._id || cur.account_no || i}
              account={cur}
              isCopied={copiedAccNo === cur.account_no}
              onCopy={() => handleCopy(cur.account_no)}
              onAddMoney={() => openDeposit(cur.account_no)}
              onTransfer={() => openTransfer(cur.account_no)}
            />
          ))}

          {/* "+ Add New Account" Dashed Card (Inspiration Style) */}
          <div
            onClick={() => setIsNewAccountOpen(true)}
            className="group flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-indigo-200 bg-white p-8 text-center transition-all duration-300 hover:border-[#1e2678] hover:bg-indigo-50/40 hover:shadow-lg"
          >
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-[#1e2678] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#1e2678] group-hover:text-white">
              <MdAdd className="text-3xl" />
            </div>
            <h3 className="mt-5 text-base font-bold text-slate-900 group-hover:text-[#1e2678]">
              Open New Account
            </h3>
            <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500">
              Add a new Savings or Current account to your profile with zero paperwork.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-indigo-100/70 px-3 py-1 text-xs font-bold text-[#1e2678]">
              + Instant Setup
            </span>
          </div>
        </div>
      </section>

      {/* Modals */}
      <AddAmountModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        defaultAccountNo={selectedAccForDeposit}
      />

      <AddAccountModal
        isOpen={isNewAccountOpen}
        onClose={() => setIsNewAccountOpen(false)}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        defaultFromAccountNo={selectedAccForTransfer}
      />
    </div>
  );
}

// Individual Account Card Component with Show/Hide toggle & quick controls
function AccountCard({ account, isCopied, onCopy, onAddMoney, onTransfer }) {
  const [isShow, setIsShow] = useState(true);

  const formattedBalance = (account?.amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const accountTypeLabel = account?.ac_type === "current" ? "Current Account" : "Savings Account";

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7">
      {/* Top Brand Banner */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#1e2678] text-white font-extrabold text-xs">
              SB
            </div>
            <span className="text-sm font-extrabold tracking-wider text-slate-800">
              SBMS BANK
            </span>
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
              account?.ac_type === "current"
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {accountTypeLabel}
          </span>
        </div>

        {/* Account Number with Copy */}
        <div className="mt-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Account Number
          </span>
          <div className="mt-1 flex items-center justify-between">
            <p className="font-mono text-base font-bold tracking-wider text-slate-900">
              {account?.account_no}
            </p>
            <button
              type="button"
              onClick={onCopy}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              title="Copy account number"
            >
              {isCopied ? (
                <>
                  <MdCheck className="text-emerald-600" /> Copied
                </>
              ) : (
                <>
                  <MdContentCopy className="text-slate-400" /> Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Balance Display with Eye Toggle */}
        <div className="mt-5 rounded-2xl bg-slate-50/80 p-4 border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Available Balance</span>
            <button
              type="button"
              onClick={() => setIsShow(!isShow)}
              className="inline-flex items-center gap-1.5 rounded-lg text-xs font-bold text-[#1e2678] transition hover:underline"
            >
              {isShow ? (
                <>
                  <FaEyeSlash /> Hide
                </>
              ) : (
                <>
                  <FaEye /> Show
                </>
              )}
            </button>
          </div>
          <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {isShow ? `₹${formattedBalance}` : "₹ ••••••••"}
          </p>
        </div>
      </div>

      {/* Card Action Buttons (Inspiration Style) */}
      <div className="mt-6 flex items-center gap-2 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onAddMoney}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1e2678] py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-[#171d60]"
        >
          <MdAdd className="text-base" /> Add Money
        </button>
        <button
          type="button"
          onClick={onTransfer}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:border-indigo-200 hover:text-[#1e2678]"
        >
          <MdSwapHoriz className="text-base" /> Transfer
        </button>
      </div>
    </div>
  );
}
