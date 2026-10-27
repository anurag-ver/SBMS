import { useState } from "react";
import {
  MdWifi,
  MdContentCopy,
  MdCheck,
  MdLock,
  MdLockOpen,
  MdFlipCameraAndroid,
  MdShield,
} from "react-icons/md";
import { SiVisa, SiMastercard } from "react-icons/si";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

const CARD_THEMES = {
  visa: {
    name: "Visa Platinum",
    frontBg: "bg-gradient-to-br from-[#070b28] via-[#151c65] to-[#20298a] ring-1 ring-indigo-400/30",
    backBg: "bg-gradient-to-br from-[#060924] via-[#0f144a] to-[#181f68] ring-1 ring-indigo-400/20",
    glow1: "bg-indigo-400/30",
    glow2: "bg-cyan-300/25",
    chipBg: "bg-gradient-to-tr from-slate-200 via-white to-slate-400 ring-1 ring-slate-300/60 shadow-md",
    chipBorder: "border-slate-400/50",
    tierColor: "text-cyan-300",
    subtextColor: "text-indigo-200/90",
    accentColor: "text-cyan-300",
    shadow: "shadow-indigo-950/60",
    decor: (
      <>
        {/* Subtle geometric diagonal circuit lines */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="visa-grid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="32" stroke="white" strokeWidth="1" />
              <line x1="0" y1="0" x2="32" y2="0" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#visa-grid)" />
        </svg>
      </>
    ),
  },
  mastercard: {
    name: "Mastercard World",
    frontBg: "bg-gradient-to-br from-[#121215] via-[#24171d] to-[#42121a] ring-1 ring-amber-500/35",
    backBg: "bg-gradient-to-br from-[#101012] via-[#1b1216] to-[#2d0d12] ring-1 ring-amber-500/20",
    glow1: "bg-rose-500/25",
    glow2: "bg-amber-400/25",
    chipBg: "bg-gradient-to-tr from-amber-300 via-yellow-100 to-amber-500 ring-1 ring-amber-400/60 shadow-md",
    chipBorder: "border-amber-600/50",
    tierColor: "text-amber-300",
    subtextColor: "text-amber-100/80",
    accentColor: "text-amber-400",
    shadow: "shadow-rose-950/50",
    decor: (
      <>
        {/* Modern concentric watermark circles */}
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-56 w-56 rounded-full border border-rose-500/15" />
        <div className="pointer-events-none absolute -bottom-6 -right-6 h-44 w-44 rounded-full border border-amber-400/15" />
        <div className="pointer-events-none absolute -bottom-0 -right-0 h-32 w-32 rounded-full border border-rose-400/10" />
      </>
    ),
  },
  rupay: {
    name: "RuPay Select",
    frontBg: "bg-gradient-to-br from-[#031d14] via-[#094231] to-[#11684e] ring-1 ring-emerald-400/35",
    backBg: "bg-gradient-to-br from-[#021710] via-[#062c20] to-[#0c4b38] ring-1 ring-emerald-400/20",
    glow1: "bg-emerald-400/30",
    glow2: "bg-teal-300/20",
    chipBg: "bg-gradient-to-tr from-yellow-300 via-amber-100 to-yellow-500 ring-1 ring-yellow-400/70 shadow-md",
    chipBorder: "border-yellow-600/50",
    tierColor: "text-emerald-300",
    subtextColor: "text-emerald-100/80",
    accentColor: "text-emerald-400",
    shadow: "shadow-emerald-950/60",
    decor: (
      <>
        {/* Luxury Indian Diamond-Lattice Texture */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="rupay-diamonds"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M12 0 L24 12 L12 24 L0 12 Z"
                fill="none"
                stroke="white"
                strokeWidth="0.8"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rupay-diamonds)" />
        </svg>
      </>
    ),
  },
};

export default function AtmCardVisual({ card, onToggleBlock }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFullNumber, setShowFullNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!card) return null;

  const rawNumber = String(card.card_number || "4532000000000000");
  const formattedExpiry = `${String(card.expiry_month).padStart(2, "0")}/${String(
    card.expiry_year
  ).slice(-2)}`;

  const displayCardNumber = showFullNumber
    ? rawNumber.match(/.{1,4}/g)?.join(" ") || rawNumber
    : `${rawNumber.slice(0, 4)} •••• •••• ${rawNumber.slice(-4)}`;

  const handleCopyNumber = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(rawNumber);
    setCopied(true);
    toast.info("Card number copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const cardTypeKey = (card.card_type || "visa").toLowerCase();
  const theme = CARD_THEMES[cardTypeKey] || CARD_THEMES.visa;
  const isBlocked = card.is_blocked;

  const getNetworkLogo = (type) => {
    switch (type?.toLowerCase()) {
      case "mastercard":
        return (
          <div className="flex items-center gap-1.5 drop-shadow-md">
            <SiMastercard className="text-3xl text-[#eb001b]" />
            <span className="font-extrabold tracking-tighter text-sm italic text-white hidden sm:inline">
              mastercard
            </span>
          </div>
        );
      case "rupay":
        return (
          <div className="flex items-center font-black tracking-tight drop-shadow-md">
            <span className="text-2xl italic text-amber-400">Ru</span>
            <span className="text-2xl italic text-emerald-300">Pay</span>
            <span className="ml-1 rounded px-1 py-0.5 text-[8px] font-bold bg-white/20 text-white tracking-widest uppercase">
              Select
            </span>
          </div>
        );
      case "visa":
      default:
        return (
          <div className="flex items-center gap-1 drop-shadow-md">
            <SiVisa className="text-4xl text-white" />
            <span className="font-black italic text-xs tracking-wider text-cyan-300 uppercase">
              Platinum
            </span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* 3D Card Container */}
      <div
        className="group relative h-56 w-full max-w-[380px] sm:h-60 sm:max-w-[420px] cursor-pointer select-none [perspective:1000px]"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative h-full w-full rounded-3xl transition-all duration-700 [transform-style:preserve-3d] ${
            theme.shadow
          } ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
        >
          {/* ================= FRONT FACE ================= */}
          <div
            className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl p-6 text-white shadow-2xl [backface-visibility:hidden] ${
              isBlocked
                ? "bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 ring-2 ring-rose-500/60"
                : theme.frontBg
            }`}
          >
            {/* Ambient Lighting Orbs */}
            {!isBlocked ? (
              <>
                <div
                  className={`pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full ${theme.glow1} blur-3xl`}
                />
                <div
                  className={`pointer-events-none absolute -bottom-16 -left-16 h-60 w-60 rounded-full ${theme.glow2} blur-3xl`}
                />
                {theme.decor}
              </>
            ) : (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10">
                <MdLock className="text-9xl text-rose-500" />
              </div>
            )}

            {/* Top Bar: Bank Logo & Contactless */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-black tracking-[0.2em] text-white drop-shadow">
                  SBMS
                </span>
                <span
                  className={`text-[9px] font-bold tracking-widest uppercase ${theme.tierColor} border-l border-white/20 pl-2.5`}
                >
                  {card.card_network || "DEBIT"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isBlocked ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/30 px-2.5 py-0.5 text-[10px] font-bold text-rose-300 backdrop-blur-sm border border-rose-400/40">
                    <MdLock className="text-xs" /> FROZEN
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 backdrop-blur-sm border border-emerald-400/30">
                    <MdShield className="text-xs" /> ACTIVE
                  </span>
                )}
                {card.contactless_enabled && (
                  <MdWifi
                    className={`rotate-90 text-lg ${theme.accentColor}`}
                    title="Contactless Enabled"
                  />
                )}
              </div>
            </div>

            {/* EMV Chip & Network Hologram Badge */}
            <div className="relative z-10 flex items-center justify-between pt-1">
              <div
                className={`relative h-9 w-12 rounded-lg p-1 ${theme.chipBg}`}
              >
                <div
                  className={`h-full w-full rounded border ${theme.chipBorder} opacity-75 grid grid-cols-2 gap-0.5`}
                >
                  <div className={`border-r ${theme.chipBorder}`} />
                  <div />
                </div>
              </div>
              <span
                className={`text-[10px] font-extrabold tracking-widest uppercase ${theme.tierColor}`}
              >
                {card.card_type ? card.card_type.toUpperCase() : "DEBIT"}
              </span>
            </div>

            {/* 16-Digit Card Number */}
            <div className="relative z-10 my-auto">
              <div className="flex items-center justify-between">
                <p className="font-mono text-lg font-extrabold tracking-[0.2em] text-white drop-shadow sm:text-xl">
                  {displayCardNumber}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFullNumber(!showFullNumber);
                    }}
                    className="rounded-lg p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
                    title={showFullNumber ? "Hide full digits" : "Show full digits"}
                  >
                    {showFullNumber ? (
                      <FaEyeSlash className="text-xs" />
                    ) : (
                      <FaEye className="text-xs" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="rounded-lg p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
                    title="Copy card number"
                  >
                    {copied ? (
                      <MdCheck className="text-xs text-emerald-400" />
                    ) : (
                      <MdContentCopy className="text-xs" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Cardholder Name, Expiry & Card Network Logo */}
            <div className="relative z-10 flex items-end justify-between">
              <div>
                <p
                  className={`text-[8px] font-bold tracking-widest uppercase ${theme.subtextColor}`}
                >
                  Cardholder
                </p>
                <p className="truncate text-xs font-bold tracking-wider text-white uppercase max-w-[170px] drop-shadow-sm">
                  {card.card_holder || "SBMS CUSTOMER"}
                </p>
              </div>

              <div className="text-center">
                <p
                  className={`text-[8px] font-bold tracking-widest uppercase ${theme.subtextColor}`}
                >
                  Expires
                </p>
                <p className="font-mono text-xs font-extrabold text-white tracking-widest drop-shadow-sm">
                  {formattedExpiry}
                </p>
              </div>

              <div className="flex items-center justify-end">
                {getNetworkLogo(card.card_type)}
              </div>
            </div>
          </div>

          {/* ================= BACK FACE ================= */}
          <div
            className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-3xl p-6 text-white shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] ${
              isBlocked
                ? "bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 ring-2 ring-rose-500/50"
                : theme.backBg
            }`}
          >
            {/* Magnetic Black Stripe */}
            <div className="-mx-6 mt-1 h-11 w-[calc(100%+3rem)] bg-black/90 shadow-inner" />

            {/* White Signature Panel with CVV */}
            <div className="mt-2 space-y-1">
              <div
                className={`flex items-center justify-between text-[9px] uppercase tracking-wider ${theme.subtextColor}`}
              >
                <span>Authorized Signature</span>
                <span className="flex items-center gap-1 font-bold">
                  <span>CVV / CVC</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCvv(!showCvv);
                    }}
                    className="text-xs hover:text-white"
                  >
                    {showCvv ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </span>
              </div>
              <div className="flex h-9 items-center justify-between rounded-lg bg-slate-100 px-3 text-slate-900 shadow-inner">
                <div className="h-4 w-32 bg-slate-300/80 italic text-[10px] text-slate-500 flex items-center px-1 font-sans">
                  Not Valid Without Signature
                </div>
                <span className="font-mono text-xs font-black tracking-widest text-slate-900">
                  {showCvv ? card.cvv : "•••"}
                </span>
              </div>
            </div>

            {/* Disclaimer & Customer Helpline */}
            <div
              className={`text-[8px] leading-relaxed border-t border-white/10 pt-2 ${theme.subtextColor}`}
            >
              <p>
                Property of SBMS Bank. If found, please return to any SBMS Branch.
              </p>
              <div className="mt-1 flex items-center justify-between text-[9px]">
                <span>24x7 Support: 1800-123-SBMS</span>
                <span className="font-mono font-bold text-white">
                  A/C: ••••{" "}
                  {card.account?.account_no
                    ? String(card.account.account_no).slice(-4)
                    : "BANK"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Under-Card Helper Controls */}
      <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-500">
        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="inline-flex items-center gap-1.5 transition hover:text-[#1e2678]"
        >
          <MdFlipCameraAndroid className="text-sm" />
          {isFlipped ? "Show Card Front" : "Flip to see CVV & Back"}
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={onToggleBlock}
          className={`inline-flex items-center gap-1.5 font-bold transition ${
            isBlocked ? "text-emerald-700 hover:underline" : "text-rose-600 hover:underline"
          }`}
        >
          {isBlocked ? (
            <>
              <MdLockOpen className="text-sm" /> Unblock Card
            </>
          ) : (
            <>
              <MdLock className="text-sm" /> Freeze / Block Card
            </>
          )}
        </button>
      </div>
    </div>
  );
}
