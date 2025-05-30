'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PlusCircle, Edit3, Heart, MessageSquare, Calendar } from 'lucide-react'

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

const mockEntries: JournalEntry[] = [
  {
    id: '1',
    date: new Date('2024-01-15'),
    person: 'Sarah',
    mood: 'great',
    topic: 'Career plans and weekend trip',
    reflection: 'Had a wonderful catch-up call. Sarah is so excited about her new role and we planned a weekend getaway.',
    gratitude: 'Grateful for having such a supportive friend who always makes time for our conversations.',
    nextAction: 'Book the Airbnb for our weekend trip'
  },
  {
    id: '2',
    date: new Date('2024-01-14'),
    person: 'Mom',
    mood: 'good',
    topic: 'Family updates and health check-in',
    reflection: 'Mom sounded well and happy. She shared stories about her new hobby of painting.',
    gratitude: 'Thankful for mom\'s positive energy and her new creative outlet.',
    nextAction: 'Send her art supplies for her birthday next month'
  }
]

export default function JournalPanel() {
  const [isCreating, setIsCreating] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'great': return 'text-green-600 bg-green-50 border-green-200'
      case 'good': return 'text-sage-600 bg-sage-50 border-sage-200'
      case 'neutral': return 'text-neutral-600 bg-neutral-50 border-neutral-200'
      case 'difficult': return 'text-coral-600 bg-coral-50 border-coral-200'
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200'
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (isCreating) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-800">New Journal Entry</h2>
          <button 
            onClick={() => setIsCreating(false)}
            className="text-neutral-500 hover:text-neutral-700 text-sm"
          >
            Cancel
          </button>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Who did you connect with?
            </label>
            <input 
              type="text" 
              className="input" 
              placeholder="Enter person's name..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              How was the interaction?
            </label>
            <div className="flex space-x-2">
              {['great', 'good', 'neutral', 'difficult'].map((mood) => (
                <button
                  key={mood}
                  type="button"
                  className={`px-4 py-2 rounded-xl text-sm border transition-colors capitalize ${getMoodColor(mood)}`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              What did you talk about?
            </label>
            <input 
              type="text" 
              className="input" 
              placeholder="Main topics of conversation..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Reflection
            </label>
            <textarea 
              className="input min-h-[100px] resize-none" 
              placeholder="How did the conversation make you feel? What did you learn?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Gratitude (Optional)
            </label>
            <textarea 
              className="input min-h-[80px] resize-none" 
              placeholder="What are you grateful for about this person or conversation?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Next Action (Optional)
            </label>
            <input 
              type="text" 
              className="input" 
              placeholder="Any follow-up actions or reminders..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" className="btn-primary flex-1">
              Save Entry
            </button>
            <button 
              type="button" 
              onClick={() => setIsCreating(false)}
              className="btn-ghost"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  if (selectedEntry) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setSelectedEntry(null)}
              className="text-neutral-500 hover:text-neutral-700 text-sm"
            >
              ← Back
            </button>
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">{selectedEntry.person}</h2>
              <p className="text-sm text-neutral-500">{formatDate(selectedEntry.date)}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs border ${getMoodColor(selectedEntry.mood)}`}>
            {selectedEntry.mood}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-neutral-800 mb-2">Topic</h3>
            <p className="text-neutral-700">{selectedEntry.topic}</p>
          </div>

          <div>
            <h3 className="font-medium text-neutral-800 mb-2">Reflection</h3>
            <p className="text-neutral-700 leading-relaxed">{selectedEntry.reflection}</p>
          </div>

          {selectedEntry.gratitude && (
            <div>
              <h3 className="font-medium text-neutral-800 mb-2 flex items-center space-x-2">
                <Heart className="w-4 h-4 text-coral-500" />
                <span>Gratitude</span>
              </h3>
              <p className="text-neutral-700 leading-relaxed">{selectedEntry.gratitude}</p>
            </div>
          )}

          {selectedEntry.nextAction && (
            <div>
              <h3 className="font-medium text-neutral-800 mb-2">Next Action</h3>
              <p className="text-neutral-700">{selectedEntry.nextAction}</p>
            </div>
          )}

          <div className="pt-4">
            <button className="btn-ghost flex items-center space-x-2">
              <Edit3 className="w-4 h-4" />
              <span>Edit Entry</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-neutral-800 font-serif">Reflection Journal</h2>
          <p className="text-sm text-neutral-500">Document meaningful conversations</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>

      <div className="space-y-4">
        {mockEntries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-50 rounded-2xl p-4 hover:bg-neutral-100 transition-colors cursor-pointer"
            onClick={() => setSelectedEntry(entry)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-coral-400 to-coral-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                  {entry.person.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800">{entry.person}</h3>
                  <p className="text-sm text-neutral-500">{formatDate(entry.date)}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-lg text-xs border ${getMoodColor(entry.mood)}`}>
                {entry.mood}
              </div>
            </div>
            
            <p className="text-sm text-neutral-600 mb-2">{entry.topic}</p>
            <p className="text-sm text-neutral-500 line-clamp-2">{entry.reflection}</p>
          </motion.div>
        ))}
      </div>

      {mockEntries.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="font-medium text-neutral-600 mb-2">No entries yet</h3>
          <p className="text-sm text-neutral-500 mb-4">Start documenting your meaningful conversations</p>
          <button 
            onClick={() => setIsCreating(true)}
            className="btn-primary"
          >
            Create your first entry
          </button>
        </div>
      )}
    </div>
  )
} 