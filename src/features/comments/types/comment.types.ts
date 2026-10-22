export interface CommentAuthor {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface TaskComment {
  id: string
  taskId: string
  content: string
  author: CommentAuthor
  createdAt: string
  updatedAt: string
}

export interface CreateCommentRequest {
  taskId: string
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
