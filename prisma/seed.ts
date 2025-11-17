import { PrismaClient } from '../app/generated/prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding priority levels...')

  // Insert priority levels
  const priorities = ['LOW', 'MEDIUM', 'HIGH']
  
  for (const priority of priorities) {
    await prisma.priorities.upsert({
      where: { priority_level: priority },
      update: {},
      create: {
        priority_level: priority,
      },
    })
    console.log(`✓ Created/updated priority: ${priority}`)
  }

  console.log('Seeding default project...')

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
    console.log('✓ Created default user')
  }

  // Ensure "Miscellaneous" project exists
  const miscellaneousProject = await prisma.projects.findFirst({
    where: { project_name: 'Miscellaneous' },
  })

  if (!miscellaneousProject) {
    await prisma.projects.create({
      data: {
        project_id: randomUUID(),
        user_id: user.user_id,
        project_name: 'Miscellaneous',
        project_description: 'Default project for one-offs or tasks that don\'t require a specific project',
      },
    })
    console.log('✓ Created/updated project: Miscellaneous')
  } else {
    console.log('✓ Project "Miscellaneous" already exists')
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

