import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const TASKS_CACHE_TAG = 'tasks'

export const getTasksForUser = unstable_cache(
  async (userId: string) => {
    return prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dayOfWeek: true,
      },
    })
  },
  ['tasks-by-user'],
  { revalidate: 30, tags: [TASKS_CACHE_TAG] }
)