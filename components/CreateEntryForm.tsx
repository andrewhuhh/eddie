import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Heart, User, Smile, Meh, Frown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { NotificationService } from '@/lib/notifications'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CreateEntryFormProps {
  onClose: () => void
  onSuccess: () => void
}

interface Person {
  id: string
  name: string
}

const moodOptions = [
  { value: 'happy', label: 'Happy', icon: Smile, color: 'text-green-600 bg-green-50 border-green-200' },
  { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-neutral-600 bg-neutral-50 border-neutral-200' },
  { value: 'sad', label: 'Sad', icon: Frown, color: 'text-blue-600 bg-blue-50 border-blue-200' },
]

export default function CreateEntryForm({ onClose, onSuccess }: CreateEntryFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'neutral' as 'happy' | 'neutral' | 'sad',
    person_id: null as string | null
  })
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPeople, setLoadingPeople] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Fetch user's people for the dropdown
  useEffect(() => {
    const fetchPeople = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('people')
          .select('id, name')
          .eq('user_id', user.id)
          .order('name')

        if (error) throw error
        setPeople(data || [])
      } catch (error) {
        console.error('Error fetching people:', error)
        setError('Failed to load contacts. Please try again.')
      } finally {
        setLoadingPeople(false)
      }
    }

    fetchPeople()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.title.trim() || !formData.content.trim()) return

    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          content: formData.content.trim(),
          mood: formData.mood,
          person_id: formData.person_id || null,
        })
        .select()
        .single()

      if (error) throw error

      // Create activity notification for the new journal entry
      await NotificationService.createActivityNotification(
        'Journal entry saved',
        `"${formData.title.trim()}" was added to your journal`,
        {
          entry_id: data.id,
          entry_title: formData.title.trim(),
          mood: formData.mood,
          person_id: formData.person_id
        }
      )

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating entry:', error)
      setError('Failed to create entry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
          <CardTitle className="text-lg sm:text-xl font-serif">Create New Entry</CardTitle>
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
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What's on your mind?"
                required
                className="text-base"
              />
            </div>

            {/* Person (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="person">About someone specific? (Optional)</Label>
              {loadingPeople ? (
                <div className="flex items-center justify-center py-3 text-sm text-muted-foreground">
                  Loading people...
                </div>
              ) : (
                <Select
                  value={formData.person_id || 'general'}
                  onValueChange={(value) => setFormData({ ...formData, person_id: value === 'general' ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="General reflection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General reflection</SelectItem>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Mood */}
            <div className="space-y-3">
              <Label>How are you feeling?</Label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {moodOptions.map((mood) => (
                  <Button
                    key={mood.value}
                    type="button"
                    variant={formData.mood === mood.value ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, mood: mood.value as any })}
                    className={`h-auto p-3 sm:p-4 flex flex-col items-center space-y-1 sm:space-y-2 text-xs sm:text-sm ${
                      formData.mood === mood.value ? mood.color : ''
                    }`}
                  >
                    <mood.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="font-medium">{mood.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Your reflection</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write about your thoughts, feelings, or experiences..."
                rows={5}
                required
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
                disabled={loading || !formData.title.trim() || !formData.content.trim()}
                className="flex-1 order-1 sm:order-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Save Entry
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