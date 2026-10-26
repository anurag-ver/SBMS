import { useState } from "react";
import {
  MdClose,
  MdSavings,
  MdWarningAmber,
  MdAccountBalance,
  MdCheckCircle,
  MdCalendarMonth,
} from "react-icons/md";
import { toast } from "react-toastify";
import { axiosClient } from "../../utils/AxiosClient";

export default function ClaimFDModal({ isOpen, onClose, fd, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !fd) return null;

  const isMatured = new Date() >= new Date(fd.maturity_date);

  // Premature estimate if before maturity
  const daysInvested = Math.max(
    1,
    Math.floor((Date.now() - new Date(fd.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  );
  const prematureInterest = Math.round(fd.amount * 0.05 * (daysInvested / 365) * 100) / 100;
  const estimatedPayout = isMatured ? fd.maturity_amount : fd.amount + prematureInterest;

  const handleClaim = async () => {
    try {
      setSubmitting(true);
      setError("");
      const token = localStorage.getItem("token");
      const { data } = await axiosClient.post(
        "/fix-deposit/claim",
        { fd_id: fd._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data?.msg || "Fixed Deposit successfully claimed & credited!");
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.msg || err.message || "Failed to claim Fixed Deposit"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formattedMaturityDate = new Date(fd.maturity_date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close modal"
        >
          <MdClose className="text-xl" />
        </button>

        <div className="flex items-center gap-3">
          <div
            className={`grid h-12 w-12 place-items-center rounded-2xl ${
              isMatured
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {isMatured ? (
              <MdCheckCircle className="text-2xl" />
            ) : (
              <MdWarningAmber className="text-2xl" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isMatured ? "Claim Matured FD" : "Premature Liquidation"}
            </h2>
            <p className="text-xs text-slate-500">
              FD Certificate #{fd.fd_number}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Principal Invested</span>
              <strong className="text-slate-800">
                ₹{(fd.amount || 0).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
              <span>Tenure & Rate</span>
              <span className="font-semibold text-slate-700">
                {fd.months} Months @ {fd.interest_rate}% p.a.
              </span>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MdCalendarMonth className="text-xs" /> Maturity Date
              </span>
              <span className="font-semibold text-slate-700">
                {formattedMaturityDate}
              </span>
            </div>

            <div className="mt-3 border-t border-slate-200/80 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Estimated Payout:
                </span>
                <span className="text-lg font-extrabold text-emerald-700">
                  ₹{Math.round(estimatedPayout).toLocaleString("en-IN")}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Payout will be instantly credited to your linked SBMS Bank Account.
              </p>
            </div>
          </div>

          {!isMatured && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800">
              <strong>Early Withdrawal Notice:</strong> Liquidating before the maturity
              date calculates interest at premature savings rate (5.0% p.a. pro-rata).
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Keep FD Active
            </button>
            <button
              type="button"
              onClick={handleClaim}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1e2678] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#171d60] disabled:opacity-60"
            >
              {submitting ? "Processing..." : "Confirm & Credit to Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
