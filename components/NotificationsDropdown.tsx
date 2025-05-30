import React from 'react'
import { Bell, Clock, Heart, MessageCircle, CheckCircle, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useNotifications } from '@/hooks/useNotifications'

export default function NotificationsDropdown() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <Clock className="w-4 h-4 text-coral-500" />
      case 'activity': return <MessageCircle className="w-4 h-4 text-sage-500" />
      case 'milestone': return <Heart className="w-4 h-4 text-purple-500" />
      case 'system': return <Bell className="w-4 h-4 text-blue-500" />
      default: return <Bell className="w-4 h-4 text-neutral-500" />
    }
  }

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high': return 'border-l-coral-500'
      case 'medium': return 'border-l-amber-500'
      case 'low': return 'border-l-sage-500'
      default: return 'border-l-neutral-300'
    }
  }

  const formatTimestamp = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-coral-500 hover:bg-coral-500"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel className="text-base font-semibold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-xs text-coral-600 hover:text-coral-700 font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center text-sm text-neutral-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center">
            <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6 text-sage-600" />
            </div>
            <p className="text-sm text-neutral-600">You're all caught up!</p>
            <p className="text-xs text-neutral-500 mt-1">No new notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`p-3 cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
                !notification.is_read ? 'bg-neutral-50' : ''
              }`}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <div className="flex items-start space-x-3 w-full">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm font-medium ${!notification.is_read ? 'text-neutral-900' : 'text-neutral-700'}`}>
                      {notification.title}
                    </p>
                    <div className="flex items-center space-x-1">
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-coral-500 rounded-full flex-shrink-0" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-neutral-200"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {notification.description && (
                    <p className="text-xs text-neutral-600 mb-1">
                      {notification.description}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500">
                    {formatTimestamp(notification.created_at)}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <button className="w-full text-center text-xs text-neutral-600 hover:text-neutral-800 py-2">
                View all notifications
              </button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 