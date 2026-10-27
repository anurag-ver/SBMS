import { useState, useEffect } from "react";
import {
  MdClose,
  MdTune,
  MdCheckCircle,
  MdInfoOutline,
  MdLocalAtm,
  MdShoppingBag,
  MdWifi,
  MdPublic,
} from "react-icons/md";
import { toast } from "react-toastify";
import { axiosClient } from "../../utils/AxiosClient";

export default function CardLimitsModal({ isOpen, onClose, card, onSuccess }) {
  const [atmLimit, setAtmLimit] = useState(25000);
  const [onlineLimit, setOnlineLimit] = useState(50000);
  const [contactless, setContactless] = useState(true);
  const [international, setInternational] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (card) {
      setAtmLimit(card.daily_atm_limit ?? 25000);
      setOnlineLimit(card.daily_online_limit ?? 50000);
      setContactless(card.contactless_enabled ?? true);
      setInternational(card.international_enabled ?? false);
    }
  }, [card, isOpen]);

  if (!isOpen || !card) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const { data } = await axiosClient.post(
        "/atm-card/update-limits",
        {
          card_id: card._id,
          daily_atm_limit: Number(atmLimit),
          daily_online_limit: Number(onlineLimit),
          contactless_enabled: contactless,
          international_enabled: international,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data?.msg || "Card limits & security updated!");
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "Failed to update card limits");
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
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close modal"
        >
          <MdClose className="text-xl" />
        </button>

        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-[#1e2678]">
            <MdTune className="text-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Card Controls & Limits</h2>
            <p className="text-xs text-slate-500">
              Card •••• {card.card_number ? card.card_number.slice(-4) : "0000"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            <MdInfoOutline className="text-base shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Daily ATM Limit Slider */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <MdLocalAtm className="text-base text-indigo-700" />
                Daily ATM Cash Withdrawal Limit
              </span>
              <span className="text-sm font-extrabold text-[#1e2678]">
                ₹{Number(atmLimit).toLocaleString("en-IN")}
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="100000"
              step="5000"
              value={atmLimit}
              onChange={(e) => setAtmLimit(e.target.value)}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-indigo-200 accent-[#1e2678]"
            />
            <div className="mt-1 flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Min: ₹5,000</span>
              <span>Max: ₹1,00,000</span>
            </div>
          </div>

          {/* Daily Online/POS Limit Slider */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <MdShoppingBag className="text-base text-emerald-700" />
                Daily Online / E-Commerce & POS Limit
              </span>
              <span className="text-sm font-extrabold text-emerald-700">
                ₹{Number(onlineLimit).toLocaleString("en-IN")}
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="200000"
              step="5000"
              value={onlineLimit}
              onChange={(e) => setOnlineLimit(e.target.value)}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-emerald-200 accent-emerald-600"
            />
            <div className="mt-1 flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Min: ₹5,000</span>
              <span>Max: ₹2,00,000</span>
            </div>
          </div>

          {/* Security Toggles */}
          <div className="space-y-3">
            {/* Contactless */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-3.5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-[#1e2678]">
                  <MdWifi className="rotate-90 text-xl" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Contactless (Tap & Pay)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Allow tap payments up to ₹5,000 without entering PIN
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setContactless(!contactless)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  contactless ? "bg-[#1e2678]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    contactless ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* International */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-3.5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
                  <MdPublic className="text-xl" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    International Transactions
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Allow foreign currency usage & overseas ATM withdrawals
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInternational(!international)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  international ? "bg-cyan-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    international ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1e2678] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#171d60] disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
