import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

export async function getServerSession() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set(name, value, options)
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set(name, '', { ...options, maxAge: 0 })
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

/**
 * Gets the authenticated user_id from Supabase session.
 * If the user doesn't exist in the users table, creates one.
 * Returns null if not authenticated.
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await getServerSession()
  
  if (!session?.user?.id) {
    return null
  }

  const supabaseUserId = session.user.id

  try {
    // Check if user exists in our users table
    let user = await prisma.users.findUnique({
      where: { user_id: supabaseUserId },
    })

    // If user doesn't exist, create one
    if (!user) {
      try {
        user = await prisma.users.create({
          data: {
            user_id: supabaseUserId,
            username: session.user.email?.split('@')[0] || 'user',
            email: session.user.email || '',
            auto_location_filter: true,
          },
        })
      } catch (createError: any) {
        // Handle race condition: if another request already created the user
        // (unique constraint on email or user_id), fetch it instead
        if (createError?.code === 'P2002') {
          // Unique constraint violation - user was created by another request
          // Try to fetch the user again (could be by user_id or email)
          user = await prisma.users.findUnique({
            where: { user_id: supabaseUserId },
          })
          
          // If still not found, try by email as fallback
          if (!user && session.user.email) {
            user = await prisma.users.findUnique({
              where: { email: session.user.email },
            })
          }
          
          // If we still can't find the user, something went wrong
          if (!user) {
            console.error('User creation failed and could not be found:', createError)
            return null
          }
        } else {
          // Some other error occurred
          throw createError
        }
      }
    }

    return user.user_id
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}

/**
 * Gets a Supabase client configured with the current session for RLS.
 * This client can be used for direct Supabase queries that respect RLS policies.
 */
export async function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set(name, value, options)
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set(name, '', { ...options, maxAge: 0 })
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })

  return supabase
}

