import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment, useState } from "react";
import {
  MdClose,
  MdCheckCircle,
  MdErrorOutline,
  MdHourglassEmpty,
  MdContentCopy,
  MdCheck,
  MdPrint,
  MdArrowDownward,
  MdArrowUpward,
} from "react-icons/md";
import { SiRazorpay } from "react-icons/si";

export default function TransactionReceiptModal({ isOpen, onClose, txn }) {
  const [copied, setCopied] = useState(false);

  if (!txn) return null;

  const isCredit = txn.type === "credit";
  const isSuccess = txn.isSuccess !== false;

  const formattedDate = new Date(txn.createdAt || Date.now()).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const handleCopyId = () => {
    navigator.clipboard.writeText(txn._id || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#1e2678] text-white font-extrabold text-xs">
                      SB
                    </div>
                    <div>
                      <DialogTitle as="h3" className="text-base font-bold text-slate-900">
                        Transaction Receipt
                      </DialogTitle>
                      <p className="text-[11px] text-slate-400">SBMS Smart Banking</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                  >
                    <MdClose className="text-xl" />
                  </button>
                </div>

                {/* Amount Banner */}
                <div className="mt-6 text-center rounded-2xl bg-slate-50/80 border border-slate-100 p-6">
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-full text-xl ${
                        isCredit ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {isCredit ? <MdArrowDownward /> : <MdArrowUpward />}
                    </span>
                    <span
                      className={`text-3xl font-extrabold tracking-tight ${
                        isCredit ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {isCredit ? "+" : "-"}₹{(txn.amount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-center gap-2">
                    {isSuccess ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                        <MdCheckCircle className="text-sm" /> Transaction Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                        <MdErrorOutline className="text-sm" /> Transaction Incomplete
                      </span>
                    )}
                  </div>
                </div>

                {/* Receipt Details Breakdown */}
                <div className="mt-6 space-y-3.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-slate-500 font-medium">Transaction ID</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                      <span>#{String(txn._id).slice(-10)}</span>
                      <button
                        type="button"
                        onClick={handleCopyId}
                        className="rounded p-1 text-slate-400 hover:text-slate-700"
                        title="Copy ID"
                      >
                        {copied ? <MdCheck className="text-emerald-600" /> : <MdContentCopy />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-slate-500 font-medium">Account Number</span>
                    <span className="font-semibold text-slate-900">
                      {txn.account?.account_no ? `A/C ${txn.account.account_no}` : "Primary Account"}
                      {txn.account?.ac_type && ` (${txn.account.ac_type.toUpperCase()})`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-slate-500 font-medium">Date & Time</span>
                    <span className="font-semibold text-slate-900">{formattedDate}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-slate-500 font-medium">Narration / Remark</span>
                    <span className="font-semibold text-slate-900 max-w-[220px] text-right truncate">
                      {txn.remark || "Banking Transaction"}
                    </span>
                  </div>

                  {txn.payment_id && (
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <SiRazorpay className="text-blue-600" /> Razorpay Payment ID
                      </span>
                      <span className="font-mono font-bold text-blue-700">{txn.payment_id}</span>
                    </div>
                  )}

                  {txn.order_id && (
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="text-slate-500 font-medium">Gateway Order ID</span>
                      <span className="font-mono text-slate-700">{txn.order_id}</span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-8 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                  >
                    <MdPrint className="text-base" /> Print Receipt
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 inline-flex items-center justify-center rounded-xl bg-[#1e2678] py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#171d60]"
                  >
                    Done
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
