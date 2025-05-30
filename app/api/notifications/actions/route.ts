import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notifications'

// POST /api/notifications/actions - Bulk actions on notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'mark_all_read':
        const success = await NotificationService.markAllAsRead()
        
        if (!success) {
          return NextResponse.json(
            { success: false, error: 'Failed to mark all notifications as read' },
            { status: 500 }
          )
        }

        return NextResponse.json({ 
          success: true, 
          message: 'All notifications marked as read' 
        })

      case 'cleanup_expired':
        await NotificationService.cleanupExpiredNotifications()
        
        return NextResponse.json({ 
          success: true, 
          message: 'Expired notifications cleaned up' 
        })

      case 'generate_reminders':
        await NotificationService.generateReminderNotifications()
        
        return NextResponse.json({ 
          success: true, 
          message: 'Reminder notifications generated' 
        })

      case 'get_unread_count':
        const count = await NotificationService.getUnreadCount()
        
        return NextResponse.json({ 
          success: true, 
          data: { count } 
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error performing notification action:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to perform action' },
      { status: 500 }
    )
  }
} 