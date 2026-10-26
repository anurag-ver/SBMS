import { useState, useEffect } from "react";
import {
  MdClose,
  MdSavings,
  MdAccountBalance,
  MdCalendarMonth,
  MdCheckCircle,
  MdTrendingUp,
  MdInfoOutline,
} from "react-icons/md";
import { toast } from "react-toastify";
import { axiosClient } from "../../utils/AxiosClient";
import { useMainContext } from "../../context/MainContext";

const TENURE_OPTIONS = [
  { months: 6, label: "6 Months", rate: 6.5, badge: "Short Term" },
  { months: 12, label: "1 Year (12M)", rate: 7.0, badge: "Popular", highlight: true },
  { months: 24, label: "2 Years (24M)", rate: 7.5, badge: "Steady" },
  { months: 36, label: "3 Years (36M)", rate: 7.8, badge: "Growth" },
  { months: 60, label: "5 Years (60M)", rate: 8.2, badge: "Max Yield" },
];

const QUICK_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

export default function CreateFDModal({
  isOpen,
  onClose,
  onSuccess,
  prefillAmount = 10000,
  prefillMonths = 12,
}) {
  const { user } = useMainContext();
  const accounts = user?.account_no || [];

  const [accountNo, setAccountNo] = useState("");
  const [amount, setAmount] = useState(prefillAmount);
  const [months, setMonths] = useState(prefillMonths);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (accounts.length > 0 && !accountNo) {
      setAccountNo(String(accounts[0].account_no));
    }
  }, [accounts, accountNo]);

  useEffect(() => {
    if (prefillAmount) setAmount(prefillAmount);
    if (prefillMonths) setMonths(prefillMonths);
  }, [prefillAmount, prefillMonths, isOpen]);

  if (!isOpen) return null;

  const selectedAccount = accounts.find(
    (acc) => String(acc.account_no) === String(accountNo)
  );
  const availableBalance = selectedAccount?.amount || 0;

  const currentPlan =
    TENURE_OPTIONS.find((t) => t.months === Number(months)) || TENURE_OPTIONS[1];
  const interestRate = currentPlan.rate;

  const numAmount = Number(amount) || 0;
  const t = Number(months) / 12;
  const calculatedMaturity =
    numAmount > 0 ? Math.round(numAmount * Math.pow(1 + interestRate / 400, 4 * t)) : 0;
  const calculatedInterest = Math.max(0, calculatedMaturity - numAmount);

  // Estimated maturity date
  const maturityDate = new Date();
  maturityDate.setMonth(maturityDate.getMonth() + Number(months));
  const formattedMaturityDate = maturityDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (!accountNo) {
      setError("Please select a funding bank account");
      return;
    }

    if (!numAmount || numAmount < 1000) {
      setError("Minimum investment for Fixed Deposit is ₹1,000");
      return;
    }

    if (numAmount > availableBalance) {
      setError(
        `Insufficient balance in A/C ${accountNo}. Available: ₹${availableBalance.toLocaleString("en-IN")}`
      );
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const { data } = await axiosClient.post(
        "/fix-deposit/create",
        {
          account_no: accountNo,
          amount: numAmount,
          months: Number(months),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data?.msg || "Fixed Deposit opened successfully!");
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.msg || err.message || "Failed to create Fixed Deposit"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close modal"
        >
          <MdClose className="text-xl" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
            <MdSavings className="text-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Open Fixed Deposit (FD)
            </h2>
            <p className="text-xs text-slate-500">
              Lock in guaranteed returns compounded quarterly
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            <MdInfoOutline className="text-base shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="mt-6 space-y-5">
          {/* Funding Account Selector */}
          <div>
            <label className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
              Debit From Account
            </label>
            <div className="mt-2">
              <select
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition focus:border-[#1e2678] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e2678]/10"
              >
                {accounts.map((acc) => (
                  <option key={acc._id || acc.account_no} value={acc.account_no}>
                    A/C {acc.account_no} ({acc.ac_type || "Savings"}) — ₹
                    {(acc.amount || 0).toLocaleString("en-IN")} available
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500">
              <MdAccountBalance className="text-xs text-indigo-700" />
              Available for investment:{" "}
              <span className="font-bold text-slate-700">
                ₹{availableBalance.toLocaleString("en-IN")}
              </span>
            </p>
          </div>

          {/* Deposit Amount Input */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Deposit Amount (₹)
              </label>
              <span className="text-[11px] text-slate-400">Min: ₹1,000</span>
            </div>

            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min="1000"
                step="500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter deposit amount"
                className="w-full rounded-xl border border-slate-200 py-3 pl-8 pr-4 text-base font-bold text-slate-800 transition focus:border-[#1e2678] focus:outline-none focus:ring-2 focus:ring-[#1e2678]/10"
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="mt-2.5 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    Number(amount) === val
                      ? "bg-[#1e2678] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  ₹{val >= 100000 ? `${val / 100000}L` : `${val / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          {/* Tenure Selection */}
          <div>
            <label className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
              Select Tenure Period
            </label>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {TENURE_OPTIONS.map((opt) => {
                const isSelected = Number(months) === opt.months;
                return (
                  <button
                    type="button"
                    key={opt.months}
                    onClick={() => setMonths(opt.months)}
                    className={`relative flex flex-col items-start rounded-2xl border p-3 text-left transition ${
                      isSelected
                        ? "border-[#1e2678] bg-indigo-50/50 shadow-sm ring-2 ring-[#1e2678]/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800">
                      {opt.label}
                    </span>
                    <span className="mt-1 text-sm font-extrabold text-emerald-700">
                      {opt.rate}% <span className="text-[10px] font-normal text-slate-500">p.a.</span>
                    </span>
                    <span
                      className={`mt-2 inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        isSelected
                          ? "bg-[#1e2678] text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {opt.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Returns Preview Card */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-emerald-50/40 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <MdTrendingUp className="text-emerald-600" /> Projected Returns
              </span>
              <span className="flex items-center gap-1">
                <MdCalendarMonth className="text-indigo-600" /> Matures on:{" "}
                <strong className="text-slate-800">{formattedMaturityDate}</strong>
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-indigo-100/70 pt-3 text-center">
              <div>
                <p className="text-[11px] text-slate-500">Principal</p>
                <p className="mt-0.5 text-sm font-bold text-slate-800">
                  ₹{numAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-emerald-700">Interest Earned</p>
                <p className="mt-0.5 text-sm font-extrabold text-emerald-700">
                  +₹{calculatedInterest.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-indigo-900">Total Maturity</p>
                <p className="mt-0.5 text-base font-extrabold text-[#1e2678]">
                  ₹{calculatedMaturity.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1e2678] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#171d60] disabled:opacity-60"
            >
              {submitting ? (
                <>Opening Deposit...</>
              ) : (
                <>
                  <MdCheckCircle className="text-lg" />
                  Confirm & Open FD
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
