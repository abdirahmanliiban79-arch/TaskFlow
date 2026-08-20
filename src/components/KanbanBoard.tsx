'use client'

import { useEffect, useState } from 'react'
import TaskCard from './taskCard'
import { updateTaskDay } from '@/app/actions/tasks'

export interface Task {
  id: string
  title: string
  description?: string | null
  status: string
  priority: string
  dayOfWeek: string
}

interface KanbanBoardProps {
  initialTasks: Task[]
}

const days = [
  { id: 'mon', name: 'Monday' },
  { id: 'tue', name: 'Tuesday' },
  { id: 'wed', name: 'Wednesday' },
  { id: 'thu', name: 'Thursday' },
  { id: 'fri', name: 'Friday' },
]

export default function KanbanBoard({ initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [activeDropDay, setActiveDropDay] = useState<string | null>(null)

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId)
    e.dataTransfer.effectAllowed = 'move'
    setDraggedTaskId(taskId)
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
    setActiveDropDay(null)
  }

  const handleDragOver = (e: React.DragEvent, dayId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setActiveDropDay(dayId)
  }

  const handleDrop = async (e: React.DragEvent, targetDayId: string) => {
    e.preventDefault()
    setActiveDropDay(null)
    setDraggedTaskId(null)

    const taskId = e.dataTransfer.getData('text/plain')
    if (!taskId) return

    const targetTask = tasks.find((t) => t.id === taskId)
    if (!targetTask || targetTask.dayOfWeek === targetDayId) return

    const originalDay = targetTask.dayOfWeek

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, dayOfWeek: targetDayId } : t))
    )

    const res = await updateTaskDay(taskId, targetDayId)
    if (res?.error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, dayOfWeek: originalDay } : t))
      )
    }
  }

  return (
    <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-4 select-none">
      {days.map((day) => {
        const dayTasks = tasks.filter((t) => t.dayOfWeek === day.id)
        const isHovered = activeDropDay === day.id

        return (
          <div
            key={day.id}
            onDragOver={(e) => handleDragOver(e, day.id)}
            onDrop={(e) => handleDrop(e, day.id)}
            className={`bg-slate-900/50 border rounded-2xl p-4 flex flex-col min-h-[520px] transition-all duration-200 ${
              isHovered
                ? 'border-blue-500/80 bg-blue-950/20 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10'
                : 'border-slate-800 hover:border-slate-700/80'
            }`}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h2 className="font-bold text-slate-200">{day.name}</h2>
              <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-semibold">
                {dayTasks.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 flex flex-col">
              {dayTasks.length === 0 ? (
                <div
                  className={`flex-1 min-h-[140px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-xs text-slate-500 transition-colors ${
                    isHovered
                      ? 'border-blue-500/60 bg-blue-500/5 text-blue-400'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {isHovered ? 'Drop task here' : 'No tasks'}
                </div>
              ) : (
                dayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isDragging={draggedTaskId === task.id}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </main>
  )
}
