import { useState } from "react";
import {
  MdClose,
  MdLocalAtm,
  MdAccountBalance,
  MdCheckCircle,
  MdInfoOutline,
  MdPrint,
} from "react-icons/md";
import { toast } from "react-toastify";
import { axiosClient } from "../../utils/AxiosClient";
import { useMainContext } from "../../context/MainContext";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export default function AtmWithdrawalModal({ isOpen, onClose, card, onSuccess }) {
  const { fetchUserProfile } = useMainContext();
  const [amount, setAmount] = useState(1000);
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  if (!isOpen || !card) return null;

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError("");

    const numAmount = Number(amount);
    if (!numAmount || numAmount < 100) {
      setError("Minimum withdrawal amount is ₹100");
      return;
    }
    if (numAmount % 100 !== 0) {
      setError("Amount must be a multiple of ₹100 (e.g. ₹500, ₹1000)");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError("Please enter your 4-digit ATM PIN");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const { data } = await axiosClient.post(
        "/atm-card/withdraw",
        {
          card_id: card._id,
          amount: numAmount,
          pin,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data?.msg || "Cash dispensed successfully!");
      setReceipt(data);
      fetchUserProfile?.();
      onSuccess?.();
    } catch (err) {
      setError(
        err.response?.data?.msg || err.message || "ATM Cash withdrawal failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setReceipt(null);
    setPin("");
    setError("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close modal"
        >
          <MdClose className="text-xl" />
        </button>

        {!receipt ? (
          <>
            {/* ATM Machine Header */}
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                <MdLocalAtm className="text-2xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">ATM Cash Withdrawal</h2>
                <p className="text-xs text-slate-500">
                  Simulate live cash withdrawal using your ATM card & PIN
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                <MdInfoOutline className="text-base shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleWithdraw} className="mt-6 space-y-4">
              {/* Linked Card & Account Info */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Card Used:</span>
                  <span className="font-bold text-slate-800">
                    {card.card_network} (•••• {card.card_number ? card.card_number.slice(-4) : "0000"})
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-slate-200/60 pt-2">
                  <span className="flex items-center gap-1">
                    <MdAccountBalance className="text-slate-400" /> Linked Account:
                  </span>
                  <span className="font-bold text-indigo-900">
                    A/C {card.account?.account_no || "Primary"} (₹
                    {(card.account?.amount || 0).toLocaleString("en-IN")})
                  </span>
                </div>
              </div>

              {/* Amount Selection */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
                    Withdrawal Amount (₹)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Max: ₹{(card.daily_atm_limit || 25000).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount (multiples of 100)"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-8 pr-4 text-base font-bold text-slate-800 transition focus:border-[#1e2678] focus:outline-none focus:ring-2 focus:ring-[#1e2678]/10"
                  />
                </div>

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
                      ₹{val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </div>
              </div>

              {/* ATM PIN Input */}
              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
                  Enter 4-Digit ATM PIN
                </label>
                <div className="relative mt-2">
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center tracking-[0.6em] font-mono text-xl font-bold rounded-xl border border-slate-200 py-3 transition focus:border-[#1e2678] focus:outline-none focus:ring-2 focus:ring-[#1e2678]/10"
                  />
                </div>
                <p className="mt-1 text-center text-[10px] text-slate-400">
                  Default PIN for auto-issued cards is 1234
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {submitting ? "Dispensing Cash..." : "Dispense Cash ₹" + amount}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* ================= ATM DIGITAL RECEIPT ================= */
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                <MdCheckCircle className="text-3xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Cash Dispensed!</h2>
                <p className="text-xs text-slate-500">Please collect your cash from the slot</p>
              </div>
            </div>

            {/* Receipt Paper Design */}
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-5 font-mono text-xs shadow-inner">
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <p className="text-sm font-extrabold tracking-widest text-[#1e2678]">SBMS ATM NETWORK</p>
                <p className="text-[10px] text-slate-500">TERMINAL: SBMS-ATM-0492</p>
                <p className="text-[10px] text-slate-500">
                  {new Date(receipt.date || Date.now()).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="py-3 space-y-2 border-b border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">CARD NUMBER:</span>
                  <span className="font-bold">•••• •••• •••• {receipt.cardLast4}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ACCOUNT NUMBER:</span>
                  <span className="font-bold">A/C {receipt.accountNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TXN REF ID:</span>
                  <span className="font-bold text-[10px] truncate max-w-[170px]">{receipt.transactionId}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-slate-700 text-sm">AMOUNT DISPENSED:</span>
                  <span className="font-extrabold text-emerald-700 text-base">
                    ₹{Number(receipt.withdrawnAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex justify-between text-slate-600">
                <span>AVAILABLE BAL:</span>
                <span className="font-bold">
                  ₹{Number(receipt.remainingBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <p className="mt-4 text-center text-[10px] text-slate-400">
                THANK YOU FOR BANKING WITH SBMS!
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                <MdPrint className="text-base" /> Print Receipt
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl bg-[#1e2678] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#171d60]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
