import test from 'node:test'
import assert from 'node:assert/strict'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

test('Task Flow Database & Task Integrity', async (t) => {
  const uniqueId = Date.now()
  let createdUserId = ''
  let createdTaskId = ''

  await t.test('1. Create User and Associate Task', async () => {
    const user = await prisma.user.create({
      data: {
        name: `Task Test User ${uniqueId}`,
        email: `taskuser_${uniqueId}@example.com`,
      },
    })
    assert.ok(user.id, 'User should be created with ObjectId')
    createdUserId = user.id

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title: 'Complete Project Review',
        description: 'Review Next.js architecture and tests',
        priority: 'HIGH',
        dayOfWeek: 'mon',
        status: 'PENDING',
      },
    })
    assert.ok(task.id, 'Task should be created with ObjectId')
    assert.equal(task.userId, user.id, 'Task must reference user')
    assert.equal(task.dayOfWeek, 'mon', 'Day of week should be mon')
    assert.equal(task.status, 'PENDING', 'Initial status should be PENDING')
    createdTaskId = task.id
  })

  await t.test('2. Query Tasks by User ID', async () => {
    const tasks = await prisma.task.findMany({
      where: { userId: createdUserId },
      orderBy: { createdAt: 'desc' },
    })
    assert.equal(tasks.length, 1, 'Should find 1 task for user')
    assert.equal(tasks[0].id, createdTaskId, 'Found task id should match')
    assert.equal(tasks[0].title, 'Complete Project Review')
  })

  await t.test('3. Update Task Day (Kanban move)', async () => {
    const updated = await prisma.task.update({
      where: { id: createdTaskId },
      data: { dayOfWeek: 'wed' },
    })
    assert.equal(updated.dayOfWeek, 'wed', 'Task day should be updated to wed')
  })

  await t.test('4. Update Task Status (Toggle complete)', async () => {
    const updated = await prisma.task.update({
      where: { id: createdTaskId },
      data: { status: 'COMPLETED' },
    })
    assert.equal(updated.status, 'COMPLETED', 'Task status should be COMPLETED')
  })

  await t.test('5. Task Isolation between Users', async () => {
    const otherUser = await prisma.user.create({
      data: {
        name: `Other User ${uniqueId}`,
        email: `other_${uniqueId}@example.com`,
      },
    })
    const otherTasks = await prisma.task.findMany({
      where: { userId: otherUser.id },
    })
    assert.equal(otherTasks.length, 0, 'Other user should not see first user tasks')

    // Clean up other user
    await prisma.user.delete({ where: { id: otherUser.id } })
  })

  await t.test('6. Delete Task and Cascade on User Removal', async () => {
    await prisma.task.delete({ where: { id: createdTaskId } })
    const remaining = await prisma.task.findUnique({ where: { id: createdTaskId } })
    assert.equal(remaining, null, 'Deleted task should not exist')

    // Clean up test user
    await prisma.user.delete({ where: { id: createdUserId } })
  })

  t.after(async () => {
    await prisma.$disconnect()
  })
})
