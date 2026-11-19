import api from "@/config/api"
import type { ApiResponse } from "@/features/tasks/types/task.types"
import type {
  CreateWhiteboardRequest,
  UpdateWhiteboardRequest,
  Whiteboard,
} from "../types/whiteboard.types"

export async function getWhiteboards(projectId?: string): Promise<Whiteboard[]> {
  const response = await api.get<ApiResponse<Whiteboard[]>>("/whiteboards", {
    params: projectId ? { projectId } : undefined,
  })
  return response.data.data
}

export async function getWhiteboardById(id: string): Promise<Whiteboard> {
  const response = await api.get<ApiResponse<Whiteboard>>(`/whiteboards/${id}`)
  return response.data.data
}

export async function createWhiteboard(
  data: CreateWhiteboardRequest
): Promise<Whiteboard> {
  const response = await api.post<ApiResponse<Whiteboard>>("/whiteboards", data)
  return response.data.data
}

export async function updateWhiteboard(
  id: string,
  data: UpdateWhiteboardRequest
): Promise<Whiteboard> {
  const response = await api.put<ApiResponse<Whiteboard>>(`/whiteboards/${id}`, data)
  return response.data.data
}

export async function deleteWhiteboard(id: string): Promise<void> {
  await api.delete<ApiResponse<void>>(`/whiteboards/${id}`)
}
