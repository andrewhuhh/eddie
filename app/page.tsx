'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Calendar, Users, Plus, Bell, LogOut, User, Menu, X } from 'lucide-react'
import RelationshipMap from '../components/RelationshipMap'
import RemindersPanel from '../components/RemindersPanel'
import JournalPanel from '../components/JournalPanel'
import InteractionTimeline from '../components/InteractionTimeline'
import ProtectedRoute from '@/components/ProtectedRoute'
import OnboardingModal from '@/components/OnboardingModal'
import AddConnectionModal from '@/components/AddConnectionModal'
import InteractionLogger from '@/components/InteractionLogger'
import NotificationsDropdown from '@/components/NotificationsDropdown'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { RelationshipDataProvider } from '@/contexts/RelationshipDataContext'
import NotificationManager from '@/components/NotificationManager'

export default function HomePage() {
  const [activeView, setActiveView] = useState<'map' | 'timeline' | 'journal'>('map')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAddConnection, setShowAddConnection] = useState(false)
  const [showInteractionLogger, setShowInteractionLogger] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showSidebar, setShowSidebar] = useState(false)
  const { user, signOut } = useAuth()

  // Check if user needs onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return

      try {
        // Check if user has completed onboarding
        const onboardingKey = `onboarding_completed_${user.id}`
        const hasCompletedOnboarding = localStorage.getItem(onboardingKey)

        // Also check if user has any connections
        const { data: people, error } = await supabase
          .from('people')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)

        if (error) {
          console.error('Error checking user connections:', error)
          return
        }

        // Show onboarding if user hasn't completed it and has no connections
        if (!hasCompletedOnboarding && (!people || people.length === 0)) {
          setShowOnboarding(true)
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
      }
    }

    checkOnboardingStatus()
  }, [user])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger shortcuts if no modal is open and not typing in an input
      if (showOnboarding || showAddConnection || showInteractionLogger) return
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return

      // Cmd/Ctrl + K for add connection
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setShowAddConnection(true)
      }

      // Cmd/Ctrl + L for log interaction
      if ((event.metaKey || event.ctrlKey) && event.key === 'l') {
        event.preventDefault()
        setShowInteractionLogger(true)
      }

      // Cmd/Ctrl + J for new journal entry
      if ((event.metaKey || event.ctrlKey) && event.key === 'j') {
        event.preventDefault()
        setActiveView('journal')
        // Trigger journal creation after a short delay to ensure view is switched
        setTimeout(() => {
          const newEntryButton = document.querySelector('[data-testid="new-journal-entry"]') as HTMLButtonElement
          if (newEntryButton) {
            newEntryButton.click()
          }
        }, 100)
      }

      // Number keys for view switching
      if (event.key === '1') {
        event.preventDefault()
        setActiveView('map')
      }
      if (event.key === '2') {
        event.preventDefault()
        setActiveView('timeline')
      }
      if (event.key === '3') {
        event.preventDefault()
        setActiveView('journal')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showOnboarding, showAddConnection, showInteractionLogger])

  const handleOnboardingComplete = () => {
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleConnectionAdded = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <ProtectedRoute>
      <RelationshipDataProvider>
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-sage-50/30">
          {/* Header */}
          <header className="border-b border-neutral-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-coral-400 to-coral-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl font-semibold text-neutral-800 brand-title truncate">i miss my friends</h1>
                    <p className="text-xs sm:text-sm text-neutral-500 hidden sm:block">Nurturing meaningful relationships</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                  {/* Keyboard shortcuts hint */}
                  <div className="hidden lg:flex items-center space-x-1 text-xs text-neutral-400 bg-neutral-50 px-2 py-1 rounded-lg">
                    <span>⌘K Add</span>
                    <span>•</span>
                    <span>⌘L Log</span>
                    <span>•</span>
                    <span>⌘J Journal</span>
                  </div>

                  <NotificationsDropdown />
                  
                  {/* Mobile menu button */}
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="lg:hidden p-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-colors"
                  >
                    <Menu className="w-5 h-5" />
                  </button>

                  {/* Desktop user menu */}
                  <div className="hidden lg:flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-800 truncate max-w-32">
                        {user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-neutral-500">Welcome back</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="p-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-colors"
                      title="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
            {/* Navigation Tabs */}
            <div className="flex space-x-1 bg-white rounded-xl sm:rounded-2xl p-1 mb-4 sm:mb-8 shadow-sm border border-neutral-100 overflow-x-auto">
              {[
                { id: 'map', label: 'Relationship Map', icon: Users, shortcut: '1' },
                { id: 'timeline', label: 'Timeline', icon: MessageCircle, shortcut: '2' },
                { id: 'journal', label: 'Journal', icon: Calendar, shortcut: '3' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`flex items-center space-x-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
                    activeView === tab.id
                      ? 'bg-coral-500 text-white shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  <span className="hidden lg:inline text-xs opacity-60">{tab.shortcut}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8 relative">
              {/* Main Content */}
              <div className="lg:col-span-3 min-w-0">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  {activeView === 'map' && <RelationshipMap key={refreshTrigger} onAddConnection={() => setShowAddConnection(true)} />}
                  {activeView === 'timeline' && <InteractionTimeline key={refreshTrigger} onAddConnection={() => setShowAddConnection(true)} onLogInteraction={() => setShowInteractionLogger(true)} />}
                  {activeView === 'journal' && <JournalPanel key={refreshTrigger} />}
                </motion.div>
              </div>

              {/* Sidebar - Desktop */}
              <div className="lg:col-span-1 hidden lg:block space-y-6">
                <RemindersPanel key={refreshTrigger} />
                <NotificationManager />
              </div>

              {/* Sidebar - Mobile Overlay */}
              {showSidebar && (
                <motion.div 
                  className="lg:hidden fixed inset-0 z-50 flex"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div 
                    className="fixed inset-0 bg-black/50" 
                    onClick={() => setShowSidebar(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                  />
                  <motion.div 
                    className="relative ml-auto w-80 max-w-full bg-white h-full overflow-y-auto"
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "tween", duration: 0.3 }}
                  >
                    <div className="p-4 border-b border-neutral-100">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-neutral-800">Menu</h2>
                        <button
                          onClick={() => setShowSidebar(false)}
                          className="p-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <RemindersPanel key={refreshTrigger} />
                      <div className="mt-6">
                        <NotificationManager />
                      </div>
                      <div className="mt-6 pt-6 border-t border-neutral-100">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-neutral-600" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-800">
                              {user?.email?.split('@')[0] || 'User'}
                            </p>
                            <p className="text-sm text-neutral-500">{user?.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-2 px-4 py-3 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </main>

          {/* Modals */}
          <OnboardingModal
            isOpen={showOnboarding}
            onClose={() => setShowOnboarding(false)}
            onComplete={handleOnboardingComplete}
          />

          <AddConnectionModal
            isOpen={showAddConnection}
            onClose={() => setShowAddConnection(false)}
            onSuccess={handleConnectionAdded}
          />

          <InteractionLogger
            isOpen={showInteractionLogger}
            onClose={() => setShowInteractionLogger(false)}
            onSuccess={() => {
              setShowInteractionLogger(false)
              setRefreshTrigger(prev => prev + 1)
            }}
          />
        </div>
      </RelationshipDataProvider>
    </ProtectedRoute>
  )
} 