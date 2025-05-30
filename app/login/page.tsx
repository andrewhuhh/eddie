'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Heart, Users, MessageCircle, Calendar } from 'lucide-react'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-sage-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-sage-50/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-coral-400 to-coral-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-serif text-neutral-800 mb-2">i miss my friends</h1>
          <p className="text-neutral-600">Nurture meaningful relationships with the people you care about</p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center">
            <Users className="w-6 h-6 text-coral-500 mx-auto mb-2" />
            <p className="text-sm text-neutral-700">Relationship Map</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center">
            <MessageCircle className="w-6 h-6 text-coral-500 mx-auto mb-2" />
            <p className="text-sm text-neutral-700">Interaction Timeline</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center">
            <Calendar className="w-6 h-6 text-coral-500 mx-auto mb-2" />
            <p className="text-sm text-neutral-700">Smart Reminders</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center">
            <Heart className="w-6 h-6 text-coral-500 mx-auto mb-2" />
            <p className="text-sm text-neutral-700">Personal Journal</p>
          </div>
        </div>

        {/* Auth Component */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#f87171', // coral-400
                    brandAccent: '#ef4444', // coral-500
                    brandButtonText: 'white',
                    defaultButtonBackground: '#f3f4f6',
                    defaultButtonBackgroundHover: '#e5e7eb',
                    inputBackground: 'white',
                    inputBorder: '#e5e7eb',
                    inputBorderHover: '#d1d5db',
                    inputBorderFocus: '#f87171',
                  },
                  space: {
                    buttonPadding: '12px 16px',
                    inputPadding: '12px 16px',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '12px',
                    buttonBorderRadius: '12px',
                    inputBorderRadius: '12px',
                  },
                },
              },
              className: {
                container: 'space-y-4',
                button: 'transition-all duration-200 font-medium',
                input: 'transition-all duration-200',
              },
            }}
            providers={['google']}
            redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/` : undefined}
            onlyThirdPartyProviders
            showLinks={false}
          />
          
          <div className="mt-6 text-center">
            <p className="text-xs text-neutral-500">
              By signing in, you agree to keep your relationships private and secure
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-neutral-500">
            Your personal data stays private and secure
          </p>
        </div>
      </div>
    </div>
  )
} 