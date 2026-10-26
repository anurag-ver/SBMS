import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
import { MdClose, MdAddCircleOutline, MdAccountBalance, MdCheck } from "react-icons/md";
import { toast } from "react-toastify";
import { axiosClient } from "../../utils/AxiosClient";
import { useMainContext } from "../../context/MainContext";

const ACCOUNT_TYPES = [
  {
    id: "saving",
    title: "Savings Account",
    desc: "Ideal for daily savings, earning 4.0% p.a. interest with zero maintenance fee.",
    badge: "Most Popular",
  },
  {
    id: "current",
    title: "Current Account",
    desc: "Designed for business, high-volume transactions with unlimited monthly limits.",
    badge: "Business & Freelance",
  },
];

export default function AddAccountModal({ isOpen, onClose }) {
  const { fetchUserProfile } = useMainContext();
  const [accountType, setAccountType] = useState("saving");
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axiosClient.post(
        "/amount/add-account",
        { ac_type: accountType },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.msg || "New bank account opened successfully!");
      await fetchUserProfile();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.msg || error.message || "Failed to open account");
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
              <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-[#1e2678]">
                      <MdAccountBalance className="text-2xl" />
                    </div>
                    <div>
                      <DialogTitle as="h3" className="text-lg font-bold text-slate-900">
                        Open New Bank Account
                      </DialogTitle>
                      <p className="text-xs text-slate-500">Instant account generation & activation</p>
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

                <form onSubmit={handleCreateAccount} className="mt-6 space-y-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Select Account Type
                  </p>

                  <div className="space-y-3">
                    {ACCOUNT_TYPES.map((type) => {
                      const isSelected = accountType === type.id;
                      return (
                        <div
                          key={type.id}
                          onClick={() => setAccountType(type.id)}
                          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                            isSelected
                              ? "border-[#1e2678] bg-indigo-50/50 shadow-md ring-2 ring-[#1e2678]/10"
                              : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`grid h-5 w-5 place-items-center rounded-full border text-xs ${
                                  isSelected
                                    ? "border-[#1e2678] bg-[#1e2678] text-white"
                                    : "border-slate-300 bg-white text-transparent"
                                }`}
                              >
                                <MdCheck />
                              </span>
                              <span className="font-bold text-slate-900">{type.title}</span>
                            </div>
                            <span className="rounded-full bg-indigo-100/70 px-2.5 py-0.5 text-[10px] font-bold text-[#1e2678]">
                              {type.badge}
                            </span>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-slate-500 pl-7.5">
                            {type.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">Account Opening Highlights:</p>
                    <ul className="mt-1.5 list-disc pl-4 space-y-1 text-slate-500">
                      <li>Instantly assigned 10-digit SBMS account number</li>
                      <li>Zero minimum balance requirement</li>
                      <li>Eligible for virtual ATM card & instant transfers</li>
                    </ul>
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
                      className="inline-flex items-center gap-2 rounded-xl bg-[#1e2678] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-[#171d60] focus:ring-4 focus:ring-indigo-200 disabled:opacity-60"
                    >
                      {loading ? (
                        "Opening Account..."
                      ) : (
                        <>
                          <MdAddCircleOutline className="text-lg" />
                          Open Account
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
