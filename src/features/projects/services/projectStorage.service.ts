import api from "@/config/api"
import { API } from "@/config/config"
import type { ApiResponse } from "@/features/tasks/types/task.types"

export interface ProjectFileItem {
  id: string
  projectId: string | null
  channelId: string | null
  uploadedById: string | null
  uploadedByName: string
  uploadedByEmail: string
  fileName: string
  contentType: string
  fileSize: number
  sourceType: "PROJECT" | "CHAT"
  downloadUrl: string
  createdAt: string
}

export interface ProjectStorageSummary {
  projectId: string
  usedBytes: number
  maxBytes: number
  maxStorageMb: number
  files: ProjectFileItem[]
}

export function resolveBackendFileUrl(url: string | null | undefined): string {
  if (!url) return ""
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url
  const base = API.replace(/\/+$/, "")
  if (url.startsWith("/api/")) {
    return `${base}${url.slice(4)}`
  }
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "0 B"
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(2)} MB`
}

export async function getProjectStorage(
  projectId: string
): Promise<ProjectStorageSummary> {
  const response = await api.get<ApiResponse<ProjectStorageSummary>>(
    `/projects/${projectId}/files`
  )
  return response.data.data
}

export async function uploadProjectFile(
  projectId: string,
  file: File
): Promise<ProjectFileItem> {
  const formData = new FormData()
  formData.append("file", file)
  const response = await api.post<ApiResponse<ProjectFileItem>>(
    `/projects/${projectId}/files`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )
  return response.data.data
}

export async function deleteProjectFile(fileId: string): Promise<void> {
  await api.delete(`/project-files/${fileId}`)
}
