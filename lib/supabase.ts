import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Get the correct redirect URL based on environment
const getRedirectUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use current origin
    return window.location.origin
  }
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Helper function for OAuth sign in with correct redirect
export const signInWithGoogle = async (redirectTo?: string) => {
  const redirect = redirectTo || getRedirectUrl()
  
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirect,
      queryParams: {
        prompt: 'select_account'
      }
    }
  })
} 