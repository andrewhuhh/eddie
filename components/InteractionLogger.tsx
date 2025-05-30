'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, MessageCircle, Phone, Video, Mail, User, Calendar, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useRelationshipData } from '@/contexts/RelationshipDataContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomSelect } from '@/components/ui/custom-select'
import { PlatformType } from '@/types/database'

interface InteractionLoggerProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const interactionTypes = [
  { value: 'text', label: 'Text/Message', icon: MessageCircle },
  { value: 'call', label: 'Phone Call', icon: Phone },
  { value: 'video_call', label: 'Video Call', icon: Video },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'in_person', label: 'In Person', icon: User },
  { value: 'social_media', label: 'Social Media', icon: MessageCircle },
]

const platformOptions = [
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'instagram', label: 'Instagram', icon: MessageCircle },
  { value: 'facebook', label: 'Facebook', icon: MessageCircle },
  { value: 'twitter', label: 'Twitter', icon: MessageCircle },
  { value: 'linkedin', label: 'LinkedIn', icon: MessageCircle },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'in_person', label: 'In Person', icon: User },
]

export default function InteractionLogger({ isOpen, onClose, onSuccess }: InteractionLoggerProps) {
  const [formData, setFormData] = useState({
    person_id: '',
    type: 'text',
    platform: 'whatsapp',
    description: '',
    occurred_at: new Date().toISOString().slice(0, 16), // Format for datetime-local input
    duration_minutes: '' as string,
  })
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { people, addInteraction } = useRelationshipData()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.person_id || !formData.type) return

    setLoading(true)
    try {
      // Determine if we're using a custom platform
      const isCustomPlatform = !platformOptions.some(p => p.value === formData.platform)
      
      const interactionData = {
        person_id: formData.person_id,
        type: formData.type,
        platform: isCustomPlatform ? 'custom' as PlatformType : formData.platform as PlatformType,
        custom_platform: isCustomPlatform ? formData.platform : null,
        description: formData.description.trim() || undefined,
        occurred_at: formData.occurred_at,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined,
      }

      await addInteraction(interactionData)
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error logging interaction:', error)
      alert('Failed to log interaction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedType = interactionTypes.find(t => t.value === formData.type)
  const showDuration = formData.type === 'call' || formData.type === 'video_call'

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-lg sm:text-xl font-serif">Log Interaction</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Person Selection */}
            <div className="space-y-2">
              <Label htmlFor="person">Who did you interact with?</Label>
              <Select
                value={formData.person_id}
                onValueChange={(value) => setFormData({ ...formData, person_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact" />
                </SelectTrigger>
                <SelectContent>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Interaction Type */}
            <div className="space-y-3">
              <Label>Type of interaction</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {interactionTypes.map((type) => (
                  <Button
                    key={type.value}
                    type="button"
                    variant={formData.type === type.value ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className="h-auto p-3 sm:p-4 flex flex-col items-center space-y-1 sm:space-y-2 text-xs sm:text-sm"
                  >
                    <type.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-center">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Platform */}
            <CustomSelect
              label="Platform"
              value={formData.platform}
              onValueChange={(value) => setFormData({ ...formData, platform: value })}
              options={platformOptions}
              placeholder="Select platform"
              customPlaceholder="Enter custom platform"
              allowCustom={true}
            />

            {/* Date and Time */}
            <div className="space-y-2">
              <Label htmlFor="occurred_at">When did this happen?</Label>
              <div className="relative">
                <Input
                  id="occurred_at"
                  type="datetime-local"
                  value={formData.occurred_at}
                  onChange={(e) => setFormData({ ...formData, occurred_at: e.target.value })}
                  required
                  className="text-base"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            {/* Duration (for calls) */}
            {showDuration && (
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <div className="relative">
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    placeholder="e.g., 15"
                    min="1"
                    className="text-base"
                  />
                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What did you talk about? Any highlights or notes..."
                rows={3}
                className="text-base resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2 sm:pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.person_id || !formData.type}
                className="flex-1 order-1 sm:order-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {selectedType && <selectedType.icon className="w-4 h-4 mr-2" />}
                    Log Interaction
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
} 