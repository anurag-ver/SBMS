import { useState, useEffect } from "react";
import {
  MdClose,
  MdCreditCard,
  MdAccountBalance,
  MdVpnKey,
  MdCheckCircle,
  MdInfoOutline,
} from "react-icons/md";
import { SiVisa, SiMastercard } from "react-icons/si";
import { toast } from "react-toastify";
import { axiosClient } from "../../utils/AxiosClient";
import { useMainContext } from "../../context/MainContext";

const CARD_NETWORKS = [
  {
    type: "visa",
    name: "Visa Platinum",
    desc: "Royal navy theme • Global acceptance with zero-liability protection",
    icon: SiVisa,
    badgeBg: "bg-[#1e2678] text-white",
    selectedStyle: "border-[#1e2678] bg-gradient-to-r from-indigo-50/80 to-white ring-2 ring-[#1e2678]/20",
  },
  {
    type: "mastercard",
    name: "Mastercard World",
    desc: "Matte obsidian & gold • Premium lifestyle privileges & worldwide lounge access",
    icon: SiMastercard,
    badgeBg: "bg-gradient-to-r from-neutral-900 to-[#3b1219] text-amber-300",
    selectedStyle: "border-amber-500 bg-gradient-to-r from-amber-50/70 to-rose-50/40 ring-2 ring-amber-500/20",
  },
  {
    type: "rupay",
    name: "RuPay Select",
    desc: "Emerald luxury • Indian & international airport lounges + zero markup",
    customLogo: true,
    badgeBg: "bg-gradient-to-r from-[#031d14] to-[#11684e] text-emerald-300",
    selectedStyle: "border-emerald-500 bg-gradient-to-r from-emerald-50/80 to-teal-50/40 ring-2 ring-emerald-500/20",
  },
];

export default function ApplyCardModal({ isOpen, onClose, onSuccess }) {
  const { user } = useMainContext();
  const accounts = user?.account_no || [];

  const [accountNo, setAccountNo] = useState("");
  const [cardType, setCardType] = useState("visa");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (accounts.length > 0 && !accountNo) {
      setAccountNo(String(accounts[0].account_no));
    }
  }, [accounts, accountNo]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!accountNo) {
      setError("Please select a bank account to link");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError("ATM PIN must be exactly 4 numeric digits");
      return;
    }

    if (pin !== confirmPin) {
      setError("PIN and Confirm PIN do not match");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const { data } = await axiosClient.post(
        "/atm-card/apply",
        {
          account_no: accountNo,
          card_type: cardType,
          pin,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data?.msg || "ATM Debit Card issued successfully!");
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "Failed to issue new ATM card");
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
            <MdCreditCard className="text-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Issue New ATM Card</h2>
            <p className="text-xs text-slate-500">
              Instantly generate a virtual debit card linked to your account
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            <MdInfoOutline className="text-base shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Linked Bank Account */}
          <div>
            <label className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
              Link with Bank Account
            </label>
            <div className="mt-2">
              <select
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition focus:border-[#1e2678] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e2678]/10"
              >
                {accounts.map((acc) => (
                  <option key={acc._id || acc.account_no} value={acc.account_no}>
                    A/C {acc.account_no} ({acc.ac_type || "Savings"}) — Balance: ₹
                    {(acc.amount || 0).toLocaleString("en-IN")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Card Network Selector */}
          <div>
            <label className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
              Select Card Network
            </label>
            <div className="mt-2.5 space-y-2">
              {CARD_NETWORKS.map((net) => {
                const isSelected = cardType === net.type;
                const Icon = net.icon;
                return (
                  <label
                    key={net.type}
                    onClick={() => setCardType(net.type)}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition ${
                      isSelected
                        ? net.selectedStyle
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="card_network"
                        value={net.type}
                        checked={isSelected}
                        onChange={() => setCardType(net.type)}
                        className="text-[#1e2678] focus:ring-[#1e2678]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">{net.name}</p>
                          {isSelected && (
                            <span className="rounded-md bg-[#1e2678] px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{net.desc}</p>
                      </div>
                    </div>

                    <div className={`grid h-10 w-16 place-items-center rounded-xl border border-slate-200/60 shadow-sm ${net.badgeBg}`}>
                      {net.customLogo ? (
                        <span className="font-black italic text-xs">
                          <span className="text-amber-400">Ru</span>
                          <span className="text-emerald-300">Pay</span>
                        </span>
                      ) : (
                        <Icon className="text-2xl" />
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Set 4-Digit ATM PIN */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Set 4-Digit PIN
              </label>
              <div className="relative mt-2">
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-[0.5em] font-mono text-base font-bold rounded-xl border border-slate-200 py-2.5 px-3 transition focus:border-[#1e2678] focus:outline-none focus:ring-2 focus:ring-[#1e2678]/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wider text-slate-600 uppercase">
                Confirm PIN
              </label>
              <div className="relative mt-2">
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-[0.5em] font-mono text-base font-bold rounded-xl border border-slate-200 py-2.5 px-3 transition focus:border-[#1e2678] focus:outline-none focus:ring-2 focus:ring-[#1e2678]/10"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
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
              {submitting ? "Issuing Card..." : "Confirm & Issue Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
