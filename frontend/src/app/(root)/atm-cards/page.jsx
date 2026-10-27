import { useState, useEffect } from "react";
import {
  MdCreditCard,
  MdAdd,
  MdLock,
  MdLockOpen,
  MdVpnKey,
  MdTune,
  MdLocalAtm,
  MdShield,
  MdRefresh,
  MdAccountBalance,
  MdWifi,
  MdHistory,
  MdCheckCircle,
} from "react-icons/md";
import { toast } from "react-toastify";
import { axiosClient } from "../../../utils/AxiosClient";
import { useMainContext } from "../../../context/MainContext";
import AtmCardVisual from "../../../components/AtmCard/AtmCardVisual";
import ApplyCardModal from "../../../components/AtmCard/ApplyCardModal";
import ChangePinModal from "../../../components/AtmCard/ChangePinModal";
import CardLimitsModal from "../../../components/AtmCard/CardLimitsModal";
import AtmWithdrawalModal from "../../../components/AtmCard/AtmWithdrawalModal";

export default function AtmCardsPage() {
  const { user, fetchUserProfile } = useMainContext();
  const [cards, setCards] = useState([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [isLimitsOpen, setIsLimitsOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axiosClient.get("/atm-card/my-cards", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCards(data.cards || []);
    } catch (err) {
      toast.error(err.response?.data?.msg || err.message || "Failed to load ATM cards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleActionSuccess = () => {
    fetchCards();
    fetchUserProfile?.();
  };

  const currentCard = cards[selectedCardIndex] || cards[0];

  const handleToggleBlock = async () => {
    if (!currentCard) return;

    try {
      const token = localStorage.getItem("token");
      const { data } = await axiosClient.post(
        "/atm-card/toggle-block",
        { card_id: currentCard._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.info(data?.msg || "Card status updated");
      fetchCards();
      fetchUserProfile?.();
    } catch (err) {
      toast.error(err.response?.data?.msg || err.message || "Failed to toggle card status");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-[#1e2678] p-7 text-white shadow-xl sm:p-10">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-[0.16em] text-indigo-100 uppercase backdrop-blur-sm">
              <MdShield className="text-emerald-400 text-sm" /> Smart Card Management
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              ATM & Debit Cards
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
              Manage your virtual and physical ATM cards, customize daily spending limits, set secure PIN, or simulate ATM cash withdrawals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsWithdrawOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-600"
            >
              <MdLocalAtm className="text-lg" /> ATM Cash Withdrawal
            </button>
            <button
              type="button"
              onClick={() => setIsApplyOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#1e2678] shadow-lg transition hover:bg-indigo-50"
            >
              <MdAdd className="text-lg" /> + Issue New Card
            </button>
          </div>
        </div>
      </section>

      {/* 4 Summary Stats */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Cards */}
        <div className="rounded-3xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Total Cards
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 text-[#1e2678]">
              <MdCreditCard className="text-xl" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-extrabold text-slate-900">
            {cards.length} {cards.length === 1 ? "Card" : "Cards"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {cards.filter((c) => !c.is_blocked).length} active, {cards.filter((c) => c.is_blocked).length} frozen
          </p>
        </div>

        {/* Daily ATM Limit */}
        <div className="rounded-3xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              ATM Cash Limit
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
              <MdLocalAtm className="text-xl" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-extrabold text-emerald-700">
            ₹{(currentCard?.daily_atm_limit || 25000).toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500">Per day cash dispensing</p>
        </div>

        {/* Daily Online Limit */}
        <div className="rounded-3xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Online/POS Limit
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
              <MdTune className="text-xl" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-extrabold text-[#1e2678]">
            ₹{(currentCard?.daily_online_limit || 50000).toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500">E-commerce & retail swipes</p>
        </div>

        {/* Contactless Status */}
        <div className="rounded-3xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Tap & Pay
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-amber-700">
              <MdWifi className="rotate-90 text-xl" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-extrabold text-slate-900">
            {currentCard?.contactless_enabled ? "Enabled" : "Disabled"}
          </p>
          <p className="mt-1 text-xs text-slate-500">NFC contactless transactions</p>
        </div>
      </section>

      {/* Main Card View & Controls Section */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-3xl bg-white shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Loading your ATM cards...</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 text-center shadow-md">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-indigo-50 text-[#1e2678]">
            <MdCreditCard className="text-3xl" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">No ATM Card Found</h3>
          <p className="mt-1 max-w-md text-xs text-slate-500">
            Issue a virtual debit card connected to your SBMS bank account to get started.
          </p>
          <button
            type="button"
            onClick={() => setIsApplyOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1e2678] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#171d60]"
          >
            <MdAdd className="text-base" /> Issue First ATM Card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Realistic Interactive Card & Quick Action Pills */}
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-6 shadow-md sm:p-8 lg:col-span-5">
            {/* Multi-Card Selector Tabs if multiple cards */}
            {cards.length > 1 && (
              <div className="mb-6 flex w-full flex-wrap gap-2.5 justify-center border-b border-slate-100 pb-4">
                {cards.map((c, idx) => {
                  const isSelected = selectedCardIndex === idx;
                  const type = (c.card_type || "visa").toLowerCase();
                  
                  let badgeColors = "bg-indigo-900 text-white shadow-md ring-2 ring-indigo-400/40";
                  if (type === "mastercard") {
                    badgeColors = isSelected 
                      ? "bg-gradient-to-r from-rose-900 to-amber-900 text-white shadow-md ring-2 ring-amber-400/50" 
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200";
                  } else if (type === "rupay") {
                    badgeColors = isSelected 
                      ? "bg-gradient-to-r from-emerald-950 to-teal-900 text-white shadow-md ring-2 ring-emerald-400/50" 
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200";
                  } else {
                    badgeColors = isSelected 
                      ? "bg-gradient-to-r from-[#070b28] to-[#1e2678] text-white shadow-md ring-2 ring-indigo-400/50" 
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200";
                  }

                  return (
                    <button
                      type="button"
                      key={c._id}
                      onClick={() => setSelectedCardIndex(idx)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${badgeColors}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${c.is_blocked ? "bg-rose-500" : "bg-emerald-400"}`} />
                      <span>{c.card_type.toUpperCase()}</span>
                      <span className="font-mono text-[11px] opacity-80">•••• {c.card_number.slice(-4)}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 3D Realistic ATM Card */}
            <AtmCardVisual card={currentCard} onToggleBlock={handleToggleBlock} />

            {/* Quick Action Buttons Grid */}
            <div className="mt-8 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
              <button
                type="button"
                onClick={handleToggleBlock}
                className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition ${
                  currentCard?.is_blocked
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-rose-50 hover:text-rose-700"
                }`}
              >
                {currentCard?.is_blocked ? (
                  <MdLockOpen className="text-2xl text-emerald-600" />
                ) : (
                  <MdLock className="text-2xl text-rose-500" />
                )}
                <span className="mt-1 text-[11px] font-bold">
                  {currentCard?.is_blocked ? "Unfreeze" : "Freeze Card"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsPinOpen(true)}
                className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center text-slate-700 transition hover:bg-indigo-50 hover:text-[#1e2678]"
              >
                <MdVpnKey className="text-2xl text-indigo-700" />
                <span className="mt-1 text-[11px] font-bold">Set / Reset PIN</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLimitsOpen(true)}
                className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center text-slate-700 transition hover:bg-indigo-50 hover:text-[#1e2678]"
              >
                <MdTune className="text-2xl text-cyan-700" />
                <span className="mt-1 text-[11px] font-bold">Manage Limits</span>
              </button>

              <button
                type="button"
                onClick={() => setIsWithdrawOpen(true)}
                className="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-center text-emerald-800 transition hover:bg-emerald-100"
              >
                <MdLocalAtm className="text-2xl text-emerald-600" />
                <span className="mt-1 text-[11px] font-bold">Withdraw ATM</span>
              </button>
            </div>
          </div>

          {/* Right Column: Card Details & Security Matrix */}
          <div className="space-y-6 lg:col-span-7">
            {/* Linked Bank Account Card */}
            <div className="rounded-3xl bg-white p-6 shadow-md sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Linked Bank Account
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">
                    A/C {currentCard?.account?.account_no || "Primary Bank Account"}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Available Balance</p>
                  <p className="text-lg font-extrabold text-emerald-700">
                    ₹{(currentCard?.account?.amount || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
                <div>
                  <span className="text-slate-500">Account Type:</span>
                  <p className="font-semibold text-slate-800 capitalize">
                    {currentCard?.account?.ac_type || "Savings"} Account
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Card Network:</span>
                  <p className="font-semibold text-[#1e2678] uppercase">
                    {currentCard?.card_type} {currentCard?.card_network}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Card Status:</span>
                  <p className="flex items-center gap-1 font-semibold">
                    {currentCard?.is_blocked ? (
                      <span className="text-rose-600">Locked / Frozen</span>
                    ) : (
                      <span className="text-emerald-600">Active & Operational</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Valid Thru:</span>
                  <p className="font-semibold text-slate-800">
                    {String(currentCard?.expiry_month).padStart(2, "0")}/{currentCard?.expiry_year}
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Limits Progress */}
            <div className="rounded-3xl bg-white p-6 shadow-md sm:p-7">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Configured Spending Limits
                </h3>
                <button
                  type="button"
                  onClick={() => setIsLimitsOpen(true)}
                  className="text-xs font-bold text-[#1e2678] hover:underline"
                >
                  Adjust Limits
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {/* ATM Limit Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      ATM Cash Dispensing (Daily)
                    </span>
                    <span className="font-extrabold text-slate-900">
                      ₹{(currentCard?.daily_atm_limit || 25000).toLocaleString("en-IN")} / ₹1,00,000 max
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#1e2678]"
                      style={{
                        width: `${Math.min(100, ((currentCard?.daily_atm_limit || 25000) / 100000) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Online Limit Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      Online & POS Swipes (Daily)
                    </span>
                    <span className="font-extrabold text-slate-900">
                      ₹{(currentCard?.daily_online_limit || 50000).toLocaleString("en-IN")} / ₹2,00,000 max
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{
                        width: `${Math.min(100, ((currentCard?.daily_online_limit || 50000) / 200000) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Features Badges */}
            <div className="rounded-3xl bg-indigo-50/50 border border-indigo-100 p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1e2678]">
                Enterprise Security Included
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <MdCheckCircle className="text-emerald-600 text-base shrink-0" />
                  <span>EMV 3D Secure</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <MdCheckCircle className="text-emerald-600 text-base shrink-0" />
                  <span>24/7 Anti-Fraud</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <MdCheckCircle className="text-emerald-600 text-base shrink-0" />
                  <span>Zero Liability</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <MdCheckCircle className="text-emerald-600 text-base shrink-0" />
                  <span>Instant Freeze</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ApplyCardModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onSuccess={handleActionSuccess}
      />

      <ChangePinModal
        isOpen={isPinOpen}
        onClose={() => setIsPinOpen(false)}
        card={currentCard}
        onSuccess={handleActionSuccess}
      />

      <CardLimitsModal
        isOpen={isLimitsOpen}
        onClose={() => setIsLimitsOpen(false)}
        card={currentCard}
        onSuccess={handleActionSuccess}
      />

      <AtmWithdrawalModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        card={currentCard}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
