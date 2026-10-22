import api from "@/config/api"
import type {
  CommentPageResponse,
  CreateCommentRequest,
  TaskComment,
} from "../types/comment.types"

export async function getCommentsByTask(
  taskId: string,
  page = 0,
  size = 20
): Promise<CommentPageResponse> {
  const response = await api.get<{ data: CommentPageResponse }>(
    `/comments/task/${taskId}?page=${page}&size=${size}`
  )
  return response.data.data
}

export async function createComment(
  request: CreateCommentRequest
): Promise<TaskComment> {
  const response = await api.post<{ data: TaskComment }>("/comments", request)
  return response.data.data
}
