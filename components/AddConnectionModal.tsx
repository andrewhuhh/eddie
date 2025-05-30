import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Heart, Phone, Mail, MessageCircle, Twitter, Linkedin, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
// PlatformType will not be directly used for formData state anymore, but keep for platforms array for now.
import { PlatformType } from '@/types/database'

interface AddConnectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const relationshipTypes = [
  'Family',
  'Best Friend',
  'Friend',
  'Colleague',
  'Acquaintance',
  'Romantic Partner',
  'Mentor',
  'Other'
]

const platforms = [
  { id: 'whatsapp' as PlatformType, label: 'WhatsApp', icon: MessageCircle },
  { id: 'instagram' as PlatformType, label: 'Instagram', icon: MessageCircle },
  { id: 'facebook' as PlatformType, label: 'Facebook', icon: MessageCircle },
  { id: 'twitter' as PlatformType, label: 'Twitter', icon: Twitter },
  { id: 'linkedin' as PlatformType, label: 'LinkedIn', icon: Linkedin },
  { id: 'phone' as PlatformType, label: 'Phone', icon: Phone },
  { id: 'email' as PlatformType, label: 'Email', icon: Mail },
  { id: 'in_person' as PlatformType, label: 'In Person', icon: Users },
  { id: 'other_platform_sentinel', label: 'Other', icon: Users }, // Using Users icon as a generic one
]

export default function AddConnectionModal({ isOpen, onClose, onSuccess }: AddConnectionModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [customRelationship, setCustomRelationship] = useState('')
  const [customPreferredPlatform, setCustomPreferredPlatform] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    email: '',
    phone: '',
    notes: '',
    preferred_platform: 'whatsapp', // Now a string, not PlatformType
    closeness: 3,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.name.trim()) return
    if (formData.relationship === 'Other' && !customRelationship.trim()) {
      // Optionally, you can show an error message to the user here
      // For now, just prevent submission
      return
    }
    if (formData.preferred_platform === 'other_platform_sentinel' && !customPreferredPlatform.trim()) {
      // Optionally, show error for custom platform
      return
    }

    setLoading(true)
    try {
      const relationshipValue = formData.relationship === 'Other' && customRelationship.trim()
        ? customRelationship.trim()
        : formData.relationship || null;

      const preferredPlatformValue = formData.preferred_platform === 'other_platform_sentinel' && customPreferredPlatform.trim()
        ? customPreferredPlatform.trim()
        : formData.preferred_platform;

      const { error } = await supabase
        .from('people')
        .insert({
          user_id: user.id,
          name: formData.name.trim(),
          relationship: relationshipValue,
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          notes: formData.notes.trim() || null,
          preferred_platform: preferredPlatformValue,
          closeness: formData.closeness,
        })

      if (error) throw error

      // Reset form
      setFormData({
        name: '',
        relationship: '',
        email: '',
        phone: '',
        notes: '',
        preferred_platform: 'whatsapp', // Reset to string
        closeness: 3,
      })
      setCustomRelationship('') // Reset custom relationship
      setCustomPreferredPlatform('') // Reset custom platform

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error adding connection:', error)
      alert('Failed to add connection. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getClosenessLabel = (value: number) => {
    const labels = ['Distant', 'Acquaintance', 'Friend', 'Close Friend', 'Very Close']
    return labels[value - 1] || 'Friend'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Add New Connection</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter their name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Select
                value={formData.relationship}
                onValueChange={(value) => setFormData({ ...formData, relationship: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship type" />
                </SelectTrigger>
                <SelectContent>
                  {relationshipTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.relationship === 'Other' && (
              <div className="space-y-2">
                <Label htmlFor="customRelationship">Custom Relationship *</Label>
                <Input
                  id="customRelationship"
                  type="text"
                  value={customRelationship}
                  onChange={(e) => setCustomRelationship(e.target.value)}
                  placeholder="Specify relationship type"
                  required={formData.relationship === 'Other'}
                />
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="their.email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Preferred Platform</Label>
              <Select
                value={formData.preferred_platform}
                onValueChange={(value: string) => setFormData({ ...formData, preferred_platform: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred platform"/>
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      <div className="flex items-center space-x-2">
                        <platform.icon className="w-4 h-4" />
                        <span>{platform.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.preferred_platform === 'other_platform_sentinel' && (
              <div className="space-y-2">
                <Label htmlFor="customPreferredPlatform">Custom Preferred Platform *</Label>
                <Input
                  id="customPreferredPlatform"
                  type="text"
                  value={customPreferredPlatform}
                  onChange={(e) => setCustomPreferredPlatform(e.target.value)}
                  placeholder="Specify preferred platform"
                  required={formData.preferred_platform === 'other_platform_sentinel'}
                />
              </div>
            )}
          </div>

          {/* Closeness */}
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Closeness Level: {getClosenessLabel(formData.closeness)}</Label>
              <div className="px-3">
                <Slider
                  value={[formData.closeness]}
                  onValueChange={(value) => setFormData({ ...formData, closeness: value[0] })}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Distant</span>
                  <span>Very Close</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this person..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !formData.name.trim() ||
                (formData.relationship === 'Other' && !customRelationship.trim()) ||
                (formData.preferred_platform === 'other_platform_sentinel' && !customPreferredPlatform.trim())
              }
              className="flex-1"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Add Connection
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 