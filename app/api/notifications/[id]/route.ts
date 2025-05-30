import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notifications'

// PATCH /api/notifications/[id] - Mark notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { action } = body

    if (action === 'mark_read') {
      const success = await NotificationService.markAsRead(id)
      
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Failed to mark notification as read' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Notification marked as read' 
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const success = await NotificationService.deleteNotification(id)
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Notification deleted' 
    })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
} 