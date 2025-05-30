'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Phone, Video, Mail, User, Instagram, Facebook, Plus } from 'lucide-react'
import { format, isToday, isYesterday, isSameWeek } from 'date-fns'
import { useRelationshipData } from '@/contexts/RelationshipDataContext'

interface Interaction {
  id: string
  person: string
  type: 'call' | 'text' | 'email' | 'in_person' | 'social_media' | 'video_call'
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'phone' | 'email' | 'twitter' | 'linkedin' | 'in_person'
  timestamp: Date
  preview: string
  duration?: number // for calls/videos in minutes
  isOutgoing: boolean
}

interface InteractionTimelineProps {
  onAddConnection?: () => void
  onLogInteraction?: () => void
}

export default function InteractionTimeline({ onAddConnection, onLogInteraction }: InteractionTimelineProps) {
  const [filter, setFilter] = useState<'all' | 'calls' | 'messages'>('all')
  const { interactions: contextInteractions, people, loading } = useRelationshipData()

  // Transform context interactions to match our interface
  const interactions: Interaction[] = useMemo(() => {
    return contextInteractions.map(interaction => ({
      id: interaction.id,
      person: interaction.person_name,
      type: interaction.type as any,
      platform: interaction.platform as any,
      timestamp: interaction.occurred_at,
      preview: interaction.description || getDefaultPreview(interaction.type, interaction.platform),
      duration: interaction.duration_minutes || undefined,
      isOutgoing: true // We don't track this in the current schema, defaulting to true
    }))
  }, [contextInteractions])

  function getDefaultPreview(type: string, platform: string) {
    if (type === 'call') return 'Voice call'
    if (type === 'video_call') return 'Video call'
    if (type === 'email') return 'Email exchange'
    if (type === 'in_person') return 'In-person meeting'
    if (type === 'social_media') return `${platform} interaction`
    if (type === 'text') return `${platform} message`
    return `${platform} interaction`
  }

  const getIcon = (type: string, platform: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />
      case 'video_call': return <Video className="w-4 h-4" />
      case 'email': return <Mail className="w-4 h-4" />
      case 'in_person': return <User className="w-4 h-4" />
      case 'text':
      case 'social_media':
      default:
        switch (platform) {
          case 'instagram': return <Instagram className="w-4 h-4" />
          case 'facebook': return <Facebook className="w-4 h-4" />
          default: return <MessageCircle className="w-4 h-4" />
        }
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'whatsapp': return 'text-green-600 bg-green-50'
      case 'instagram': return 'text-pink-600 bg-pink-50'
      case 'facebook': return 'text-blue-600 bg-blue-50'
      case 'phone': return 'text-purple-600 bg-purple-50'
      case 'email': return 'text-gray-600 bg-gray-50'
      default: return 'text-neutral-600 bg-neutral-50'
    }
  }

  const formatTimestamp = (date: Date) => {
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`
    } else if (isSameWeek(date, new Date(), { weekStartsOn: 1 })) {
      return format(date, 'EEEE \'at\' h:mm a')
    } else {
      return format(date, 'MMM d \'at\' h:mm a')
    }
  }

  const filteredInteractions = interactions.filter(interaction => {
    if (filter === 'all') return true
    if (filter === 'calls') {
      return interaction.type === 'call' || interaction.type === 'video_call'
    }
    if (filter === 'messages') {
      return interaction.type === 'text' || 
             interaction.type === 'social_media' || 
             interaction.type === 'email' || 
             interaction.type === 'in_person'
    }
    return true
  })

  // Check if user has any connections
  const hasConnections = people.length > 0

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-800">Interaction Timeline</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-neutral-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-100 p-4 sm:p-6">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-800">Interaction Timeline</h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            Recent conversations and calls • {interactions.length} interactions
          </p>
        </div>
        
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-3 gap-2">
          {hasConnections && (
            <button 
              onClick={() => {
                onLogInteraction?.()
              }}
              className="px-3 sm:px-4 py-2 text-coral-600 border border-coral-200 rounded-xl hover:bg-coral-50 transition-colors text-sm font-medium order-2 sm:order-1"
            >
              Log Interaction
            </button>
          )}
          
          {/* Filter buttons */}
          <div className="flex space-x-1 bg-neutral-100 rounded-lg p-1 order-1 sm:order-2 overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'messages', label: 'Messages' },
              { id: 'calls', label: 'Calls & Video' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-white text-neutral-800 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredInteractions.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-coral-600" />
          </div>
          
          {/* Show different messages based on context */}
          {interactions.length > 0 ? (
            // User has interactions but current filter shows none
            <>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-800 mb-2">
                No {filter === 'calls' ? 'calls or video calls' : filter === 'messages' ? 'messages' : 'interactions'} yet
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 mb-4 px-4">
                {filter === 'calls' 
                  ? 'You haven\'t logged any phone or video calls yet.' 
                  : filter === 'messages' 
                  ? 'You haven\'t logged any messages, emails, or in-person meetings yet.'
                  : 'No interactions match the current filter.'
                }
              </p>
              <button 
                onClick={onLogInteraction}
                className="btn-primary flex items-center space-x-2 mx-auto text-sm sm:text-base px-4 py-2"
              >
                <Plus className="w-4 h-4" />
                <span>Log an Interaction</span>
              </button>
            </>
          ) : (
            // User has no interactions at all
            <>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-800 mb-2">
                {hasConnections ? 'No interactions yet' : 'No connections yet'}
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 mb-4 px-4">
                {hasConnections 
                  ? 'Start tracking your conversations and calls with your connections.' 
                  : 'Add your first connection to start tracking interactions with friends and family.'
                }
              </p>
              <button 
                onClick={hasConnections ? onLogInteraction : onAddConnection}
                className="btn-primary flex items-center space-x-2 mx-auto text-sm sm:text-base px-4 py-2"
              >
                <Plus className="w-4 h-4" />
                <span>{hasConnections ? 'Log Your First Interaction' : 'Add Your First Connection'}</span>
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredInteractions.map((interaction, index) => (
            <motion.div
              key={interaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              {/* Avatar */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-neutral-800 text-sm sm:text-base truncate">{interaction.person}</h3>
                  <div className={`p-1 rounded-lg flex-shrink-0 ${getPlatformColor(interaction.platform)}`}>
                    {getIcon(interaction.type, interaction.platform)}
                  </div>
                  {interaction.duration && (
                    <span className="text-xs text-neutral-500 flex-shrink-0">
                      {interaction.duration}m
                    </span>
                  )}
                </div>
                
                <p className="text-xs sm:text-sm text-neutral-600 mb-2 line-clamp-2">
                  {interaction.preview}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">
                    {formatTimestamp(interaction.timestamp)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full capitalize flex-shrink-0 ${
                    interaction.isOutgoing ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {interaction.isOutgoing ? 'Outgoing' : 'Incoming'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
} 