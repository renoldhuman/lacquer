'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/prisma-auth'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'

export async function getTasks() {
  try {
    const userId = await requireAuth()
    
    const tasks = await prisma.tasks.findMany({
      where: {
        projects: {
          user_id: userId,
        },
      },
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
        task_notes: {
          select: {
            task_note_id: true,
            task_note_content: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })
    
    type TaskRow = (typeof tasks)[number]

    // Convert Decimal values to numbers for client components
    return tasks.map((task: TaskRow) => ({
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
    const userId = await requireAuth()
    
    const projects = await prisma.projects.findMany({
      where: {
        user_id: userId,
      },
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

export async function getProjectsWithTasks() {
  try {
    const userId = await requireAuth()
    
    const projects = await prisma.projects.findMany({
      where: {
        user_id: userId,
      },
      include: {
        tasks: {
          include: {
            priorities: true,
            locations: {
              select: {
                location_id: true,
                location_name: true,
                latitude: true,
                longitude: true,
              },
            },
            task_notes: {
              select: {
                task_note_id: true,
                task_note_content: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        },
      },
      orderBy: {
        project_name: 'asc',
      },
    })
    
    type ProjectRow = (typeof projects)[number]
    type ProjectTaskRow = ProjectRow['tasks'][number]

    // Convert Decimal values to numbers for client components
    return projects.map((project: ProjectRow) => ({
      ...project,
      tasks: project.tasks.map((task: ProjectTaskRow) => ({
        ...task,
        projects: {
          project_id: project.project_id,
          project_name: project.project_name,
        },
        locations: task.locations ? {
          location_id: task.locations.location_id,
          location_name: task.locations.location_name,
          latitude: task.locations.latitude ? Number(task.locations.latitude) : null,
          longitude: task.locations.longitude ? Number(task.locations.longitude) : null,
        } : null,
      })),
    }))
  } catch (error) {
    console.error('Error fetching projects with tasks:', error)
    throw error
  }
}

export async function getLocationsWithTasks() {
  try {
    const userId = await requireAuth()
    
    const locations = await prisma.locations.findMany({
      where: {
        user_id: userId,
      },
      include: {
        tasks: {
          where: {
            projects: {
              user_id: userId,
            },
          },
          include: {
            priorities: true,
            projects: {
              select: {
                project_id: true,
                project_name: true,
              },
            },
            task_notes: {
              select: {
                task_note_id: true,
                task_note_content: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        },
      },
      orderBy: {
        location_name: 'asc',
      },
    })
    
    // Get tasks without locations
    const tasksWithoutLocations = await prisma.tasks.findMany({
      where: {
        location_id: null,
        projects: {
          user_id: userId,
        },
      },
      include: {
        priorities: true,
        projects: {
          select: {
            project_id: true,
            project_name: true,
          },
        },
        task_notes: {
          select: {
            task_note_id: true,
            task_note_content: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })
    
    type LocationRow = (typeof locations)[number]
    type LocationTaskRow = LocationRow['tasks'][number]
    type TaskWithoutLocationRow = (typeof tasksWithoutLocations)[number]

    // Convert Decimal values to numbers for client components
    const locationsWithTasks = locations.map((location: LocationRow) => ({
      ...location,
      latitude: location.latitude ? Number(location.latitude) : null,
      longitude: location.longitude ? Number(location.longitude) : null,
      tasks: location.tasks.map((task: LocationTaskRow) => ({
        ...task,
        locations: {
          location_id: location.location_id,
          location_name: location.location_name,
          latitude: location.latitude ? Number(location.latitude) : null,
          longitude: location.longitude ? Number(location.longitude) : null,
        },
      })),
    }))
    
    // Add "Anywhere" group for tasks without locations
    const anywhereGroup = {
      location_id: 'anywhere',
      location_name: 'Anywhere',
      latitude: null,
      longitude: null,
      radius: 0,
      tasks: tasksWithoutLocations.map((task: TaskWithoutLocationRow) => ({
        ...task,
        locations: null,
      })),
    }
    
    // Combine locations with "Anywhere" group, placing "Anywhere" first
    return [anywhereGroup, ...locationsWithTasks]
  } catch (error) {
    console.error('Error fetching locations with tasks:', error)
    throw error
  }
}

export async function getLocations() {
  try {
    const userId = await requireAuth()
    
    const locations = await prisma.locations.findMany({
      where: {
        user_id: userId,
      },
      select: {
        location_id: true,
        location_name: true,
        latitude: true,
        longitude: true,
      },
    })
    
    type LocationRow = (typeof locations)[number]
    type MappedLocation = { location_id: string; location_name: string; latitude: number | null; longitude: number | null }

    // Convert Decimal values to numbers for client components
    return locations
      .map((location: LocationRow) => ({
        location_id: location.location_id,
        location_name: location.location_name,
        latitude: location.latitude ? Number(location.latitude) : null,
        longitude: location.longitude ? Number(location.longitude) : null,
      }))
      .filter((location: MappedLocation): location is { location_id: string; location_name: string; latitude: number; longitude: number } => 
        location.latitude !== null && location.longitude !== null
      )
  } catch (error) {
    console.error('Error fetching locations:', error)
    throw error
  }
}

export async function getUserAutoLocationFilter() {
  try {
    const userId = await requireAuth()
    
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        auto_location_filter: true,
      },
    })
    
    // Return true by default if no user exists
    return user?.auto_location_filter ?? true
  } catch (error) {
    console.error('Error fetching user auto_location_filter:', error)
    // Return true by default on error
    return true
  }
}

export async function updateUserAutoLocationFilter(enabled: boolean) {
  try {
    const userId = await requireAuth()
    
    // Update authenticated user's setting
    await prisma.users.update({
      where: { user_id: userId },
      data: { auto_location_filter: enabled },
    })
    
    revalidatePath('/settings')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error updating user auto_location_filter:', error)
    throw error
  }
}

export async function createProject(projectName: string, projectDescription?: string | null) {
  try {
    const userId = await requireAuth()

    // Check if project with same name already exists for this user
    const existingProject = await prisma.projects.findFirst({
      where: { 
        project_name: projectName,
        user_id: userId,
      },
    })

    if (existingProject) {
      throw new Error('A project with this name already exists')
    }

    // Create the project
    const project = await prisma.projects.create({
      data: {
        project_id: randomUUID(),
        user_id: userId,
        project_name: projectName.trim(),
        project_description: projectDescription?.trim() || null,
      },
      select: {
        project_id: true,
        project_name: true,
      },
    })

    revalidatePath('/')
    revalidatePath('/projects')
    return project
  } catch (error) {
    console.error('Error creating project:', error)
    throw error
  }
}

export async function deleteProject(projectId: string) {
  try {
    const userId = await requireAuth()

    const project = await prisma.projects.findFirst({
      where: {
        project_id: projectId,
        user_id: userId,
      },
      select: {
        project_id: true,
        project_name: true,
      },
    })

    if (!project) {
      throw new Error('Project not found or access denied')
    }

    if (project.project_name === 'Miscellaneous') {
      throw new Error('The Miscellaneous project cannot be deleted')
    }

    // Delete tasks in this project first
    const taskNoteIds = await prisma.tasks.findMany({
      where: { project_id: project.project_id },
      select: { task_note_id: true },
    })
    type TaskNoteRow = (typeof taskNoteIds)[number]

    await prisma.tasks.deleteMany({
      where: { project_id: project.project_id },
    })

    // Delete the project
    await prisma.projects.delete({
      where: { project_id: project.project_id },
    })

    // Best-effort cleanup of orphaned notes (notes are 1:1 via unique task_note_id)
    const noteIds = taskNoteIds
      .map((t: TaskNoteRow) => t.task_note_id)
      .filter((id: string | null): id is string => !!id)
    if (noteIds.length > 0) {
      const stillReferenced = await prisma.tasks.findMany({
        where: { task_note_id: { in: noteIds } },
        select: { task_note_id: true },
      })
      type StillReferencedRow = (typeof stillReferenced)[number]
      const referencedSet = new Set(
        stillReferenced
          .map((t: StillReferencedRow) => t.task_note_id)
          .filter((id: string | null): id is string => !!id)
      )
      const deletable = noteIds.filter((id: string) => !referencedSet.has(id))
      if (deletable.length > 0) {
        await prisma.task_notes.deleteMany({
          where: { task_note_id: { in: deletable } },
        })
      }
    }

    revalidatePath('/')
    revalidatePath('/projects')
    revalidatePath('/locations')

    return { success: true }
  } catch (error) {
    console.error('Error deleting project:', error)
    throw error
  }
}

async function ensureMiscellaneousProject(userId: string) {
  // Ensure "Miscellaneous" project exists for this user
  let project = await prisma.projects.findFirst({
    where: { 
      project_name: 'Miscellaneous',
      user_id: userId,
    },
  })

  if (!project) {
    project = await prisma.projects.create({
      data: {
        project_id: randomUUID(),
        user_id: userId,
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
  dueDate?: Date | string,
  priorityLevel?: string
) {
  try {
    const userId = await requireAuth()
    let project
    
    if (projectId) {
      // Use the specified project, but verify it belongs to the user
      project = await prisma.projects.findFirst({
        where: { 
          project_id: projectId,
          user_id: userId,
        },
      })
      
      if (!project) {
        throw new Error('Specified project not found or access denied')
      }
    } else {
      // If no project specified, use Miscellaneous
      project = await ensureMiscellaneousProject(userId)
    }

    // Create location if provided, or use existing one if coordinates match
    let locationId: string | undefined = undefined
    if (location) {
      // Check if a location with the same coordinates already exists for this user
      // Use a small tolerance (0.0001 degrees ≈ 11 meters) to account for minor variations
      const tolerance = 0.0001
      const existingLocation = await prisma.locations.findFirst({
        where: {
          user_id: userId,
          latitude: {
            gte: location.lat - tolerance,
            lte: location.lat + tolerance,
          },
          longitude: {
            gte: location.lng - tolerance,
            lte: location.lng + tolerance,
          },
        },
      })

      if (existingLocation) {
        // Use existing location
        locationId = existingLocation.location_id
      } else {
        // Create new location in database for this user
        const createdLocation = await prisma.locations.create({
          data: {
            location_id: randomUUID(),
            user_id: userId,
            location_name: location.address,
            latitude: location.lat,
            longitude: location.lng,
            radius: 100, // Default radius of 100 meters
          },
        })

        locationId = createdLocation.location_id
      }
    }

    // Create the task
    const task = await prisma.tasks.create({
      data: {
        task_id: randomUUID(),
        task_description: taskDescription,
        project_id: project.project_id,
        location_id: locationId,
        due_date: dueDate ? new Date(dueDate) : null,
        priority_level: priorityLevel && ['LOW', 'MEDIUM', 'HIGH'].includes(priorityLevel) ? priorityLevel : null,
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
    const userId = await requireAuth()
    
    // Verify task belongs to user
    const task = await prisma.tasks.findFirst({
      where: {
        task_id: taskId,
        projects: {
          user_id: userId,
        },
      },
    })
    
    if (!task) {
      throw new Error('Task not found or access denied')
    }
    
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

export async function updateTaskCompletion(taskId: string, isCompleted: boolean) {
  try {
    const userId = await requireAuth()
    
    // Verify task belongs to user
    const task = await prisma.tasks.findFirst({
      where: {
        task_id: taskId,
        projects: {
          user_id: userId,
        },
      },
    })
    
    if (!task) {
      throw new Error('Task not found or access denied')
    }
    
    await prisma.tasks.update({
      where: {
        task_id: taskId,
      },
      data: {
        is_completed: isCompleted,
      },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error updating task completion:', error)
    throw error
  }
}

export async function deleteTask(taskId: string) {
  try {
    const userId = await requireAuth()
    
    // Verify task belongs to user
    const task = await prisma.tasks.findFirst({
      where: {
        task_id: taskId,
        projects: {
          user_id: userId,
        },
      },
    })
    
    if (!task) {
      throw new Error('Task not found or access denied')
    }
    
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

export async function upsertTaskNote(taskId: string, content: string) {
  try {
    const userId = await requireAuth()
    
    // Get the task to check if it already has a note and verify ownership
    const task = await prisma.tasks.findFirst({
      where: { 
        task_id: taskId,
        projects: {
          user_id: userId,
        },
      },
      select: { task_note_id: true },
    })
    
    if (!task) {
      throw new Error('Task not found or access denied')
    }

    if (task?.task_note_id) {
      // Update existing note
      await prisma.task_notes.update({
        where: { task_note_id: task.task_note_id },
        data: {
          task_note_content: content,
          updated_at: new Date(),
        },
      })
    } else {
      // Create new note and link it to the task
      const noteId = randomUUID()
      await prisma.task_notes.create({
        data: {
          task_note_id: noteId,
          task_note_content: content,
        },
      })
      
      await prisma.tasks.update({
        where: { task_id: taskId },
        data: { task_note_id: noteId },
      })
    }

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error upserting task note:', error)
    throw error
  }
}

