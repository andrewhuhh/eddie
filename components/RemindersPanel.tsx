'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, User, MessageCircle, Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Reminder {
  id: string
  name: string
  relationship: string
  daysSinceContact: number
  priority: 'high' | 'medium' | 'low'
  suggestion: string
}

export default function RemindersPanel() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchReminders = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Fetch people with their latest interactions
        const { data: people, error } = await supabase
          .from('people')
          .select(`
            id,
            name,
            relationship,
            interactions (
              occurred_at,
              created_at
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Calculate reminders based on last contact
        const calculatedReminders: Reminder[] = (people || [])
          .map(person => {
            const latestInteraction = person.interactions?.[0]
            const lastContactDate = latestInteraction?.occurred_at || latestInteraction?.created_at
            const lastContact = lastContactDate ? new Date(lastContactDate) : null
            
            let daysSinceContact = 0
            if (lastContact) {
              daysSinceContact = Math.floor((Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
            } else {
              daysSinceContact = 999 // No contact yet
            }

            // Only include people who need attention (7+ days or no contact)
            if (daysSinceContact < 7) return null

            // Determine priority based on relationship and days
            let priority: 'high' | 'medium' | 'low' = 'low'
            const relationship = person.relationship?.toLowerCase() || ''
            
            if (relationship.includes('family') || relationship.includes('parent') || relationship.includes('sibling')) {
              priority = daysSinceContact > 14 ? 'high' : 'medium'
            } else if (relationship.includes('best friend') || relationship.includes('partner')) {
              priority = daysSinceContact > 10 ? 'high' : 'medium'
            } else {
              priority = daysSinceContact > 21 ? 'medium' : 'low'
            }

            // Generate suggestion based on relationship
            const suggestions = {
              family: ['Call to check in', 'Send a photo update', 'Plan a visit'],
              friend: ['Send a message', 'Share something funny', 'Plan to meet up'],
              colleague: ['Check in about work', 'Send a professional update', 'Schedule a coffee'],
              default: ['Send a message', 'Give them a call', 'Share an update']
            }

            let suggestionList = suggestions.default
            if (relationship.includes('family')) suggestionList = suggestions.family
            else if (relationship.includes('friend')) suggestionList = suggestions.friend
            else if (relationship.includes('colleague')) suggestionList = suggestions.colleague

            const suggestion = suggestionList[Math.floor(Math.random() * suggestionList.length)]

            return {
              id: person.id,
              name: person.name,
              relationship: person.relationship || 'Friend',
              daysSinceContact,
              priority,
              suggestion
            }
          })
          .filter(Boolean) as Reminder[]

        // Sort by priority and days since contact
        calculatedReminders.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority]
          }
          return b.daysSinceContact - a.daysSinceContact
        })

        setReminders(calculatedReminders.slice(0, 5)) // Show top 5 reminders
      } catch (error) {
        console.error('Error fetching reminders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReminders()
  }, [user])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-coral-600 bg-coral-50 border-coral-200'
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'low': return 'text-sage-600 bg-sage-50 border-sage-200'
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200'
    }
  }

  const formatDaysSince = (days: number) => {
    if (days === 999) return 'No contact yet'
    if (days === 1) return '1 day ago'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.ceil(days / 7)} weeks ago`
    return `${Math.ceil(days / 30)} months ago`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-100 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-800 mb-3 sm:mb-4">Reminders</h2>
        <div className="space-y-2 sm:space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 sm:h-16 bg-neutral-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-100 p-4 sm:p-6">
      <div className="flex items-center space-x-2 mb-4 sm:mb-6">
        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-coral-500" />
        <h2 className="text-base sm:text-lg font-semibold text-neutral-800">Reminders</h2>
      </div>

      {reminders.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-sage-600" />
          </div>
          <p className="text-neutral-600 text-xs sm:text-sm">You're all caught up!</p>
          <p className="text-neutral-500 text-xs mt-1">No pending reminders</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {reminders.map((reminder, index) => (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${getPriorityColor(reminder.priority)}`}
            >
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-xs sm:text-sm truncate">{reminder.name}</h3>
                    <span className="text-xs opacity-75 capitalize flex-shrink-0 ml-2">{reminder.priority}</span>
                  </div>
                  <p className="text-xs opacity-75 mb-1 sm:mb-2 truncate">{reminder.relationship}</p>
                  <p className="text-xs font-medium mb-1 sm:mb-2">{formatDaysSince(reminder.daysSinceContact)}</p>
                  <p className="text-xs opacity-90 line-clamp-2">{reminder.suggestion}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
} 