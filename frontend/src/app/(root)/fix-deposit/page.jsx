import { useState, useEffect } from "react";
import {
  MdSavings,
  MdAdd,
  MdTrendingUp,
  MdAccountBalance,
  MdCalendarMonth,
  MdShield,
  MdCheckCircle,
  MdRefresh,
  MdArrowForward,
  MdOutlinePercent,
  MdVerified,
} from "react-icons/md";
import { toast } from "react-toastify";
import { axiosClient } from "../../../utils/AxiosClient";
import { useMainContext } from "../../../context/MainContext";
import CreateFDModal from "../../../components/FixDeposit/CreateFDModal";
import ClaimFDModal from "../../../components/FixDeposit/ClaimFDModal";

const RATES_SCHEDULE = [
  { tenure: "6 Months", months: 6, rate: 6.5, returnOnLakh: "₹1,03,277", tag: "Short Term" },
  { tenure: "12 Months (1 Year)", months: 12, rate: 7.0, returnOnLakh: "₹1,07,185", tag: "Most Popular", popular: true },
  { tenure: "24 Months (2 Years)", months: 24, rate: 7.5, returnOnLakh: "₹1,15,969", tag: "Steady Growth" },
  { tenure: "36 Months (3 Years)", months: 36, rate: 7.8, returnOnLakh: "₹1,26,068", tag: "Long Term" },
  { tenure: "60 Months (5 Years)", months: 60, rate: 8.2, returnOnLakh: "₹1,50,073", tag: "High Yield" },
];

