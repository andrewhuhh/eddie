import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = 'https://yrwzqqojoqnvxvimmtix.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyd3pxcW9qb3Fudnh2aW1tdGl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1Nzc3NjgsImV4cCI6MjA2NDE1Mzc2OH0.Wjg-Snb_zq9UhGo0Salvi_aptSv4WwwMh4xMRQFkz-U'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

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