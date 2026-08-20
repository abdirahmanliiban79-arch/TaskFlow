'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getSessionUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session?.user || null
}

export async function getTasks() {
  const user = await getSessionUser()
  if (!user) return []

  try {
    return await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    return []
  }
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

    revalidatePath('/')
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

    revalidatePath('/')
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

    revalidatePath('/')
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

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete task:', error)
    return { error: 'Failed to delete task' }
  }
}