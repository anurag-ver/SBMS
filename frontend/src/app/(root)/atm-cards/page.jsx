export default function AtmCardsPage() {
  return (
    <section className="rounded-3xl bg-white p-7 shadow-sm sm:p-10">
      <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold tracking-[0.16em] text-[#1e2678]">
        CARD MANAGEMENT
      </span>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">ATM & Debit Cards</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Manage your virtual ATM debit card, set ATM PIN, adjust transaction limits, and block/unblock cards.
      </p>
    </section>
  );
}