export default function FixDepositPage() {
  const { fetchUserProfile } = useMainContext();
  const [fds, setFds] = useState([]);
  const [stats, setStats] = useState({
    totalInvested: 0,
    totalMaturityValue: 0,
    totalReturns: 0,
    activeCount: 0,
    claimedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // 'active', 'claimed', 'schedule'

  // Calculator State
  const [calcAmount, setCalcAmount] = useState(50000);
  const [calcMonths, setCalcMonths] = useState(12);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFdForClaim, setSelectedFdForClaim] = useState(null);
  const [isClaimOpen, setIsClaimOpen] = useState(false);

  const fetchFDs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axiosClient.get("/fix-deposit/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFds(data.fds || []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || err.message || "Failed to load Fixed Deposits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFDs();
  }, []);

  const handleActionSuccess = () => {
    fetchFDs();
    fetchUserProfile();
  };

  // Calculator returns
  const selectedSchedule =
    RATES_SCHEDULE.find((s) => s.months === Number(calcMonths)) || RATES_SCHEDULE[1];
  const calcRate = selectedSchedule.rate;
  const t = Number(calcMonths) / 12;
  const calcMaturity =
    calcAmount > 0 ? Math.round(calcAmount * Math.pow(1 + calcRate / 400, 4 * t)) : 0;
  const calcReturns = Math.max(0, calcMaturity - calcAmount);

  const activeFDs = fds.filter((f) => !f.isClaimed);
  const claimedFDs = fds.filter((f) => f.isClaimed);

  const openClaimModal = (fd) => {
    setSelectedFdForClaim(fd);
    setIsClaimOpen(true);
  };

  const openCreateWithCalculator = () => {
    setIsCreateOpen(true);
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
              <MdShield className="text-emerald-400 text-sm" /> Fixed Deposit Investments
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              High-Yield Fixed Deposits
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
              Lock in guaranteed returns up to 8.2% p.a. with quarterly compounding. Manage your active certificates and withdraw anytime.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#1e2678] shadow-lg transition hover:bg-indigo-50"
            >
              <MdAdd className="text-lg" /> + Open New FD
            </button>
            <button
              type="button"
              onClick={fetchFDs}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-bold text-white shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-[#1e2678]"
              title="Refresh FDs"
            >
              <MdRefresh className="text-lg" /> Refresh
            </button>
          </div>
        </div>
      </section>

      {/* 4 Summary Cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Invested */}
        <div className="rounded-3xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Total Invested
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 text-[#1e2678]">
              <MdSavings className="text-xl" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-extrabold text-slate-900">
            ₹{stats.totalInvested.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500">Across {stats.activeCount} active plans</p>
        </div>

        {/* Total Maturity Value */}
        <div className="rounded-3xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Maturity Value
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
              <MdTrendingUp className="text-xl" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-extrabold text-emerald-700">
            ₹{stats.totalMaturityValue.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500">Guaranteed final payout</p>
        </div>

        {/* Total Interest Returns */}
        <div className="rounded-3xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Total Returns
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
              <MdOutlinePercent className="text-xl" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-extrabold text-[#1e2678]">
            +₹{stats.totalReturns.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500">Compounded interest gains</p>
        </div>

        {/* Active Certificates */}
        <div className="rounded-3xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Active Plans
            </span>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-amber-700">
              <MdVerified className="text-xl" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-extrabold text-slate-900">
            {stats.activeCount} <span className="text-sm font-normal text-slate-500">Active</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">{stats.claimedCount} past liquidated</p>
        </div>
      </section>

      {/* Interactive FD Return Calculator Card */}
      <section className="overflow-hidden rounded-3xl bg-white p-6 shadow-md sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-[#1e2678]">
              <MdTrendingUp /> LIVE FD CALCULATOR
            </span>
            <h2 className="mt-2 text-xl font-bold text-slate-900">
              Calculate Your Returns & Maturity
            </h2>
            <p className="text-xs text-slate-500">
              Adjust investment amount and tenure to preview quarterly compounding returns.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateWithCalculator}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1e2678] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#171d60]"
          >
            Invest ₹{calcAmount.toLocaleString("en-IN")} Now <MdArrowForward />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Controls: Amount & Tenure */}
          <div className="space-y-5 lg:col-span-7">
            {/* Amount Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 uppercase tracking-wider">Deposit Amount</span>
                <span className="text-base text-[#1e2678]">₹{calcAmount.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="500000"
                step="5000"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-lg bg-indigo-100 accent-[#1e2678]"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {[10000, 25000, 50000, 100000, 200000].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setCalcAmount(val)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      calcAmount === val
                        ? "bg-[#1e2678] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    ₹{val >= 100000 ? `${val / 100000}L` : `${val / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            {/* Tenure Options */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Investment Tenure
              </label>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {RATES_SCHEDULE.map((s) => {
                  const isSelected = calcMonths === s.months;
                  return (
                    <button
                      type="button"
                      key={s.months}
                      onClick={() => setCalcMonths(s.months)}
                      className={`rounded-2xl border p-2.5 text-center transition ${
                        isSelected
                          ? "border-[#1e2678] bg-indigo-50 shadow-sm ring-2 ring-[#1e2678]/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-800">{s.tenure.split(" ")[0]} M</p>
                      <p className="mt-1 text-xs font-extrabold text-emerald-700">{s.rate}%</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Calculator Output Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-emerald-50/40 p-5 lg:col-span-5">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Selected Plan</span>
                <span className="font-bold text-emerald-700">{calcRate}% p.a. (Quarterly)</span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Principal Deposit:</span>
                  <span className="font-bold text-slate-800">
                    ₹{calcAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold">Total Interest Earned:</span>
                  <span className="font-extrabold text-emerald-700">
                    +₹{calcReturns.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-indigo-100 pt-3">
                  <span className="text-xs font-bold text-slate-700 uppercase">
                    Guaranteed Maturity:
                  </span>
                  <span className="text-xl font-extrabold text-[#1e2678]">
                    ₹{calcMaturity.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={openCreateWithCalculator}
                className="w-full rounded-xl bg-[#1e2678] py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#171d60]"
              >
                Open FD with this Plan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "active"
                ? "bg-[#1e2678] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Active Deposits ({activeFDs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("claimed")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "claimed"
                ? "bg-[#1e2678] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Matured & Claimed ({claimedFDs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("schedule")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "schedule"
                ? "bg-[#1e2678] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Interest Rates Matrix
          </button>
        </div>

        <span className="text-xs text-slate-500">
          Showing {activeTab === "active" ? activeFDs.length : activeTab === "claimed" ? claimedFDs.length : RATES_SCHEDULE.length} records
        </span>
      </div>

      {/* TAB 1: ACTIVE DEPOSITS */}
      {activeTab === "active" && (
        <section>
          {loading ? (
            <div className="flex h-48 items-center justify-center rounded-3xl bg-white shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Loading your fixed deposits...</p>
            </div>
          ) : activeFDs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 text-center shadow-md">
              <div className="grid h-16 w-16 place-items-center rounded-3xl bg-emerald-50 text-emerald-700">
                <MdSavings className="text-3xl" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No Active Fixed Deposits
              </h3>
              <p className="mt-1 max-w-md text-xs text-slate-500">
                Start growing your wealth today with high-yield fixed deposits. Earn up to 8.2% guaranteed returns.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1e2678] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#171d60]"
              >
                <MdAdd className="text-base" /> + Open First Fixed Deposit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {activeFDs.map((fd) => {
                const isMatured = new Date() >= new Date(fd.maturity_date);
                const startDate = new Date(fd.createdAt);
                const maturityDate = new Date(fd.maturity_date);

                const totalDuration = Math.max(1, maturityDate.getTime() - startDate.getTime());
                const elapsed = Math.max(0, Date.now() - startDate.getTime());
                const progressPct = Math.min(100, Math.round((elapsed / totalDuration) * 100));

                const formattedStartDate = startDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const formattedMaturityDate = maturityDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <div
                    key={fd._id}
                    className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-md transition hover:shadow-xl"
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                            <MdSavings className="text-xl" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              FD #{fd.fd_number}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Booked on {formattedStartDate}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                            isMatured
                              ? "bg-indigo-50 text-[#1e2678]"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {isMatured ? "Matured" : "Active"}
                        </span>
                      </div>

                      {/* Main Figures */}
                      <div className="mt-5 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4">
                        <div>
                          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Principal
                          </p>
                          <p className="mt-0.5 text-xl font-extrabold text-slate-900">
                            ₹{(fd.amount || 0).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                            Maturity Amount
                          </p>
                          <p className="mt-0.5 text-xl font-extrabold text-emerald-700">
                            ₹{(fd.maturity_amount || 0).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Tenure Progress: {progressPct}%</span>
                          <span>
                            {fd.months}M @ {fd.interest_rate}% p.a.
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Details Meta */}
                      <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-slate-500">
                            <MdCalendarMonth className="text-slate-400" /> Maturity Date:
                          </span>
                          <span className="font-semibold text-slate-800">
                            {formattedMaturityDate}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-slate-500">
                            <MdAccountBalance className="text-slate-400" /> Linked Account:
                          </span>
                          <span className="font-semibold text-slate-800">
                            A/C {fd.account?.account_no || "Primary"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-6 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => openClaimModal(fd)}
                        className={`w-full rounded-xl py-2.5 text-xs font-bold transition shadow-sm ${
                          isMatured
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "border border-[#1e2678]/20 bg-indigo-50/70 text-[#1e2678] hover:bg-[#1e2678] hover:text-white"
                        }`}
                      >
                        {isMatured ? "Claim Matured Funds" : "Claim / Break FD"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: CLAIMED / PAST FDs */}
      {activeTab === "claimed" && (
        <section>
          {claimedFDs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-10 text-center shadow-md">
              <p className="text-sm font-semibold text-slate-700">No Liquidated Fixed Deposits</p>
              <p className="mt-1 text-xs text-slate-500">
                When you break or claim your deposits, their settlement receipts will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl bg-white shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-4">FD Number</th>
                      <th className="px-6 py-4">Invested</th>
                      <th className="px-6 py-4">Tenure & Rate</th>
                      <th className="px-6 py-4">Maturity Value</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Settled Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {claimedFDs.map((fd) => {
                      const settledDate = fd.claimedAt
                        ? new Date(fd.claimedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Settled";
                      return (
                        <tr key={fd._id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-bold text-slate-900">
                            #{fd.fd_number}
                          </td>
                          <td className="px-6 py-4">
                            ₹{(fd.amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="px-6 py-4">
                            {fd.months}M @ {fd.interest_rate}%
                          </td>
                          <td className="px-6 py-4 font-bold text-emerald-700">
                            ₹{(fd.maturity_amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                              <MdCheckCircle className="text-emerald-600" /> Settled
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">{settledDate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: INTEREST RATES SCHEDULE */}
      {activeTab === "schedule" && (
        <section className="overflow-hidden rounded-3xl bg-white p-6 shadow-md sm:p-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              SBMS Fixed Deposit Interest Rate Schedule
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Interest rates applicable for domestic deposits. Compounding done on quarterly rests.
            </p>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-3.5">Tenure Period</th>
                  <th className="px-6 py-3.5">Interest Rate (p.a.)</th>
                  <th className="px-6 py-3.5">Quarterly Compounding</th>
                  <th className="px-6 py-3.5">Maturity on ₹1,00,000</th>
                  <th className="px-6 py-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {RATES_SCHEDULE.map((item) => (
                  <tr key={item.months} className="hover:bg-indigo-50/30">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">{item.tenure}</span>
                      {item.popular && (
                        <span className="ml-2 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-[#1e2678]">
                          POPULAR
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-extrabold text-emerald-700">
                      {item.rate}%
                    </td>
                    <td className="px-6 py-4 text-slate-500">Every 3 Months</td>
                    <td className="px-6 py-4 font-bold text-[#1e2678]">
                      {item.returnOnLakh}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => {
                          setCalcMonths(item.months);
                          setIsCreateOpen(true);
                        }}
                        className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-[#1e2678] transition hover:bg-[#1e2678] hover:text-white"
                      >
                        Select Plan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Modals */}
      <CreateFDModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleActionSuccess}
        prefillAmount={calcAmount}
        prefillMonths={calcMonths}
      />

      <ClaimFDModal
        isOpen={isClaimOpen}
        onClose={() => setIsClaimOpen(false)}
        fd={selectedFdForClaim}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
