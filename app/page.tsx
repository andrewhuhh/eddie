'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Calendar, Users, Plus, Bell } from 'lucide-react'
import RelationshipMap from './components/RelationshipMap'
import RemindersPanel from './components/RemindersPanel'
import JournalPanel from './components/JournalPanel'
import InteractionTimeline from './components/InteractionTimeline'

export default function HomePage() {
  const [activeView, setActiveView] = useState<'map' | 'timeline' | 'journal'>('map')

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-sage-50/30">
      {/* Header */}
      <header className="border-b border-neutral-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-coral-400 to-coral-600 rounded-2xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-neutral-800 brand-title">i miss my friends</h1>
                <p className="text-sm text-neutral-500">Nurturing meaningful relationships</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-coral-500 rounded-full"></span>
              </button>
              <button className="btn-primary flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Connection</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-2xl p-1 mb-8 shadow-sm">
          {[
            { id: 'map', label: 'Relationship Map', icon: Users },
            { id: 'timeline', label: 'Timeline', icon: MessageCircle },
            { id: 'journal', label: 'Journal', icon: Calendar },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeView === id
                  ? 'bg-coral-500 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {activeView === 'map' && <RelationshipMap />}
              {activeView === 'timeline' && <InteractionTimeline />}
              {activeView === 'journal' && <JournalPanel />}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <RemindersPanel />
            
            {/* Quick Stats */}
            <div className="card">
              <h3 className="font-semibold text-neutral-800 mb-4">This Week</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Conversations</span>
                  <span className="font-semibold text-sage-600">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">New Connections</span>
                  <span className="font-semibold text-coral-600">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Journal Entries</span>
                  <span className="font-semibold text-neutral-600">5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 