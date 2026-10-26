import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MdReceiptLong,
  MdArrowDownward,
  MdArrowUpward,
  MdAdd,
  MdSwapHoriz,
  MdSearch,
  MdFilterList,
  MdRefresh,
  MdCheckCircle,
  MdErrorOutline,
  MdChevronRight,
  MdAccountBalance,
} from "react-icons/md";
import { toast } from "react-toastify";
import { axiosClient } from "../../../utils/AxiosClient";
import { useMainContext } from "../../../context/MainContext";
import AddAmountModal from "../../../components/Amount/AddAmountModal";
import TransferModal from "../../../components/Amount/TransferModal";
import TransactionReceiptModal from "../../../components/Transaction/TransactionReceiptModal";

export default function TransactionsPage() {
  const { user, fetchUserProfile } = useMainContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'credit', 'debit'
  const [selectedAccountFilter, setSelectedAccountFilter] = useState("all");

  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const accounts = user?.account_no || [];

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axiosClient.get("/amount/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTransactions(data.transactions || []);
    } catch (error) {
      toast.error(error.response?.data?.msg || error.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      toast.success("Payment verified! Your transaction ledger has been updated.");
      fetchUserProfile();
      fetchTransactions();
      setSearchParams({}, { replace: true });
    } else if (paymentStatus === "failed") {
      toast.error(searchParams.get("msg") || "Payment was unsuccessful or cancelled.");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  // Compute Statistics
  const totalCredited = transactions
    .filter((t) => t.type === "credit" && t.isSuccess !== false)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalDebited = transactions
    .filter((t) => t.type === "debit" && t.isSuccess !== false)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Filter Transactions
  const filteredTransactions = transactions.filter((t) => {
    // Type Filter
    if (filterType !== "all" && t.type !== filterType) return false;

    // Account Filter
    if (selectedAccountFilter !== "all") {
      const accNo = t.account?.account_no || t.account;
      if (String(accNo) !== String(selectedAccountFilter)) return false;
    }

    // Search Query (Remark, ID, Account No)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchRemark = (t.remark || "").toLowerCase().includes(query);
      const matchId = String(t._id || "").toLowerCase().includes(query);
      const matchAcc = String(t.account?.account_no || "").toLowerCase().includes(query);
      return matchRemark || matchId || matchAcc;
    }

    return true;
  });

  const openReceipt = (txn) => {
    setSelectedTxn(txn);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-[#1e2678] p-7 text-white shadow-xl sm:p-10">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-[0.16em] text-indigo-100 uppercase backdrop-blur-sm">
              Account Activity
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Transactions History
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
              Audit log of all your deposits, transfers, and incoming payments with instant digital receipts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDepositOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#1e2678] shadow-lg transition hover:bg-indigo-50"
            >
              <MdAdd className="text-lg" /> Add Money
            </button>
            <button
              type="button"
              onClick={() => setIsTransferOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-[#1e2678]"
            >
              <MdSwapHoriz className="text-lg" /> Transfer Funds
            </button>
            <button
              type="button"
              onClick={fetchTransactions}
              title="Refresh transactions"
              className="rounded-xl border border-white/20 bg-white/10 p-3 text-white transition hover:bg-white/20"
            >
              <MdRefresh className={`text-xl ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* 3 Summary Overview Cards */}
        <div className="relative z-10 mt-8 grid grid-cols-1 gap-4 border-t border-white/15 pt-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between text-indigo-200">
              <span className="text-xs uppercase tracking-wider font-semibold">Total Credited</span>
              <MdArrowDownward className="text-lg text-emerald-300" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-white">
              +₹{totalCredited.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-[11px] text-indigo-200">Deposits & incoming funds</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between text-indigo-200">
              <span className="text-xs uppercase tracking-wider font-semibold">Total Debited</span>
              <MdArrowUpward className="text-lg text-rose-300" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-white">
              -₹{totalDebited.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-[11px] text-indigo-200">Transfers & withdrawals</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between text-indigo-200">
              <span className="text-xs uppercase tracking-wider font-semibold">Total Records</span>
              <MdReceiptLong className="text-lg text-cyan-300" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-white">
              {transactions.length} Transactions
            </p>
            <p className="mt-1 text-[11px] text-indigo-200">Lifetime logged entries</p>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400" />
            <input
              type="text"
              placeholder="Search by remark, transaction ID, or account..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#1e2678] focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          {/* Account Selector Filter */}
          <div className="flex items-center gap-2">
            <MdAccountBalance className="text-slate-400 text-lg hidden sm:block" />
            <select
              value={selectedAccountFilter}
              onChange={(e) => setSelectedAccountFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 outline-none transition focus:border-[#1e2678] focus:bg-white"
            >
              <option value="all">All Bank Accounts</option>
              {accounts.map((acc) => (
                <option key={acc._id || acc.account_no} value={acc.account_no}>
                  A/C {acc.account_no} ({acc.ac_type?.toUpperCase() || "SAVINGS"})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
            <MdFilterList /> Filter:
          </span>
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              filterType === "all"
                ? "bg-[#1e2678] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Activity
          </button>
          <button
            type="button"
            onClick={() => setFilterType("credit")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              filterType === "credit"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            + Credits (Deposits)
          </button>
          <button
            type="button"
            onClick={() => setFilterType("debit")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              filterType === "debit"
                ? "bg-rose-700 text-white shadow-sm"
                : "bg-rose-50 text-rose-800 hover:bg-rose-100"
            }`}
          >
            - Debits (Transfers)
          </button>
        </div>
      </section>

      {/* Transactions List / Table */}
      <section className="rounded-3xl bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1e2678] border-r-transparent align-[-0.125em]" />
            <p className="mt-3 text-sm font-semibold text-slate-500">Loading your transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-[#1e2678]">
              <MdReceiptLong className="text-3xl" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">No Transactions Found</h3>
            <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || filterType !== "all" || selectedAccountFilter !== "all"
                ? "No transactions match your current search and filter criteria."
                : "You haven't made any transactions yet. Deposit funds to see activity here."}
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsDepositOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1e2678] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#171d60]"
              >
                <MdAdd className="text-base" /> Add Money Now
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-4 pl-6 pr-3">Type & Remark</th>
                  <th className="px-3 py-4">Bank Account</th>
                  <th className="px-3 py-4">Date & Time</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="py-4 pl-3 pr-6 text-right">Amount (INR)</th>
                  <th className="py-4 pr-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTransactions.map((t) => {
                  const isCredit = t.type === "credit";
                  const isSuccess = t.isSuccess !== false;
                  const formattedDate = new Date(t.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });

                  return (
                    <tr
                      key={t._id}
                      onClick={() => openReceipt(t)}
                      className="cursor-pointer transition-colors hover:bg-indigo-50/40"
                    >
                      {/* Remark & Direction */}
                      <td className="py-4 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl text-lg ${
                              isCredit
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {isCredit ? <MdArrowDownward /> : <MdArrowUpward />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{t.remark || "Transaction"}</p>
                            <p className="font-mono text-[11px] text-slate-400">
                              #{String(t._id).slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Account */}
                      <td className="px-3 py-4 text-xs font-semibold text-slate-800">
                        {t.account?.account_no ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1">
                            A/C {t.account.account_no}
                          </span>
                        ) : (
                          <span className="text-slate-400">Primary A/C</span>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="px-3 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {formattedDate}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-4 whitespace-nowrap">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                            <MdCheckCircle className="text-xs" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                            <MdErrorOutline className="text-xs" /> Incomplete
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap">
                        <span
                          className={`text-base font-extrabold ${
                            isCredit ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {isCredit ? "+" : "-"}₹
                          {(t.amount || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>

                      {/* Receipt Action */}
                      <td className="py-4 pr-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openReceipt(t);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#1e2678] hover:underline"
                        >
                          View <MdChevronRight className="text-base" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Receipt Modal */}
      <TransactionReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        txn={selectedTxn}
      />

      {/* Add Amount Modal */}
      <AddAmountModal
        isOpen={isDepositOpen}
        onClose={() => {
          setIsDepositOpen(false);
          fetchTransactions();
        }}
      />

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => {
          setIsTransferOpen(false);
          fetchTransactions();
        }}
      />
    </div>
  );
}
