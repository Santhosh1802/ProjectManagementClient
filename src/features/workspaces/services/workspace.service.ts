import api from "@/config/api"
import type { ApiResponse } from "@/features/tasks/types/task.types"
import type {
  Workspace,
  WorkspaceMember,
  WorkspaceInvitation,
  CreateOrganizationRequest,
  UpdateWorkspaceRequest,
  InviteMemberRequest,
  AcceptInvitationRequest,
  UpdateMemberRoleRequest,
  TransferOwnershipRequest,
} from "../types/workspace.types"

/**
 * Lists all workspaces accessible to the authenticated user.
 */
export async function getWorkspaces(): Promise<Workspace[]> {
  const response = await api.get<ApiResponse<Workspace[]>>("/workspaces")
  return response.data.data
}

/**
 * Retrieves a specific workspace by ID.
 */
export async function getWorkspaceById(workspaceId: string): Promise<Workspace> {
  const response = await api.get<ApiResponse<Workspace>>(`/workspaces/${workspaceId}`)
  return response.data.data
}

/**
 * Creates a new organization workspace.
 */
export async function createOrganization(
  data: CreateOrganizationRequest
): Promise<Workspace> {
  const response = await api.post<ApiResponse<Workspace>>("/organizations", data)
  return response.data.data
}

/**
 * Updates workspace settings (name).
 */
export async function updateWorkspace(
  workspaceId: string,
  data: UpdateWorkspaceRequest
): Promise<Workspace> {
  const response = await api.patch<ApiResponse<Workspace>>(
    `/workspaces/${workspaceId}`,
    data
  )
  return response.data.data
}

/**
 * Lists all members of a workspace.
 */
export async function getWorkspaceMembers(
  workspaceId: string
): Promise<WorkspaceMember[]> {
  const response = await api.get<ApiResponse<WorkspaceMember[]>>(
    `/workspaces/${workspaceId}/members`
  )
  return response.data.data
}

/**
 * Invites a user to the workspace.
 */
export async function inviteMember(
  workspaceId: string,
  data: InviteMemberRequest
): Promise<WorkspaceInvitation> {
  const response = await api.post<ApiResponse<WorkspaceInvitation>>(
    `/workspaces/${workspaceId}/invitations`,
    data
  )
  return response.data.data
}

/**
 * Accepts a workspace invitation using raw token.
 */
export async function acceptInvitation(
  data: AcceptInvitationRequest
): Promise<Workspace> {
  const response = await api.post<ApiResponse<Workspace>>("/invitations/accept", data)
  return response.data.data
}

/**
 * Updates an organization member's role.
 */
export async function updateMemberRole(
  workspaceId: string,
  userId: string,
  data: UpdateMemberRoleRequest
): Promise<WorkspaceMember> {
  const response = await api.patch<ApiResponse<WorkspaceMember>>(
    `/workspaces/${workspaceId}/members/${userId}`,
    data
  )
  return response.data.data
}

/**
 * Removes a member from the workspace.
 */
export async function removeMember(
  workspaceId: string,
  userId: string
): Promise<void> {
  await api.delete<ApiResponse<null>>(`/workspaces/${workspaceId}/members/${userId}`)
}

/**
 * Transfers organization ownership to another active member.
 */
export async function transferOwnership(
  workspaceId: string,
  data: TransferOwnershipRequest
): Promise<Workspace> {
  const response = await api.post<ApiResponse<Workspace>>(
    `/workspaces/${workspaceId}/transfer-ownership`,
    data
  )
  return response.data.data
}
