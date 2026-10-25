import api from "@/config/api"
import type { ApiResponse } from "@/features/tasks/types/task.types"
import type {
  SavedView,
  CreateSavedViewRequest,
  UpdateSavedViewRequest,
  ViewTarget,
} from "../types/savedView.types"

export async function getSavedViews(target?: ViewTarget): Promise<SavedView[]> {
  const params = target ? { target } : {}
  const res = await api.get<ApiResponse<SavedView[]>>("/api/saved-views", { params })
  return res.data.data || []
}

export async function createSavedView(request: CreateSavedViewRequest): Promise<SavedView> {
  const res = await api.post<ApiResponse<SavedView>>("/api/saved-views", request)
  return res.data.data
}

export async function updateSavedView(id: string, request: UpdateSavedViewRequest): Promise<SavedView> {
  const res = await api.put<ApiResponse<SavedView>>(`/api/saved-views/${id}`, request)
  return res.data.data
}

export async function deleteSavedView(id: string): Promise<boolean> {
  const res = await api.delete<ApiResponse<boolean>>(`/api/saved-views/${id}`)
  return res.data.data
}
