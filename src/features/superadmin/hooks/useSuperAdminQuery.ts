import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { UserRole } from "@/features/users/types/user.types"
import {
  getPlatformOverview,
  getSuperAdminAccessPolicy,
  getSuperAdminAuditLogs,
  getSuperAdminUsers,
  getSuperAdminWorkspaces,
  resetSuperAdminAccessPolicy,
  updateSuperAdminAccessPolicy,
  updateSuperAdminUserRole,
  updateSuperAdminUserStatus,
  updateSuperAdminWorkspacePlan,
  updateSuperAdminWorkspaceStatus,
  verifySuperAdminUserEmail,
} from "../services/superAdmin.service"
import type {
  AccessControlPolicy,
  PlanTier,
  WorkspaceStatus,
  WorkspaceType,
} from "../types/superAdmin.types"

export const SUPER_ADMIN_KEYS = {
  overview: ["super-admin", "overview"] as const,
  workspaces: (params: Record<string, unknown>) => ["super-admin", "workspaces", params] as const,
  users: (params: Record<string, unknown>) => ["super-admin", "users", params] as const,
  auditLogs: (page: number, size: number) => ["super-admin", "audit-logs", page, size] as const,
  accessPolicy: ["super-admin", "access-policy"] as const,
}

export function usePlatformOverviewQuery() {
  return useQuery({
    queryKey: SUPER_ADMIN_KEYS.overview,
    queryFn: getPlatformOverview,
    refetchInterval: 30_000,
  })
}

export function useSuperAdminWorkspacesQuery(params: {
  keyword?: string
  type?: WorkspaceType | ""
  status?: WorkspaceStatus | ""
  page?: number
  size?: number
}) {
  return useQuery({
    queryKey: SUPER_ADMIN_KEYS.workspaces(params),
    queryFn: () => getSuperAdminWorkspaces(params),
  })
}

export function useSuperAdminUsersQuery(params: {
  keyword?: string
  role?: UserRole | ""
  isActive?: boolean | null
  page?: number
  size?: number
}) {
  return useQuery({
    queryKey: SUPER_ADMIN_KEYS.users(params),
    queryFn: () => getSuperAdminUsers(params),
  })
}

export function useSuperAdminAuditLogsQuery(page = 0, size = 25) {
  return useQuery({
    queryKey: SUPER_ADMIN_KEYS.auditLogs(page, size),
    queryFn: () => getSuperAdminAuditLogs({ page, size }),
  })
}

export function useUpdateWorkspaceStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ workspaceId, status }: { workspaceId: string; status: WorkspaceStatus }) =>
      updateSuperAdminWorkspaceStatus(workspaceId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["super-admin"] })
    },
  })
}

export function useUpdateWorkspacePlanMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ workspaceId, planTier }: { workspaceId: string; planTier: PlanTier }) =>
      updateSuperAdminWorkspacePlan(workspaceId, planTier),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["super-admin"] })
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] })
    },
  })
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      updateSuperAdminUserRole(userId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["super-admin"] })
    },
  })
}

export function useUpdateUserStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      updateSuperAdminUserStatus(userId, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["super-admin"] })
    },
  })
}

export function useVerifyUserEmailMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => verifySuperAdminUserEmail(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["super-admin"] })
    },
  })
}

export function useSuperAdminAccessPolicyQuery() {
  return useQuery({
    queryKey: SUPER_ADMIN_KEYS.accessPolicy,
    queryFn: getSuperAdminAccessPolicy,
  })
}

export function useUpdateAccessPolicyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (policy: AccessControlPolicy) => updateSuperAdminAccessPolicy(policy),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["super-admin"] })
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] })
    },
  })
}

export function useResetAccessPolicyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => resetSuperAdminAccessPolicy(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["super-admin"] })
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] })
    },
  })
}
