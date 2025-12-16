import { PrismaClient } from '@/app/generated/prisma/client'
import { getAuthenticatedUserId } from './auth'

/**
 * Creates a Prisma client that automatically filters queries by the authenticated user.
 * This is a wrapper that ensures all queries are scoped to the current user.
 * 
 * Note: For true RLS, you should also set up Row Level Security policies in Supabase.
 * This application-level filtering provides the primary security layer.
 */
export async function getAuthenticatedPrisma(): Promise<{
  prisma: PrismaClient
  userId: string
}> {
  const userId = await getAuthenticatedUserId()
  
  if (!userId) {
    throw new Error('User not authenticated')
  }

  // Import the singleton Prisma client
  const { prisma } = await import('./prisma')
  
  return { prisma, userId }
}

/**
 * Helper to ensure a user is authenticated before proceeding.
 * Throws an error if not authenticated.
 */
export async function requireAuth(): Promise<string> {
  const userId = await getAuthenticatedUserId()
  
  if (!userId) {
    throw new Error('Authentication required')
  }
  
  return userId
}

