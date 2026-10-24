export interface CommentAuthor {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface TaskComment {
  id: string
  taskId: string
  parentCommentId?: string | null
  content: string
  author: CommentAuthor
  isDeleted?: boolean
  replies?: TaskComment[] | null
  createdAt: string
  updatedAt: string
}

export interface CreateCommentRequest {
  taskId: string
  parentCommentId?: string | null
  content: string
}

export interface UpdateCommentRequest {
  content: string
}

export interface CommentPageResponse {
  content: TaskComment[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}
