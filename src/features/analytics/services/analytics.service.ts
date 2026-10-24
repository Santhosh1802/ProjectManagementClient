import api from "@/config/api"
import type { ApiResponse } from "@/features/projects/types/project.types"
import type {
  OverviewAnalytics,
  ProjectAnalytics,
  WorkloadAnalytics,
} from "../types/analytics.types"

/**
 * Fetch overview analytics metrics across accessible projects.
 * GET /api/analytics/overview
 */
export async function getOverviewAnalytics(): Promise<OverviewAnalytics> {
  const res = await api.get<ApiResponse<OverviewAnalytics>>("/analytics/overview")
  return res.data.data
}

/**
 * Fetch project specific analytics.
 * GET /api/analytics/projects/{projectId}
 */
export async function getProjectAnalytics(projectId: string): Promise<ProjectAnalytics> {
  const res = await api.get<ApiResponse<ProjectAnalytics>>(`/analytics/projects/${projectId}`)
  return res.data.data
}

/**
 * Fetch team workload analytics.
 * GET /api/analytics/workload
 */
export async function getWorkloadAnalytics(projectId?: string | null): Promise<WorkloadAnalytics> {
  const params: Record<string, string> = {}
  if (projectId) {
    params.projectId = projectId
  }
  const res = await api.get<ApiResponse<WorkloadAnalytics>>("/analytics/workload", { params })
  return res.data.data
}
