'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Phone, Video, Mail, User, Instagram, Facebook } from 'lucide-react'
import { format, isToday, isYesterday, startOfWeek, isSameWeek } from 'date-fns'

interface Interaction {
  id: string
  person: string
  type: 'message' | 'call' | 'video' | 'email'
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'phone'
  timestamp: Date
  preview: string
  duration?: number // for calls/videos in minutes
  isOutgoing: boolean
}

const mockInteractions: Interaction[] = [
  {
    id: '1',
    person: 'Sarah',
    type: 'message',
    platform: 'whatsapp',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    preview: 'Thanks for the recommendation! Just finished reading...',
    isOutgoing: false
  },
  {
    id: '2',
    person: 'Mike',
    type: 'call',
    platform: 'phone',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    preview: 'Voice call',
    duration: 15,
    isOutgoing: true
  },
  {
    id: '3',
    person: 'Emma',
    type: 'message',
    platform: 'instagram',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    preview: 'Love the photos from your trip!',
    isOutgoing: false
  },
  {
    id: '4',
    person: 'David',
    type: 'message',
    platform: 'whatsapp',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    preview: 'Hey! Want to grab coffee this weekend?',
    isOutgoing: true
  },
  {
    id: '5',
    person: 'Lisa',
    type: 'video',
    platform: 'phone',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    preview: 'Video call',
    duration: 45,
    isOutgoing: false
  },
  {
    id: '6',
    person: 'Alex',
    type: 'message',
    platform: 'facebook',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    preview: 'Saw your post about the new job - congratulations!',
    isOutgoing: false
  }
]

export default function InteractionTimeline() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null)

  const getInteractionIcon = (type: string, platform: string) => {
    if (type === 'call') return <Phone className="w-4 h-4" />
    if (type === 'video') return <Video className="w-4 h-4" />
    if (type === 'email') return <Mail className="w-4 h-4" />
    
    // Platform-specific message icons
    if (platform === 'whatsapp') return <MessageCircle className="w-4 h-4" />
    if (platform === 'instagram') return <Instagram className="w-4 h-4" />
    if (platform === 'facebook') return <Facebook className="w-4 h-4" />
    
    return <MessageCircle className="w-4 h-4" />
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'whatsapp': return 'text-green-600 bg-green-50 border-green-200'
      case 'instagram': return 'text-pink-600 bg-pink-50 border-pink-200'
      case 'facebook': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'phone': return 'text-neutral-600 bg-neutral-50 border-neutral-200'
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200'
    }
  }

  const formatTimestamp = (date: Date) => {
    if (isToday(date)) {
      return `Today ${format(date, 'h:mm a')}`
    }
    if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`
    }
    if (isSameWeek(date, new Date())) {
      return format(date, 'EEEE h:mm a')
    }
    return format(date, 'MMM d, h:mm a')
  }

  const filteredInteractions = mockInteractions.filter(interaction => {
    if (selectedPlatform && interaction.platform !== selectedPlatform) return false
    if (selectedPerson && interaction.person !== selectedPerson) return false
    return true
  })

  const uniquePeople = Array.from(new Set(mockInteractions.map(i => i.person)))
  const platforms = Array.from(new Set(mockInteractions.map(i => i.platform)))

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-neutral-800 font-serif">Interaction Timeline</h2>
          <p className="text-sm text-neutral-500">Unified view across all platforms</p>
        </div>
        
        <div className="flex space-x-2">
          <select 
            value={selectedPerson || ''} 
            onChange={(e) => setSelectedPerson(e.target.value || null)}
            className="text-sm border border-neutral-200 rounded-lg px-3 py-1 bg-white"
          >
            <option value="">All people</option>
            {uniquePeople.map(person => (
              <option key={person} value={person}>{person}</option>
            ))}
          </select>
          
          <select 
            value={selectedPlatform || ''} 
            onChange={(e) => setSelectedPlatform(e.target.value || null)}
            className="text-sm border border-neutral-200 rounded-lg px-3 py-1 bg-white"
          >
            <option value="">All platforms</option>
            {platforms.map(platform => (
              <option key={platform} value={platform} className="capitalize">{platform}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredInteractions.map((interaction, index) => (
          <motion.div
            key={interaction.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start space-x-4 p-4 bg-neutral-50 rounded-2xl hover:bg-neutral-100 transition-colors"
          >
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              <div className={`p-2 rounded-xl border ${getPlatformColor(interaction.platform)}`}>
                {getInteractionIcon(interaction.type, interaction.platform)}
              </div>
              {index < filteredInteractions.length - 1 && (
                <div className="w-px h-8 bg-neutral-200 mt-2"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-neutral-800">{interaction.person}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${getPlatformColor(interaction.platform)}`}>
                    {interaction.platform}
                  </span>
                  {interaction.isOutgoing && (
                    <span className="text-xs text-neutral-500">→ Outgoing</span>
                  )}
                </div>
                <span className="text-xs text-neutral-500">
                  {formatTimestamp(interaction.timestamp)}
                </span>
              </div>
              
              <p className="text-sm text-neutral-600">
                {interaction.type === 'call' && interaction.duration && 
                  `${interaction.duration} minute call`
                }
                {interaction.type === 'video' && interaction.duration && 
                  `${interaction.duration} minute video call`
                }
                {interaction.type === 'message' && interaction.preview}
              </p>
            </div>

            {/* Person avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-coral-400 to-coral-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {interaction.person.charAt(0)}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredInteractions.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="font-medium text-neutral-600 mb-2">No interactions found</h3>
          <p className="text-sm text-neutral-500 mb-4">
            {selectedPlatform || selectedPerson 
              ? 'Try adjusting your filters to see more interactions'
              : 'Your interaction history will appear here'
            }
          </p>
          {(selectedPlatform || selectedPerson) && (
            <button 
              onClick={() => {
                setSelectedPlatform(null)
                setSelectedPerson(null)
              }}
              className="btn-ghost"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Quick stats */}
      <div className="mt-6 pt-6 border-t border-neutral-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-coral-600">
              {filteredInteractions.filter(i => isToday(i.timestamp)).length}
            </div>
            <div className="text-xs text-neutral-500">Today</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-sage-600">
              {filteredInteractions.filter(i => isSameWeek(i.timestamp, new Date())).length}
            </div>
            <div className="text-xs text-neutral-500">This Week</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-neutral-600">
              {uniquePeople.length}
            </div>
            <div className="text-xs text-neutral-500">People</div>
          </div>
        </div>
      </div>
    </div>
  )
} 