'use client'

import React, { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { User, Upload, Trash2, Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { CustomSelect } from '@/components/ui/custom-select'
import { PlatformType } from '@/types/database'

interface EditConnectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  connection: {
    id: string
    name: string
    relationship: string
    email?: string
    phone?: string
    notes?: string
    preferred_platform: string
    closeness: number
    avatar_url?: string
  } | null
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
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'in_person', label: 'In Person' },
]

export default function EditConnectionModal({ isOpen, onClose, onSuccess, connection }: EditConnectionModalProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [formData, setFormData] = useState({
    name: connection?.name || '',
    relationship: connection?.relationship || '',
    email: connection?.email || '',
    phone: connection?.phone || '',
    notes: connection?.notes || '',
    preferred_platform: connection?.preferred_platform || 'whatsapp',
    closeness: connection?.closeness || 3,
    avatar_url: connection?.avatar_url || '',
  })

  // Update form data when connection changes
  React.useEffect(() => {
    if (connection) {
      setFormData({
        name: connection.name || '',
        relationship: connection.relationship || '',
        email: connection.email || '',
        phone: connection.phone || '',
        notes: connection.notes || '',
        preferred_platform: connection.preferred_platform || 'whatsapp',
        closeness: connection.closeness || 3,
        avatar_url: connection.avatar_url || '',
      })
    }
  }, [connection])

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user || !connection) return

    setUploadingAvatar(true)
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${connection.id}/avatar.${fileExt}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (error) throw error

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Failed to upload avatar. Please try again.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !connection || !formData.name.trim()) return

    setLoading(true)
    try {
      // Determine if we're using a custom platform
      const isCustomPlatform = !platformOptions.some(p => p.value === formData.preferred_platform)
      
      const updateData = {
        name: formData.name.trim(),
        relationship: formData.relationship || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        notes: formData.notes.trim() || null,
        preferred_platform: isCustomPlatform ? 'custom' as PlatformType : formData.preferred_platform as PlatformType,
        custom_platform: isCustomPlatform ? formData.preferred_platform : null,
        closeness: formData.closeness,
        avatar_url: formData.avatar_url || null,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('people')
        .update(updateData)
        .eq('id', connection.id)
        .eq('user_id', user.id)

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating connection:', error)
      alert('Failed to update connection. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!user || !connection) return

    setDeleteLoading(true)
    try {
      // Delete the person (this will cascade to interactions and reminders due to foreign key constraints)
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', connection.id)
        .eq('user_id', user.id)

      if (error) throw error

      // Delete avatar from storage if it exists
      if (connection.avatar_url) {
        try {
          const fileName = `${user.id}/${connection.id}/avatar.jpg`
          await supabase.storage.from('avatars').remove([fileName])
        } catch (storageError) {
          console.warn('Failed to delete avatar from storage:', storageError)
        }
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error deleting connection:', error)
      alert('Failed to delete connection. Please try again.')
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const getClosenessLabel = (value: number) => {
    const labels = ['Distant', 'Acquaintance', 'Friend', 'Close Friend', 'Very Close']
    return labels[value - 1] || 'Friend'
  }

  if (!connection) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Edit Connection</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={formData.avatar_url} alt={formData.name} />
              <AvatarFallback className="text-lg">
                {formData.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="flex items-center space-x-2"
              >
                {uploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <span>{uploadingAvatar ? 'Uploading...' : 'Change Photo'}</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              {formData.avatar_url && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, avatar_url: '' }))}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove Photo
                </Button>
              )}
            </div>
          </div>

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
              onValueChange={(value: string) => setFormData({ ...formData, relationship: value })}
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
              onValueChange={(value: string) => setFormData({ ...formData, preferred_platform: value })}
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
            
            {!showDeleteConfirm ? (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
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
                      Update Connection
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel Delete
                </Button>
                
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex-1"
                >
                  {deleteLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Confirm Delete
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 