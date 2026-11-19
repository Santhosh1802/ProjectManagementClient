import api from "@/config/api"
import { API } from "@/config/config"
import type { ApiResponse } from "@/features/tasks/types/task.types"
import type { TaskAttachment } from "../types/attachment.types"

export async function getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
  const response = await api.get<ApiResponse<TaskAttachment[]>>(
    `/tasks/${taskId}/attachments`
  )
  return response.data.data
}

export async function uploadTaskAttachment(
  taskId: string,
  file: File
): Promise<TaskAttachment> {
  const formData = new FormData()
  formData.append("file", file)
  const response = await api.post<ApiResponse<TaskAttachment>>(
    `/tasks/${taskId}/attachments`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )
  return response.data.data
}

export async function deleteTaskAttachment(attachmentId: string): Promise<void> {
  await api.delete<ApiResponse<void>>(`/attachments/${attachmentId}`)
}

export function getAttachmentDownloadUrl(attachmentId: string): string {
  return `${API}/attachments/${attachmentId}/download`
}
