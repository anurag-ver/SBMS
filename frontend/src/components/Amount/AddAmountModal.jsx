import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
import { MdClose, MdAccountBalanceWallet, MdSecurity, MdPayment, MdFlashOn } from "react-icons/md";
import { SiRazorpay } from "react-icons/si";
import { toast } from "react-toastify";
import { axiosClient } from "../../utils/AxiosClient";
import { useMainContext } from "../../context/MainContext";
import { loadRazorpayScript } from "../../utils/loadRazorpay";

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000];

export default function AddAmountModal({ isOpen, onClose, defaultAccountNo }) {
  const { user, fetchUserProfile } = useMainContext();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(defaultAccountNo || "");
  const [remark, setRemark] = useState("Deposit");
  const [loading, setLoading] = useState(false);

  // Fallback to first available account
  const accounts = user?.account_no || [];
  const activeAccountNo = selectedAccount || defaultAccountNo || accounts[0]?.account_no || "";

  const handlePresetClick = (val) => {
    setAmount(val.toString());
  };

  /**
   * 1. Instant Direct Deposit (Bypasses external gateway & SMS OTP)
   */
  const handleInstantDeposit = async () => {
    const num = Number(amount);
    if (!num || num <= 0) {
      toast.error("Please enter a valid amount greater than ₹0");
      return;
    }
    if (!activeAccountNo) {
      toast.error("Please select a bank account");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axiosClient.post(
        "/amount/add-money",
        {
          account_no: activeAccountNo,
          amount: num,
          remark: remark || "Instant Test Deposit",
          payment_mode: "instant",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        data.msg || `₹${num.toLocaleString("en-IN")} credited to A/C ${activeAccountNo} successfully!`
      );
      await fetchUserProfile();
      setAmount("");
      onClose();
      navigate("/transactions");
    } catch (error) {
      toast.error(error.response?.data?.msg || error.message || "Failed to deposit money");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 2. Razorpay Gateway Deposit (Locked to dummy phone to avoid SMS OTPs)
   */
  const handleRazorpayDeposit = async (e) => {
    if (e) e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) {
      toast.error("Please enter a valid amount greater than ₹0");
      return;
    }
    if (!activeAccountNo) {
      toast.error("Please select a bank account");
      return;
    }

    try {
      setLoading(true);

      // Load Razorpay Checkout SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Razorpay SDK failed to load. Check your internet connection.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");

      // Create Order on Backend
      const { data } = await axiosClient.post(
        "/amount/add-money",
        {
          account_no: activeAccountNo,
          amount: num,
          remark,
          payment_mode: "razorpay",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const razorpayKey =
        data.key_id ||
        import.meta.env.VITE_RAZORPAY_KEY_ID ||
        import.meta.env.VITE_TEST_API_KEY ||
        "rzp_test_Ts9tg9Hu7qBjyz";

      // Configure Razorpay with readonly dummy contact so it NEVER texts your phone
      const options = {
        key: razorpayKey,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "SBMS Bank",
        description: `Deposit to A/C ${activeAccountNo}`,
        order_id: data.order_id,
        image: "/sbms_logo.png",
        prefill: {
          name: user?.name || "Test User",
          email: "test.customer@sbms.com",
          contact: "9999999999", // Dummy phone number prevents real SMS OTPs
        },
        readonly: {
          contact: true,
          email: true,
        },
        send_sms_hash: false,
        theme: {
          color: "#1e2678",
        },
        handler: async function (response) {
          try {
            // Verify Payment Signature
            const verifyRes = await axiosClient.post(
              "/amount/verify-payment",
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                txn_id: data.txn_id,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            toast.success(
              verifyRes.data?.msg ||
                `₹${num.toLocaleString("en-IN")} credited to A/C ${activeAccountNo} successfully!`
            );
            await fetchUserProfile();
            setAmount("");
            onClose();
            navigate("/transactions");
          } catch (err) {
            toast.error(err.response?.data?.msg || err.message || "Payment verification failed");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const rzpPayment = new window.Razorpay(options);
      rzpPayment.open();
    } catch (error) {
      toast.error(error.response?.data?.msg || error.message || "Failed to initiate payment");
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
                      <MdAccountBalanceWallet className="text-2xl" />
                    </div>
                    <div>
                      <DialogTitle as="h3" className="text-lg font-bold text-slate-900">
                        Add Money to Account
                      </DialogTitle>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <span>Instant Deposit or Razorpay</span>
                      </div>
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

                <div className="mt-6 space-y-5">
                  {/* Account Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Destination Account
                    </label>
                    <select
                      value={activeAccountNo}
                      onChange={(e) => setSelectedAccount(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#1e2678] focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    >
                      {accounts.map((acc) => (
                        <option key={acc._id || acc.account_no} value={acc.account_no}>
                          A/C {acc.account_no} • ({acc.ac_type?.toUpperCase() || "SAVINGS"}) • ₹{(acc.amount || 0).toLocaleString("en-IN")}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Deposit Amount (INR)
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
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-9 pr-4 text-xl font-extrabold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-[#1e2678] focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div>
                    <span className="block text-xs font-medium text-slate-500 mb-2">Quick Select</span>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_AMOUNTS.map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handlePresetClick(val)}
                          className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                            amount === val.toString()
                              ? "border-[#1e2678] bg-[#1e2678] text-white shadow-sm"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50"
                          }`}
                        >
                          +₹{val.toLocaleString("en-IN")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Remarks Input */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Remark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Salary, Savings, Test deposit"
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#1e2678] focus:bg-white"
                    />
                  </div>

                  {/* Two Action Methods */}
                  <div className="space-y-2.5 pt-2">
                    {/* 1. Instant Direct Deposit (Zero Phone OTP) */}
                    <button
                      type="button"
                      onClick={handleInstantDeposit}
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <MdFlashOn className="text-xl" />
                      {loading ? "Depositing..." : "Instant Deposit (No OTP Required)"}
                    </button>

                    {/* 2. Razorpay Gateway Option (Phone locked to dummy so no real SMS is sent) */}
                    <button
                      type="button"
                      onClick={handleRazorpayDeposit}
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100 disabled:opacity-60"
                    >
                      <SiRazorpay className="text-blue-600 text-base" />
                      {loading ? "Opening..." : "Pay via Razorpay Test Gateway"}
                    </button>
                  </div>

                  <p className="text-center text-[11px] text-slate-400">
                    Use <strong className="text-slate-600">Instant Deposit</strong> to credit funds immediately with 0 verification steps.
                  </p>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
