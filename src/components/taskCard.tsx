'use client'

import { deleteTask, updateTaskStatus } from '@/app/actions/tasks'
import { Trash2, CheckCircle, Clock, GripVertical } from 'lucide-react'

interface TaskProps {
  task: {
    id: string
    title: string
    description?: string | null
    status: string
    priority: string
    dayOfWeek: string
  }
  isDragging?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
}

export default function TaskCard({ task, isDragging, onDragStart, onDragEnd }: TaskProps) {
  const priorityColors: Record<string, string> = {
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    MEDIUM: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    HIGH: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    URGENT: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3 transition-all duration-150 group relative cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-40 scale-95 border-blue-500/50 shadow-lg' : 'opacity-100 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <GripVertical className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 mt-0.5" />
          <h3 className="font-semibold text-slate-100 text-sm leading-snug">{task.title}</h3>
        </div>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => deleteTask(task.id)}
          className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition p-1 shrink-0"
          title="Delete Task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 pl-6">{task.description}</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
        <span className={`px-2 py-0.5 rounded-full border ${priorityColors[task.priority] || priorityColors.MEDIUM}`}>
          {task.priority}
        </span>

        <div className="flex gap-1">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => updateTaskStatus(task.id, task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED')}
            className={`p-1 rounded-lg border transition ${
              task.status === 'COMPLETED'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            {task.status === 'COMPLETED' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}