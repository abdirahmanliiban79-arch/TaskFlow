import { Suspense } from 'react'
import { getSession } from '@/lib/session'
import { getTasksForUser } from '@/lib/tasks'
import AddTaskModal from '@/components/addTaskModal'
import KanbanBoard from '@/components/KanbanBoard'
import AIAssistant from '@/components/AIAssistant'
import HeaderAuth from '@/components/HeaderAuth'
import BoardSkeleton from '@/components/BoardSkeleton'

async function UserControls() {
  const session = await getSession()
  const user = session?.user

  if (!user) return null

  return (
    <>
      <AddTaskModal />
      <HeaderAuth user={user} />
    </>
  )
}

async function HomeContent() {
  const session = await getSession()
  const user = session?.user

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 my-10">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Welcome to TaskFlow</h2>
        <p className="text-slate-400 text-sm mb-6">
          Please sign in or create an account to start managing your daily schedule and tasks with AI.
        </p>
        <HeaderAuth user={null} showButtonText="Get Started" />
      </div>
    )
  }

  const tasks = await getTasksForUser(user.id)

  return <KanbanBoard initialTasks={tasks} />
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 relative">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            TaskFlow
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Task Planner
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Suspense fallback={null}>
            <UserControls />
          </Suspense>
        </div>
      </header>

      {/* If Not Authenticated */}
      <Suspense fallback={<BoardSkeleton />}>
        <HomeContent />
      </Suspense>

      {/* Gemini AI Assistant */}
      <AIAssistant />
    </div>
  )
}