import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Bell,
  Check,
  CheckCheck,
  FolderKanban,
  ListTodo,
  Loader2,
  MessageSquare,
  UserPlus,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Badge } from "@/components/ui/badge"

import {
  useNotificationsQuery,
  useUnreadNotificationsCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "../hooks/useNotificationsQuery"
import type { NotificationItem, NotificationType } from "../types/notification.types"

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const { data: unreadCount = 0 } = useUnreadNotificationsCountQuery()
  const { data: notificationsPage, isLoading, isError, refetch } = useNotificationsQuery(0, 15)
  const markAsReadMutation = useMarkNotificationAsReadMutation()
  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation()

  const notifications = notificationsPage?.content ?? []

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      markAsReadMutation.mutate(item.id)
    }

    setOpen(false)

    if (item.taskId) {
      navigate(`/app/tasks/${item.taskId}`)
    } else if (item.projectId) {
      navigate(`/app/projects/${item.projectId}`)
    }
  }

  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case "TASK_ASSIGNED":
        return <ListTodo className="size-4 text-primary" />
      case "TASK_STATUS_CHANGED":
        return <Check className="size-4 text-amber-500" />
      case "TASK_COMMENT_ADDED":
        return <MessageSquare className="size-4 text-blue-500" />
      case "PROJECT_MEMBER_ADDED":
        return <UserPlus className="size-4 text-emerald-500" />
      default:
        return <FolderKanban className="size-4 text-muted-foreground" />
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative size-8 text-muted-foreground hover:text-primary"
            aria-label={
              unreadCount > 0
                ? `${unreadCount} unread notifications`
                : "Notifications"
            }
          />
        }
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>


      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 shadow-lg border border-border"
      >
        <div className="flex items-center justify-between p-3.5 border-b border-border/70 bg-muted/30">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="h-7 text-xs text-muted-foreground hover:text-primary gap-1"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin mr-2" />
              Loading notifications...
            </div>
          ) : isError ? (
            <div className="py-6 px-4 text-center text-sm text-destructive">
              <p>Failed to load notifications.</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => refetch()}
                className="mt-1 h-auto p-0 text-xs"
              >
                Retry
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Bell className="size-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="font-medium">No notifications yet</p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">
                Updates regarding your tasks and projects will appear here.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`flex items-start gap-3 p-3 transition-colors cursor-pointer hover:bg-muted/50 ${
                  !item.isRead ? "bg-primary/5" : ""
                }`}
              >
                <div className="mt-0.5 shrink-0 rounded-full bg-background p-1.5 border border-border shadow-2xs">
                  {renderIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className={`text-xs truncate ${!item.isRead ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>
                      {item.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                {!item.isRead && (
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                )}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
