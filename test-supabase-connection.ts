/**
 * Simple test script to verify Prisma is connected to Supabase
 * Run with: npx tsx test-supabase-connection.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env file
config({ path: resolve(process.cwd(), '.env') })

import { prisma } from './lib/prisma'

async function testConnection() {
  try {
    console.log('Testing Prisma connection to Supabase...\n')

    // Test 1: Count users
    const userCount = await prisma.users.count()
    console.log(`✓ Successfully connected! Found ${userCount} user(s) in the database.`)

    // Test 2: Count tasks
    const taskCount = await prisma.tasks.count()
    console.log(`✓ Found ${taskCount} task(s) in the database.`)

    // Test 3: Count projects
    const projectCount = await prisma.projects.count()
    console.log(`✓ Found ${projectCount} project(s) in the database.`)

    // Test 4: Count locations
    const locationCount = await prisma.locations.count()
    console.log(`✓ Found ${locationCount} location(s) in the database.`)

    // Test 5: Try a simple query with relations
    const tasksWithRelations = await prisma.tasks.findMany({
      take: 1,
      include: {
        projects: true,
        locations: true,
      },
    })
    console.log(`✓ Successfully queried tasks with relations.`)

    console.log('\n✅ All tests passed! Prisma is successfully connected to Supabase.')
    console.log('\nYou can now verify the data in your Supabase dashboard:')
    console.log('1. Go to your Supabase project dashboard')
    console.log('2. Navigate to Table Editor')
    console.log('3. Check the tables: users, tasks, projects, locations, etc.')
    
  } catch (error) {
    console.error('\n❌ Connection test failed!')
    console.error('Error:', error)
    console.error('\nPlease check:')
    console.error('1. Your DATABASE_URL in .env file is correct')
    console.error('2. Your Supabase database is accessible')
    console.error('3. The schema has been imported to Supabase')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

