'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get initial session and handle OAuth redirect
    const getInitialSession = async () => {
      try {
        // This will handle the OAuth redirect and extract tokens from URL hash
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        }
        
        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        console.log('Full session data:', session)
        console.log('User metadata:', session?.user?.user_metadata)
        console.log('App metadata:', session?.user?.app_metadata)
        
        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }

        // Handle successful sign in
        if (event === 'SIGNED_IN' && session) {
          console.log('User successfully signed in:', session.user.email)
          // Clear any URL hash after successful auth
          if (typeof window !== 'undefined' && window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname)
          }
        }

        // Handle sign in errors
        if (event === 'SIGNED_OUT') {
          console.log('User signed out')
        }

        // Log any auth errors
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed for user:', session?.user?.email)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    loading,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 