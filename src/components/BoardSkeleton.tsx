const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default function BoardSkeleton() {
  return (
    <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-4 select-none">
      {days.map((day) => (
        <div
          key={day}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[520px]"
        >
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div className="h-5 w-20 rounded bg-slate-800/80 animate-pulse" />
            <div className="h-5 w-7 rounded-full bg-slate-800/60 animate-pulse" />
          </div>

          <div className="space-y-3 flex-1">
            <div className="h-24 rounded-2xl bg-slate-800/40 animate-pulse" />
            <div className="h-24 rounded-2xl bg-slate-800/30 animate-pulse" />
            <div className="h-24 rounded-2xl bg-slate-800/20 animate-pulse" />
          </div>
        </div>
      ))}
    </main>
  )
}