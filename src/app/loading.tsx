export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3" role="status" aria-label="Loading C2V space">
      <span className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-teal-400 text-white shadow-md">
        <svg width="22" height="22" viewBox="0 0 64 64" aria-hidden="true">
          <polygon points="25,17 50,32 25,47" fill="#ffffff" />
        </svg>
      </span>
      <p className="text-[13px] font-medium text-zinc-500">Warming up the compiler…</p>
    </div>
  );
}
