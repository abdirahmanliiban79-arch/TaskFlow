import { getTasks } from '@/app/actions/tasks'
import AddTaskModal from '@/components/addTaskModal'
import KanbanBoard from '@/components/KanbanBoard'
import AIAssistant from '@/components/AIAssistant'
import HeaderAuth from '@/components/HeaderAuth'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const user = session?.user || null

  const tasks = user ? await getTasks() : []

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
          {user ? (
            <>
              <AddTaskModal />
              <HeaderAuth user={user} />
            </>
          ) : null}
        </div>
      </header>

      {/* If Not Authenticated */}
      {!user ? (
        <div className="max-w-md mx-auto text-center py-20 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 my-10">
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Welcome to TaskFlow</h2>
          <p className="text-slate-400 text-sm mb-6">
            Please sign in or create an account to start managing your daily schedule and tasks with AI.
          </p>
          <HeaderAuth user={null} showButtonText="Get Started" />
        </div>
      ) : (
        /* 5-Day Interactive Drag & Drop Kanban Board */
        <KanbanBoard initialTasks={tasks} />
      )}

      {/* Gemini AI Assistant */}
      <AIAssistant />
    </div>
  )
}