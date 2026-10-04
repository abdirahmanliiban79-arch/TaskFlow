import BoardSkeleton from '@/components/BoardSkeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="h-8 w-36 rounded-lg bg-slate-800/80 animate-pulse" />
          <div className="h-4 w-24 mt-2 rounded bg-slate-800/60 animate-pulse" />
        </div>
        <div className="h-10 w-28 rounded-xl bg-slate-800/60 animate-pulse" />
      </div>

      <BoardSkeleton />
    </div>
  )
}