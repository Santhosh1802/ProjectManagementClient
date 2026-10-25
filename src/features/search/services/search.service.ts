import api from "@/config/api"
import type { ApiResponse } from "@/features/tasks/types/task.types"
import type { GlobalSearchResponse } from "../types/search.types"

export async function globalSearch(keyword: string, limit = 5): Promise<GlobalSearchResponse> {
  const res = await api.get<ApiResponse<GlobalSearchResponse>>("/search/global", {
    params: { keyword, limit },
  })
  return (
    res.data.data || {
      projects: [],
      tasks: [],
      members: [],
      comments: [],
    }
  )
}
