import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  MdHome,
  MdArrowBack,
  MdShield,
  MdAccountBalance,
  MdSavings,
  MdReceiptLong,
  MdCreditCard,
  MdPhoneInTalk,
  MdLockOutline,
} from "react-icons/md";

export default function ErrorPage({
  errorCode = 404,
  title = "Page Not Located in the Vault",
  message = "The banking page, transaction ledger, or portal endpoint you are looking for doesn't exist, was relocated, or is temporarily restricted.",
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const quickLinks = [
    { label: "Dashboard", to: "/", icon: MdHome, desc: "Account balance & summary" },
    { label: "Accounts", to: "/account", icon: MdAccountBalance, desc: "Manage accounts & deposit" },
    { label: "Fixed Deposit", to: "/fix-deposit", icon: MdSavings, desc: "High-yield investment plans" },
    { label: "Transactions", to: "/transactions", icon: MdReceiptLong, desc: "Statement & digital receipts" },
    { label: "ATM Cards", to: "/atm-cards", icon: MdCreditCard, desc: "Virtual debit cards & PIN" },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#f6f8fc] px-4 py-12 text-slate-800">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -left-20 top-20 h-96 w-96 rounded-full bg-[#1e2678]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      <main className="relative z-10 w-full max-w-2xl text-center">
        {/* Brand Shield Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-1.5 text-xs font-bold tracking-[0.16em] text-[#1e2678] shadow-sm">
          <MdShield className="text-base text-indigo-700" />
          <span>SBMS SECURITY PROTOCOL</span>
        </div>

        {/* 404 Hologram Illustration Box */}
        <div className="relative mx-auto mt-6 flex h-48 w-48 items-center justify-center">
          {/* Pulsing circular rings */}
          <div className="absolute inset-0 animate-ping rounded-full bg-indigo-100/60 duration-1000" />
          <div className="absolute inset-2 rounded-full border border-indigo-200 bg-gradient-to-tr from-indigo-50 to-white shadow-xl" />

          {/* Center Graphic */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <span className="font-mono text-6xl font-black tracking-tight text-[#1e2678] drop-shadow-sm">
              {errorCode}
            </span>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              <MdLockOutline className="text-xs" />
              <span>Vault Route Lost</span>
            </div>
          </div>
        </div>

        {/* Error Headline & Explanation */}
        <h1 className="mt-6 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
          {message}
        </p>

        {/* Path Diagnostic Pill */}
        {location?.pathname && (
          <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3.5 py-1.5 font-mono text-xs text-slate-500 shadow-inner">
            <span className="font-semibold text-slate-400">Path:</span>
            <span className="text-rose-600 font-bold truncate max-w-xs">{location.pathname}</span>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
          >
            <MdArrowBack className="text-lg" /> Go Back
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#1e2678] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-950/20 transition hover:bg-[#171d60]"
          >
            <MdHome className="text-lg" /> Dashboard Home
          </Link>
        </div>

        {/* Quick Portal Navigation Links */}
        <div className="mt-12 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7 text-left">
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Quick Vault Access
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex items-center gap-3.5 rounded-2xl border border-slate-100 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-[#1e2678]">
                    <Icon className="text-xl" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.label}</p>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Customer Care Footer */}
          <div className="mt-6 flex flex-wrap items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <MdPhoneInTalk className="text-base text-indigo-700" />
              Need Help? 24x7 Helpline: 1800-123-SBMS
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Protocol: SBMS-TLS-v1.3
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
