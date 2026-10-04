'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { TASKS_CACHE_TAG } from '@/lib/tasks'
import { revalidatePath, updateTag } from 'next/cache'

async function getSessionUser() {
  const session = await getSession()
  return session?.user || null
}

function invalidateTasks() {
  updateTag(TASKS_CACHE_TAG)
  revalidatePath('/')
}

export async function createTask(formData: FormData) {
  const user = await getSessionUser()
  if (!user) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = (formData.get('priority') as string) || 'MEDIUM'
  const dayOfWeek = (formData.get('dayOfWeek') as string) || 'mon'

  if (!title) return { error: 'Title is required' }

  try {
    await prisma.task.create({
      data: {
        userId: user.id,
        title,
        description,
        priority,
        dayOfWeek,
        status: 'PENDING',
      },
    })

    invalidateTasks()
    return { success: true }
  } catch (error) {
    console.error('Failed to create task:', error)
    return { error: 'Failed to create task' }
  }
}

export async function updateTaskDay(id: string, dayOfWeek: string) {
  const user = await getSessionUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    const result = await prisma.task.updateMany({
      where: { id, userId: user.id },
      data: { dayOfWeek },
    })

    if (result.count === 0) return { error: 'Task not found' }

    invalidateTasks()
    return { success: true }
  } catch (error) {
    console.error('Failed to update task day:', error)
    return { error: 'Failed to update task day' }
  }
}

export async function updateTaskStatus(id: string, status: string) {
  const user = await getSessionUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    await prisma.task.update({
      where: { id, userId: user.id },
      data: { status },
    })

    invalidateTasks()
    return { success: true }
  } catch (error) {
    console.error('Failed to update status:', error)
    return { error: 'Failed to update status' }
  }
}

export async function deleteTask(id: string) {
  const user = await getSessionUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    await prisma.task.delete({
      where: { id, userId: user.id },
    })

    invalidateTasks()
    return { success: true }
  } catch (error) {
    console.error('Failed to delete task:', error)
    return { error: 'Failed to delete task' }
  }
}