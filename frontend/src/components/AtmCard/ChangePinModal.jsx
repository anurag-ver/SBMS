import { useState } from "react";
import {
  MdClose,
  MdVpnKey,
  MdCheckCircle,
  MdInfoOutline,
} from "react-icons/md";
import { toast } from "react-toastify";
import { axiosClient } from "../../utils/AxiosClient";

export default function ChangePinModal({ isOpen, onClose, card, onSuccess }) {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !card) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{4}$/.test(oldPin)) {
      setError("Current PIN must be 4 numeric digits");
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      setError("New PIN must be 4 numeric digits");
      return;
    }

    if (newPin !== confirmPin) {
      setError("New PIN and Confirm PIN do not match");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const { data } = await axiosClient.post(
        "/atm-card/change-pin",
        {
          card_id: card._id,
          old_pin: oldPin,
          new_pin: newPin,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data?.msg || "ATM PIN changed successfully!");
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "Failed to update PIN");
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
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-700">
            <MdVpnKey className="text-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Change ATM PIN</h2>
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
              Current 4-Digit PIN
            </label>
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ""))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-center font-mono text-lg font-bold tracking-[0.5em] transition focus:border-[#1e2678] focus:outline-none focus:ring-2 focus:ring-[#1e2678]/10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
              New 4-Digit PIN
            </label>
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-center font-mono text-lg font-bold tracking-[0.5em] transition focus:border-[#1e2678] focus:outline-none focus:ring-2 focus:ring-[#1e2678]/10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
              Confirm New PIN
            </label>
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-center font-mono text-lg font-bold tracking-[0.5em] transition focus:border-[#1e2678] focus:outline-none focus:ring-2 focus:ring-[#1e2678]/10"
            />
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
              {submitting ? "Updating..." : "Update ATM PIN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
