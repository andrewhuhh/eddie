'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, User, MessageCircle, Heart } from 'lucide-react'

interface Reminder {
  id: string
  name: string
  relationship: string
  daysSinceContact: number
  priority: 'high' | 'medium' | 'low'
  suggestion: string
}

const mockReminders: Reminder[] = [
  {
    id: '1',
    name: 'Mom',
    relationship: 'Family',
    daysSinceContact: 7,
    priority: 'high',
    suggestion: 'Call to check how her garden is doing'
  },
  {
    id: '2',
    name: 'Jake',
    relationship: 'College Friend',
    daysSinceContact: 14,
    priority: 'medium',
    suggestion: 'Send a message about that job opportunity'
  },
  {
    id: '3',
    name: 'Anna',
    relationship: 'Colleague',
    daysSinceContact: 10,
    priority: 'low',
    suggestion: 'Check in about the project'
  }
]

export default function RemindersPanel() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-coral-600 bg-coral-50 border-coral-200'
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'low': return 'text-sage-600 bg-sage-50 border-sage-200'
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Heart className="w-4 h-4" />
      case 'medium': return <Clock className="w-4 h-4" />
      case 'low': return <User className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-neutral-800 font-serif">Today's Reminders</h3>
        <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
          {mockReminders.length} pending
        </span>
      </div>

      <div className="space-y-3">
        {mockReminders.map((reminder, index) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <div className="bg-neutral-50 rounded-2xl p-4 hover:bg-neutral-100 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded-lg border ${getPriorityColor(reminder.priority)}`}>
                    {getPriorityIcon(reminder.priority)}
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-800">{reminder.name}</h4>
                    <p className="text-xs text-neutral-500">{reminder.relationship}</p>
                  </div>
                </div>
                <span className="text-xs text-neutral-400">
                  {reminder.daysSinceContact}d ago
                </span>
              </div>
              
              <p className="text-sm text-neutral-600 mb-3">
                {reminder.suggestion}
              </p>
              
              <div className="flex space-x-2">
                <button className="flex items-center space-x-1 px-3 py-1 bg-coral-100 text-coral-700 rounded-lg text-xs hover:bg-coral-200 transition-colors">
                  <MessageCircle className="w-3 h-3" />
                  <span>Message</span>
                </button>
                <button className="px-3 py-1 bg-neutral-200 text-neutral-600 rounded-lg text-xs hover:bg-neutral-300 transition-colors">
                  Later
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-neutral-100">
        <button className="w-full text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
          View all reminders
        </button>
      </div>
    </div>
  )
} 