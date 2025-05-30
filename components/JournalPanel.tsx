'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PlusCircle, Edit3, Heart, MessageSquare, Calendar, Plus, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import CreateEntryForm from '@/components/CreateEntryForm'

interface JournalEntry {
  id: string
  date: Date
  person: string
  mood: 'great' | 'good' | 'neutral' | 'difficult'
  topic: string
  reflection: string
  gratitude?: string
  nextAction?: string
}

export default function JournalPanel() {
  const [isCreating, setIsCreating] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Fetch journal entries with person details
        const { data: entriesData, error } = await supabase
          .from('journal_entries')
          .select(`
            id,
            title,
            content,
            mood,
            created_at,
            people (
              name
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error

        // Transform data to match our interface
        const transformedEntries: JournalEntry[] = (entriesData || []).map(entry => ({
          id: entry.id,
          date: new Date(entry.created_at || new Date()),
          person: entry.people?.name || 'General',
          mood: (entry.mood as any) || 'neutral',
          topic: entry.title || 'Reflection',
          reflection: entry.content,
          gratitude: undefined, // We don't have separate gratitude field in current schema
          nextAction: undefined // We don't have separate next action field in current schema
        }))

        setEntries(transformedEntries)
      } catch (error) {
        console.error('Error fetching journal entries:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [user])

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'great': return 'text-green-600 bg-green-50 border-green-200'
      case 'good': return 'text-sage-600 bg-sage-50 border-sage-200'
      case 'neutral': return 'text-neutral-600 bg-neutral-50 border-neutral-200'
      case 'difficult': return 'text-coral-600 bg-coral-50 border-coral-200'
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200'
    }
  }

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'great': return '😊'
      case 'good': return '🙂'
      case 'neutral': return '😐'
      case 'difficult': return '😔'
      default: return '😐'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-100 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">Reflection Journal</h2>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 sm:h-32 bg-neutral-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-100 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">Reflection Journal</h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            Meaningful moments and insights • {entries.length} entries
          </p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          data-testid="new-journal-entry"
          className="btn-primary flex items-center space-x-2 text-sm sm:text-base px-3 sm:px-4 py-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-coral-600" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-neutral-800 mb-2">Start your reflection journey</h3>
          <p className="text-sm sm:text-base text-neutral-600 mb-4 px-4">Record meaningful moments and insights from your relationships.</p>
          <button 
            onClick={() => setIsCreating(true)}
            className="btn-primary flex items-center space-x-2 mx-auto text-sm sm:text-base px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            <span>Write Your First Entry</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedEntry(entry)}
              className="p-3 sm:p-4 rounded-xl border border-neutral-100 hover:border-neutral-200 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <span className="text-xl sm:text-2xl flex-shrink-0">{getMoodEmoji(entry.mood)}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-neutral-800 text-sm sm:text-base truncate">{entry.topic}</h3>
                    <p className="text-xs sm:text-sm text-neutral-600 truncate">{entry.person}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="text-xs text-neutral-500 block">
                    {entry.date.toLocaleDateString()}
                  </span>
                  <div className={`text-xs px-2 py-1 rounded-full border mt-1 ${getMoodColor(entry.mood)}`}>
                    {entry.mood}
                  </div>
                </div>
              </div>
              
              <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 sm:line-clamp-3">
                {entry.reflection}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <span className="text-2xl sm:text-3xl flex-shrink-0">{getMoodEmoji(selectedEntry.mood)}</span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-neutral-800 truncate">{selectedEntry.topic}</h2>
                    <p className="text-sm sm:text-base text-neutral-600 truncate">{selectedEntry.person} • {selectedEntry.date.toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="font-medium text-neutral-800 mb-2 text-sm sm:text-base">Reflection</h3>
                  <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">{selectedEntry.reflection}</p>
                </div>

                {selectedEntry.gratitude && (
                  <div>
                    <h3 className="font-medium text-neutral-800 mb-2 text-sm sm:text-base">Gratitude</h3>
                    <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">{selectedEntry.gratitude}</p>
                  </div>
                )}

                {selectedEntry.nextAction && (
                  <div>
                    <h3 className="font-medium text-neutral-800 mb-2 text-sm sm:text-base">Next Action</h3>
                    <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">{selectedEntry.nextAction}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Entry Modal - Placeholder */}
      {isCreating && (
        <CreateEntryForm 
          onClose={() => setIsCreating(false)}
          onSuccess={() => {
            setIsCreating(false)
            // Refresh entries
            const fetchEntries = async () => {
              if (!user) return
              try {
                const { data: entriesData, error } = await supabase
                  .from('journal_entries')
                  .select(`
                    id,
                    title,
                    content,
                    mood,
                    created_at,
                    people (
                      name
                    )
                  `)
                  .eq('user_id', user.id)
                  .order('created_at', { ascending: false })
                  .limit(20)

                if (error) throw error

                const transformedEntries: JournalEntry[] = (entriesData || []).map(entry => ({
                  id: entry.id,
                  date: new Date(entry.created_at || new Date()),
                  person: entry.people?.name || 'General',
                  mood: (entry.mood as any) || 'neutral',
                  topic: entry.title || 'Reflection',
                  reflection: entry.content,
                  gratitude: undefined,
                  nextAction: undefined
                }))

                setEntries(transformedEntries)
              } catch (error) {
                console.error('Error fetching journal entries:', error)
              }
            }
            fetchEntries()
          }}
        />
      )}
    </div>
  )
} 