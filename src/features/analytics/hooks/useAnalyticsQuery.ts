import { useQuery } from "@tanstack/react-query"
import { analyticsKeys } from "@/lib/queryKeys"
import {
  getOverviewAnalytics,
  getProjectAnalytics,
  getWorkloadAnalytics,
} from "../services/analytics.service"

export function useOverviewAnalyticsQuery() {
  return useQuery({
    queryKey: analyticsKeys.overview(),
    queryFn: getOverviewAnalytics,
    staleTime: 60 * 1000,
  })
}

export function useProjectAnalyticsQuery(projectId?: string | null) {
  return useQuery({
    queryKey: analyticsKeys.project(projectId),
    queryFn: () => getProjectAnalytics(projectId!),
    enabled: Boolean(projectId),
    staleTime: 60 * 1000,
  })
}

export function useWorkloadAnalyticsQuery(projectId?: string | null) {
  return useQuery({
    queryKey: analyticsKeys.workload(projectId),
    queryFn: () => getWorkloadAnalytics(projectId),
    staleTime: 60 * 1000,
  })
}
