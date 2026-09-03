export default function Loader() {
  return (
    <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#1e2678] border-r-[#1e2678]" />
        <div className="absolute inset-3 rounded-full bg-[#1e2678]" />
      </div>
      <p className="text-sm font-semibold tracking-wide text-[#1e2678]">Loading your account...</p>
    </div>
  );
}
