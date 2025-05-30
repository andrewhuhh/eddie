import { NextRequest, NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notifications'

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const includeRead = searchParams.get('includeRead') !== 'false'
    
    const notifications = await NotificationService.getNotifications(limit, includeRead)
    
    return NextResponse.json({ 
      success: true, 
      data: notifications 
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, description, priority, isActionable, actionUrl, metadata, expiresAt } = body

    if (!type || !title) {
      return NextResponse.json(
        { success: false, error: 'Type and title are required' },
        { status: 400 }
      )
    }

    const notification = await NotificationService.createNotification({
      type,
      title,
      description,
      priority,
      isActionable,
      actionUrl,
      metadata,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    })

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Failed to create notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: notification 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    )
  }
} 