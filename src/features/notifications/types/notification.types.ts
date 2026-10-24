export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_STATUS_CHANGED"
  | "TASK_COMMENT_ADDED"
  | "PROJECT_MEMBER_ADDED"

export interface NotificationItem {
  id: string
  recipientId: string
  type: NotificationType
  title: string
  message: string
  taskId?: string | null
  projectId?: string | null
  actorId?: string | null
  isRead: boolean
  createdAt: string
}

export interface NotificationPageResponse {
  content: NotificationItem[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}
