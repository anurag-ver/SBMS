import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
import { MdClose, MdSwapHoriz, MdSend } from "react-icons/md";
import { toast } from "react-toastify";
import { axiosClient } from "../../utils/AxiosClient";
import { useMainContext } from "../../context/MainContext";

export default function TransferModal({ isOpen, onClose, defaultFromAccountNo }) {
  const { user, fetchUserProfile } = useMainContext();
  const navigate = useNavigate();
  const [fromAccountNo, setFromAccountNo] = useState(defaultFromAccountNo || "");
  const [toAccountNo, setToAccountNo] = useState("");
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);

  const accounts = user?.account_no || [];
  const activeFromNo = fromAccountNo || defaultFromAccountNo || accounts[0]?.account_no || "";

  const selectedAcc = accounts.find((a) => a.account_no == activeFromNo);
  const currentBalance = selectedAcc?.amount || 0;

  const handleTransfer = async (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) {
      toast.error("Enter a valid transfer amount greater than 0");
      return;
    }
    if (!activeFromNo || !toAccountNo) {
      toast.error("Source and destination account numbers are required");
      return;
    }
    if (activeFromNo == toAccountNo) {
      toast.error("Source and destination accounts cannot be the same");
      return;
    }
    if (num > currentBalance) {
      toast.error("Insufficient balance in selected account");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axiosClient.post(
        "/amount/transfer",
        {
          from_account_no: activeFromNo,
          to_account_no: Number(toAccountNo),
          amount: num,
          remark: remark || "Account Transfer",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.msg || "Transfer successful!");
      await fetchUserProfile();
      setAmount("");
      setToAccountNo("");
      setRemark("");
      onClose();
      navigate("/transactions");
    } catch (error) {
      toast.error(error.response?.data?.msg || error.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
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
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-[#1e2678]">
                      <MdSwapHoriz className="text-2xl" />
                    </div>
                    <div>
                      <DialogTitle as="h3" className="text-lg font-bold text-slate-900">
                        Transfer Funds
                      </DialogTitle>
                      <p className="text-xs text-slate-500">Instant peer-to-peer bank transfer</p>
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

                <form onSubmit={handleTransfer} className="mt-6 space-y-4">
                  {/* From Account */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      From Account
                    </label>
                    <select
                      value={activeFromNo}
                      onChange={(e) => setFromAccountNo(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#1e2678] focus:bg-white"
                    >
                      {accounts.map((acc) => (
                        <option key={acc._id || acc.account_no} value={acc.account_no}>
                          A/C {acc.account_no} • ₹{(acc.amount || 0).toLocaleString("en-IN")}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-slate-500 text-right">
                      Available: <span className="font-bold text-slate-800">₹{currentBalance.toLocaleString("en-IN")}</span>
                    </p>
                  </div>

                  {/* Destination Account */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Destination Account Number
                    </label>
                    <input
                      type="number"
                      placeholder="Enter 10-digit account number"
                      value={toAccountNo}
                      onChange={(e) => setToAccountNo(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1e2678] focus:bg-white"
                    />
                  </div>

                  {/* Transfer Amount */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Amount (INR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-9 pr-4 text-xl font-extrabold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-[#1e2678] focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Remark */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Remark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rent, Payment, Bills"
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#1e2678] focus:bg-white"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#1e2678] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-[#171d60] disabled:opacity-60"
                    >
                      {loading ? (
                        "Transferring..."
                      ) : (
                        <>
                          <MdSend className="text-lg" />
                          Send Money
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
