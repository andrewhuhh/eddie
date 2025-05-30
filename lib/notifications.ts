import { supabase } from './supabase'
import { Database, NotificationType, NotificationPriority } from '@/types/database'

type Notification = Database['public']['Tables']['notifications']['Row']
type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

export interface CreateNotificationParams {
  type: NotificationType
  title: string
  description?: string
  priority?: NotificationPriority
  isActionable?: boolean
  actionUrl?: string
  metadata?: Record<string, any>
  expiresAt?: Date
}

export class NotificationService {
  /**
   * Create a new notification for the current user
   */
  static async createNotification(params: CreateNotificationParams): Promise<Notification | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const notificationData: NotificationInsert = {
      user_id: user.id,
      type: params.type,
      title: params.title,
      description: params.description || null,
      priority: params.priority || 'medium',
      is_actionable: params.isActionable || false,
      action_url: params.actionUrl || null,
      metadata: params.metadata || {},
      expires_at: params.expiresAt?.toISOString() || null,
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return null
    }

    return data
  }

  /**
   * Get all notifications for the current user
   */
  static async getNotifications(limit = 20, includeRead = true): Promise<Notification[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!includeRead) {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }

    return data || []
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }

    return count || 0
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error marking notification as read:', error)
      return false
    }

    return true
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }

    return true
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting notification:', error)
      return false
    }

    return true
  }

  /**
   * Clean up expired notifications
   */
  static async cleanupExpiredNotifications(): Promise<void> {
    const { error } = await supabase.rpc('cleanup_expired_notifications')
    
    if (error) {
      console.error('Error cleaning up expired notifications:', error)
    }
  }

  /**
   * Create a reminder notification for a person who needs contact
   */
  static async createContactReminder(personId: string, personName: string, daysSinceContact: number): Promise<Notification | null> {
    const timeAgo = daysSinceContact === 999 ? 'No contact yet' : 
      daysSinceContact === 1 ? '1 day ago' :
      daysSinceContact < 7 ? `${daysSinceContact} days ago` :
      daysSinceContact < 30 ? `${Math.ceil(daysSinceContact / 7)} weeks ago` :
      `${Math.ceil(daysSinceContact / 30)} months ago`

    let priority: NotificationPriority = 'low'
    if (daysSinceContact > 21) priority = 'medium'
    if (daysSinceContact > 30) priority = 'high'

    return this.createNotification({
      type: 'reminder',
      title: `Time to reach out to ${personName}`,
      description: `Last contact: ${timeAgo}`,
      priority,
      isActionable: true,
      actionUrl: `/people/${personId}`,
      metadata: {
        person_id: personId,
        person_name: personName,
        days_since_contact: daysSinceContact,
        reminder_type: 'contact_overdue'
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
    })
  }

  /**
   * Create an activity notification (e.g., journal entry created)
   */
  static async createActivityNotification(title: string, description: string, metadata?: Record<string, any>): Promise<Notification | null> {
    return this.createNotification({
      type: 'activity',
      title,
      description,
      priority: 'low',
      metadata: metadata || {},
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Expires in 3 days
    })
  }

  /**
   * Create a milestone notification
   */
  static async createMilestoneNotification(title: string, description: string, metadata?: Record<string, any>): Promise<Notification | null> {
    return this.createNotification({
      type: 'milestone',
      title,
      description,
      priority: 'medium',
      metadata: metadata || {},
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
    })
  }

  /**
   * Subscribe to real-time notification updates
   */
  static subscribeToNotifications(callback: (notification: Notification) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          callback(payload.new as Notification)
        }
      )
      .subscribe()
  }

  /**
   * Generate reminder notifications based on interaction patterns
   */
  static async generateReminderNotifications(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      // Get user's notification preferences
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!preferences?.reminder_enabled) return

      const reminderFrequencyDays = preferences.reminder_frequency_days || 7

      // Fetch people with their latest interactions
      const { data: people } = await supabase
        .from('people')
        .select(`
          id,
          name,
          relationship,
          interactions (
            occurred_at,
            created_at
          )
        `)
        .eq('user_id', user.id)

      if (!people) return

      // Check for existing reminder notifications to avoid duplicates
      const { data: existingReminders } = await supabase
        .from('notifications')
        .select('metadata')
        .eq('user_id', user.id)
        .eq('type', 'reminder')
        .eq('is_read', false)

      const existingPersonIds = new Set(
        existingReminders?.map(n => {
          const metadata = n.metadata as Record<string, any> | null
          return metadata?.person_id
        }).filter(Boolean) || []
      )

      for (const person of people) {
        // Skip if we already have an unread reminder for this person
        if (existingPersonIds.has(person.id)) continue

        const latestInteraction = person.interactions?.[0]
        const lastContactDate = latestInteraction?.occurred_at || latestInteraction?.created_at
        const lastContact = lastContactDate ? new Date(lastContactDate) : null
        
        let daysSinceContact = 0
        if (lastContact) {
          daysSinceContact = Math.floor((Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
        } else {
          daysSinceContact = 999 // No contact yet
        }

        // Create reminder if it's been longer than the user's preferred frequency
        if (daysSinceContact >= reminderFrequencyDays) {
          await this.createContactReminder(person.id, person.name, daysSinceContact)
        }
      }
    } catch (error) {
      console.error('Error generating reminder notifications:', error)
    }
  }
} 