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
            project_id: true,
            project_name: true,
          },
        },
        priorities: true,
        locations: {
          select: {
            location_id: true,
            location_name: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })
    
    // Convert Decimal values to numbers for client components
    return tasks.map(task => ({
      ...task,
      locations: task.locations ? {
        location_id: task.locations.location_id,
        location_name: task.locations.location_name,
        latitude: task.locations.latitude ? Number(task.locations.latitude) : null,
        longitude: task.locations.longitude ? Number(task.locations.longitude) : null,
      } : null,
    }))
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

export async function getLocations() {
  try {
    const locations = await prisma.locations.findMany({
      select: {
        location_id: true,
        location_name: true,
        latitude: true,
        longitude: true,
      },
    })
    
    // Convert Decimal values to numbers for client components
    return locations
      .map(location => ({
        location_id: location.location_id,
        location_name: location.location_name,
        latitude: location.latitude ? Number(location.latitude) : null,
        longitude: location.longitude ? Number(location.longitude) : null,
      }))
      .filter((location): location is { location_id: string; location_name: string; latitude: number; longitude: number } => 
        location.latitude !== null && location.longitude !== null
      )
  } catch (error) {
    console.error('Error fetching locations:', error)
    throw error
  }
}

export async function createProject(projectName: string) {
  try {
    // Ensure a default user exists
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

    // Check if project with same name already exists
    const existingProject = await prisma.projects.findFirst({
      where: { project_name: projectName },
    })

    if (existingProject) {
      throw new Error('A project with this name already exists')
    }

    // Create the project
    const project = await prisma.projects.create({
      data: {
        project_id: randomUUID(),
        user_id: user.user_id,
        project_name: projectName.trim(),
      },
      select: {
        project_id: true,
        project_name: true,
      },
    })

    revalidatePath('/')
    return project
  } catch (error) {
    console.error('Error creating project:', error)
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

interface LocationData {
  address: string
  lat: number
  lng: number
}

export async function createTask(
  taskDescription: string, 
  projectId?: string,
  location?: LocationData,
  dueDate?: Date | string
) {
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

    // Create location if provided
    let locationId: string | undefined = undefined
    if (location) {
      // Ensure a default user exists
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

      // Create location in database
      const createdLocation = await prisma.locations.create({
        data: {
          location_id: randomUUID(),
          user_id: user.user_id,
          location_name: location.address,
          latitude: location.lat,
          longitude: location.lng,
          radius: 100, // Default radius of 100 meters
        },
      })

      locationId = createdLocation.location_id
    }

    // Create the task
    const task = await prisma.tasks.create({
      data: {
        task_id: randomUUID(),
        task_description: taskDescription,
        project_id: project.project_id,
        location_id: locationId,
        due_date: dueDate ? new Date(dueDate) : null,
      },
      include: {
        projects: {
          select: {
            project_name: true,
          },
        },
        priorities: true,
        locations: {
          select: {
            location_name: true,
          },
        },
      },
    })

    revalidatePath('/')
    return task
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

export async function updateTaskDueDate(taskId: string, dueDate: Date | string | null) {
  try {
    let parsedDate: Date | null = null
    
    if (dueDate) {
      if (typeof dueDate === 'string') {
        // Parse date string in local time to avoid timezone issues
        // Format: YYYY-MM-DD
        const [year, month, day] = dueDate.split('-').map(Number)
        parsedDate = new Date(year, month - 1, day)
      } else {
        parsedDate = dueDate
      }
    }

    await prisma.tasks.update({
      where: {
        task_id: taskId,
      },
      data: {
        due_date: parsedDate,
      },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error updating task due date:', error)
    throw error
  }
}

export async function deleteTask(taskId: string) {
  try {
    await prisma.tasks.delete({
      where: {
        task_id: taskId,
      },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error deleting task:', error)
    throw error
  }
}

