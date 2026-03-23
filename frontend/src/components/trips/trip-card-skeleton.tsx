export function TripCardSkeleton() {
  return (
    <div className="shadow-card flex h-full flex-col rounded-2xl bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200" />
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="mb-4 h-8 animate-pulse rounded bg-slate-100" />
      <div className="mt-auto flex items-center justify-between">
        <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}
