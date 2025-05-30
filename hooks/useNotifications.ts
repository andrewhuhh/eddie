import { useState, useEffect, useCallback } from 'react'
import { NotificationService } from '@/lib/notifications'
import { Database } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'

type Notification = Database['public']['Tables']['notifications']['Row']

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchNotifications = useCallback(async (limit = 20, includeRead = true) => {
    if (!user) return

    try {
      setLoading(true)
      const [notificationsData, unreadCountData] = await Promise.all([
        NotificationService.getNotifications(limit, includeRead),
        NotificationService.getUnreadCount()
      ])
      
      setNotifications(notificationsData)
      setUnreadCount(unreadCountData)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const success = await NotificationService.markAsRead(notificationId)
      if (success) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      return success
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const success = await NotificationService.markAllAsRead()
      if (success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })))
        setUnreadCount(0)
      }
      return success
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }, [])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const success = await NotificationService.deleteNotification(notificationId)
      if (success) {
        const deletedNotification = notifications.find(n => n.id === notificationId)
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        
        // Update unread count if the deleted notification was unread
        if (deletedNotification && !deletedNotification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
      return success
    } catch (error) {
      console.error('Error deleting notification:', error)
      return false
    }
  }, [notifications])

  const generateReminders = useCallback(async () => {
    try {
      await NotificationService.generateReminderNotifications()
      // Refresh notifications after generating reminders
      await fetchNotifications()
    } catch (error) {
      console.error('Error generating reminders:', error)
    }
  }, [fetchNotifications])

  const cleanupExpired = useCallback(async () => {
    try {
      await NotificationService.cleanupExpiredNotifications()
      // Refresh notifications after cleanup
      await fetchNotifications()
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error)
    }
  }, [fetchNotifications])

  // Initial fetch and real-time subscription
  useEffect(() => {
    if (!user) return

    fetchNotifications()

    // Set up real-time subscription for new notifications
    const subscription = NotificationService.subscribeToNotifications((newNotification) => {
      setNotifications(prev => [newNotification, ...prev])
      if (!newNotification.is_read) {
        setUnreadCount(prev => prev + 1)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user, fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    generateReminders,
    cleanupExpired,
  }
} 