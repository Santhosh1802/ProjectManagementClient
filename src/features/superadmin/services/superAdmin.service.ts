import api from "@/config/api"
import type { ApiResponse } from "@/features/tasks/types/task.types"
import type { UserRole } from "@/features/users/types/user.types"
import type {
  AccessControlPolicy,
  PageResponse,
  PlanTier,
  PlatformOverview,
  SuperAdminAuditLog,
  SuperAdminUser,
  SuperAdminWorkspace,
  WorkspaceStatus,
  WorkspaceType,
} from "../types/superAdmin.types"

export async function getPlatformOverview(): Promise<PlatformOverview> {
  const response = await api.get<ApiResponse<PlatformOverview>>("/super-admin/overview")
  return response.data.data
}

export async function getSuperAdminWorkspaces(params: {
  keyword?: string
  type?: WorkspaceType | ""
  status?: WorkspaceStatus | ""
  page?: number
  size?: number
}): Promise<PageResponse<SuperAdminWorkspace>> {
  const response = await api.get<ApiResponse<PageResponse<SuperAdminWorkspace>>>(
    "/super-admin/workspaces",
    {
      params: {
        keyword: params.keyword || undefined,
        type: params.type || undefined,
        status: params.status || undefined,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    }
  )
  return response.data.data
}

export async function updateSuperAdminWorkspaceStatus(
  workspaceId: string,
  status: WorkspaceStatus
): Promise<SuperAdminWorkspace> {
  const response = await api.patch<ApiResponse<SuperAdminWorkspace>>(
    `/super-admin/workspaces/${workspaceId}/status`,
    { status }
  )
  return response.data.data
}

export async function updateSuperAdminWorkspacePlan(
  workspaceId: string,
  planTier: PlanTier
): Promise<SuperAdminWorkspace> {
  const response = await api.patch<ApiResponse<SuperAdminWorkspace>>(
    `/super-admin/workspaces/${workspaceId}/plan`,
    { planTier }
  )
  return response.data.data
}

export async function getSuperAdminUsers(params: {
  keyword?: string
  role?: UserRole | ""
  isActive?: boolean | null
  page?: number
  size?: number
}): Promise<PageResponse<SuperAdminUser>> {
  const response = await api.get<ApiResponse<PageResponse<SuperAdminUser>>>(
    "/super-admin/users",
    {
      params: {
        keyword: params.keyword || undefined,
        role: params.role || undefined,
        isActive: params.isActive === null || params.isActive === undefined ? undefined : params.isActive,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    }
  )
  return response.data.data
}

export async function updateSuperAdminUserRole(
  userId: string,
  role: UserRole
): Promise<SuperAdminUser> {
  const response = await api.patch<ApiResponse<SuperAdminUser>>(
    `/super-admin/users/${userId}/role`,
    { role }
  )
  return response.data.data
}

export async function updateSuperAdminUserStatus(
  userId: string,
  isActive: boolean
): Promise<SuperAdminUser> {
  const response = await api.patch<ApiResponse<SuperAdminUser>>(
    `/super-admin/users/${userId}/status`,
    { isActive }
  )
  return response.data.data
}

export async function verifySuperAdminUserEmail(userId: string): Promise<SuperAdminUser> {
  const response = await api.patch<ApiResponse<SuperAdminUser>>(
    `/super-admin/users/${userId}/verify-email`
  )
  return response.data.data
}

export async function getSuperAdminAuditLogs(params: {
  page?: number
  size?: number
}): Promise<PageResponse<SuperAdminAuditLog>> {
  const response = await api.get<ApiResponse<PageResponse<SuperAdminAuditLog>>>(
    "/super-admin/audit-logs",
    {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 25,
      },
    }
  )
  return response.data.data
}

export async function getSuperAdminAccessPolicy(): Promise<AccessControlPolicy> {
  const response = await api.get<ApiResponse<AccessControlPolicy>>(
    "/super-admin/access-policy"
  )
  return response.data.data
}

export async function updateSuperAdminAccessPolicy(
  policy: AccessControlPolicy
): Promise<AccessControlPolicy> {
  const response = await api.put<ApiResponse<AccessControlPolicy>>(
    "/super-admin/access-policy",
    policy
  )
  return response.data.data
}

export async function resetSuperAdminAccessPolicy(): Promise<AccessControlPolicy> {
  const response = await api.post<ApiResponse<AccessControlPolicy>>(
    "/super-admin/access-policy/reset"
  )
  return response.data.data
}
