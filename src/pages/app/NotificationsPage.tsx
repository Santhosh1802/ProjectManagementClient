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
  Trash2,
  UserPlus,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
  useNotificationsQuery,
  useUnreadNotificationsCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
} from "@/features/notifications/hooks/useNotificationsQuery"
import type { NotificationItem, NotificationType } from "@/features/notifications/types/notification.types"

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [page, setPage] = useState(0)
  const pageSize = 20

  const unreadOnly = filter === "unread"
  const { data: unreadCount = 0 } = useUnreadNotificationsCountQuery()
  const {
    data: notificationsPage,
    isLoading,
    isError,
    refetch,
  } = useNotificationsQuery(unreadOnly, page, pageSize)

  const markAsReadMutation = useMarkNotificationAsReadMutation()
  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation()
  const deleteMutation = useDeleteNotificationMutation()
  const clearAllMutation = useClearAllNotificationsMutation()

  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  const notifications = notificationsPage?.content ?? []
  const totalPages = notificationsPage?.totalPages ?? 0

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      markAsReadMutation.mutate(item.id)
    }

    if (item.taskId) {
      navigate(`/app/tasks/${item.taskId}`)
    } else if (item.projectId) {
      navigate(`/app/projects/${item.projectId}`)
    }
  }

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteMutation.mutate(id)
  }

  const handleClearAll = () => {
    clearAllMutation.mutate(undefined, {
      onSuccess: () => {
        setClearDialogOpen(false)
        setPage(0)
      },
    })
  }

  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case "TASK_ASSIGNED":
        return <ListTodo className="size-5 text-primary" />
      case "TASK_STATUS_CHANGED":
        return <Check className="size-5 text-amber-500" />
      case "TASK_COMMENT_ADDED":
        return <MessageSquare className="size-5 text-blue-500" />
      case "PROJECT_MEMBER_ADDED":
        return <UserPlus className="size-5 text-emerald-500" />
      default:
        return <FolderKanban className="size-5 text-muted-foreground" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="font-mono text-xs">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your activity alerts, assignments, and discussions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="gap-1.5 text-xs"
            >
              <CheckCheck className="size-3.5" />
              Mark all as read
            </Button>
          )}

          {notifications.length > 0 && (
            <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  />
                }
              >
                <Trash2 className="size-3.5" />
                Clear all
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all of your current notifications.
                    This action cannot be undone. Associated tasks and projects will not be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={clearAllMutation.isPending}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAll}
                    disabled={clearAllMutation.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {clearAllMutation.isPending ? "Clearing..." : "Clear all"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <Tabs
          value={filter}
          onValueChange={(val) => {
            setFilter(val as "all" | "unread")
            setPage(0)
          }}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Notifications List */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Loader2 className="size-7 animate-spin text-primary" />
            <p className="text-sm">Loading your notifications...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <p className="text-sm text-destructive font-medium mb-2">
              Failed to load notifications.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="rounded-full bg-muted p-4 mb-3">
              <Bell className="size-8 text-muted-foreground/60" />
            </div>
            <h3 className="font-semibold text-foreground text-base">
              No notifications {filter === "unread" ? "unread" : "found"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              {filter === "unread"
                ? "You have caught up with all of your notifications."
                : "You have no notifications at this time."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`flex items-start gap-3 sm:gap-4 p-4 transition-colors cursor-pointer hover:bg-muted/50 ${
                  !item.isRead ? "bg-primary/5" : ""
                }`}
              >
                <div className="shrink-0 mt-0.5 rounded-full bg-background p-2 border border-border shadow-2xs">
                  {renderIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4
                      className={`text-sm truncate ${
                        !item.isRead
                          ? "font-semibold text-foreground"
                          : "font-medium text-foreground/80"
                      }`}
                    >
                      {item.title}
                    </h4>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {item.message}
                  </p>

                  {(item.taskId || item.projectId) && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] font-medium text-primary hover:underline">
                        {item.taskId ? "Go to task →" : "Go to project →"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {!item.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      title="Mark as read"
                      onClick={(e) => {
                        e.stopPropagation()
                        markAsReadMutation.mutate(item.id)
                      }}
                      disabled={markAsReadMutation.isPending}
                    >
                      <Check className="size-4" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Delete notification"
                    onClick={(e) => handleDeleteItem(e, item.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={page === 0 || isLoading}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page >= totalPages - 1 || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
