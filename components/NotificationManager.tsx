import React, { useState } from 'react'
import { Bell, RefreshCw, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNotifications } from '@/hooks/useNotifications'

interface FeedbackState {
  type: 'success' | 'error' | null
  message: string
}

export default function NotificationManager() {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>({ type: null, message: '' })
  const { unreadCount, generateReminders, cleanupExpired } = useNotifications()

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: null, message: '' }), 3000)
  }

  const handleGenerateReminders = async () => {
    setLoading(true)
    try {
      await generateReminders()
      showFeedback('success', 'Reminders generated successfully!')
    } catch (error) {
      console.error('Error generating reminders:', error)
      showFeedback('error', 'Failed to generate reminders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCleanupExpired = async () => {
    setLoading(true)
    try {
      await cleanupExpired()
      showFeedback('success', 'Expired notifications cleaned up!')
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error)
      showFeedback('error', 'Failed to cleanup notifications. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-coral-500" />
          <span>Notifications</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Unread Count Display */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-coral-50 to-coral-100 rounded-xl border border-coral-200">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-coral-600" />
            <span className="text-sm font-medium text-coral-800">Unread</span>
          </div>
          <span className="text-xl font-bold text-coral-700">{unreadCount}</span>
        </div>

        {/* Feedback Message */}
        {feedback.type && (
          <div className={`flex items-center space-x-2 p-3 rounded-lg text-sm ${
            feedback.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleGenerateReminders}
            disabled={loading}
            className="w-full justify-start bg-coral-600 hover:bg-coral-700 text-white"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm">Generate Reminders</span>
          </Button>

          <Button
            onClick={handleCleanupExpired}
            disabled={loading}
            className="w-full justify-start"
            variant="outline"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            <span className="text-sm">Clear Old Notifications</span>
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-neutral-500 pt-3 border-t border-neutral-100">
          <p className="leading-relaxed">
            Generate reminders to stay connected with friends and family. 
            Clear old notifications to keep your inbox tidy.
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 