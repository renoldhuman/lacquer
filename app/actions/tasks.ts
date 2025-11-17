'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'

export async function getTasks() {
  try {
    const tasks = await prisma.tasks.findMany({
      include: {
        projects: {
          select: {
            project_name: true,
          },
        },
        priorities: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })
    return tasks
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw error
  }
}

export async function getProjects() {
  try {
    const projects = await prisma.projects.findMany({
      select: {
        project_id: true,
        project_name: true,
      },
      orderBy: {
        project_name: 'asc',
      },
    })
    return projects
  } catch (error) {
    console.error('Error fetching projects:', error)
    throw error
  }
}

async function ensureMiscellaneousProject() {
  // First, ensure a default user exists
  let user = await prisma.users.findFirst()
  
  if (!user) {
    user = await prisma.users.create({
      data: {
        user_id: randomUUID(),
        username: 'default',
        email: 'default@example.com',
      },
    })
  }

  // Ensure "Miscellaneous" project exists
  let project = await prisma.projects.findFirst({
    where: { project_name: 'Miscellaneous' },
  })

  if (!project) {
    project = await prisma.projects.create({
      data: {
        project_id: randomUUID(),
        user_id: user.user_id,
        project_name: 'Miscellaneous',
        project_description: 'Default project for one-offs or tasks that don\'t require a specific project',
      },
    })
  }

  return project
}

export async function createTask(taskDescription: string, projectId?: string) {
  try {
    let project
    
    if (projectId) {
      // Use the specified project
      project = await prisma.projects.findUnique({
        where: { project_id: projectId },
      })
      
      if (!project) {
        throw new Error('Specified project not found')
      }
    } else {
      // If no project specified, use Miscellaneous
      project = await ensureMiscellaneousProject()
    }

    // Create the task
    const task = await prisma.tasks.create({
      data: {
        task_id: randomUUID(),
        task_description: taskDescription,
        project_id: project.project_id,
      },
      include: {
        projects: {
          select: {
            project_name: true,
          },
        },
        priorities: true,
      },
    })

    revalidatePath('/')
    return task
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

