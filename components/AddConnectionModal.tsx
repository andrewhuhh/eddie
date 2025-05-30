import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Heart, Phone, Mail, MessageCircle, Twitter, Linkedin, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import { CustomSelect } from '@/components/ui/custom-select'
import { PlatformType } from '@/types/database'

interface AddConnectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const relationshipOptions = [
  { value: 'Family', label: 'Family' },
  { value: 'Best Friend', label: 'Best Friend' },
  { value: 'Friend', label: 'Friend' },
  { value: 'Colleague', label: 'Colleague' },
  { value: 'Acquaintance', label: 'Acquaintance' },
  { value: 'Romantic Partner', label: 'Romantic Partner' },
  { value: 'Mentor', label: 'Mentor' },
  { value: 'Other', label: 'Other' }
]

const platformOptions = [
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'instagram', label: 'Instagram', icon: MessageCircle },
  { value: 'facebook', label: 'Facebook', icon: MessageCircle },
  { value: 'twitter', label: 'Twitter', icon: Twitter },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'in_person', label: 'In Person', icon: Users },
]

export default function AddConnectionModal({ isOpen, onClose, onSuccess }: AddConnectionModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    email: '',
    phone: '',
    notes: '',
    preferred_platform: 'whatsapp',
    closeness: 3,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.name.trim()) return

    setLoading(true)
    try {
      // Determine if we're using a custom platform
      const isCustomPlatform = !platformOptions.some(p => p.value === formData.preferred_platform)
      
      const insertData = {
        user_id: user.id,
        name: formData.name.trim(),
        relationship: formData.relationship || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        notes: formData.notes.trim() || null,
        preferred_platform: isCustomPlatform ? 'custom' as PlatformType : formData.preferred_platform as PlatformType,
        custom_platform: isCustomPlatform ? formData.preferred_platform : null,
        closeness: formData.closeness,
      }

      const { error } = await supabase
        .from('people')
        .insert(insertData)

      if (error) throw error

      // Reset form
      setFormData({
        name: '',
        relationship: '',
        email: '',
        phone: '',
        notes: '',
        preferred_platform: 'whatsapp',
        closeness: 3,
      })

      onSuccess()
      onClose()
      
      // Force page refresh to ensure all components show the new connection
      window.location.reload()
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

            <CustomSelect
              label="Relationship"
              value={formData.relationship}
              onValueChange={(value) => setFormData({ ...formData, relationship: value })}
              options={relationshipOptions}
              placeholder="Select relationship type"
              customPlaceholder="Enter custom relationship"
              allowCustom={true}
            />
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

            <CustomSelect
              label="Preferred Platform"
              value={formData.preferred_platform}
              onValueChange={(value) => setFormData({ ...formData, preferred_platform: value })}
              options={platformOptions}
              placeholder="Select platform"
              customPlaceholder="Enter custom platform"
              allowCustom={true}
            />
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
              disabled={loading || !formData.name.trim()}
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