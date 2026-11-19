export type WorkspaceType = "PERSONAL" | "ORGANIZATION"
export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER"
export type WorkspaceStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED"
export type PlanTier = "FREE" | "PRO" | "ENTERPRISE"
export type WorkspaceMemberStatus = "ACTIVE" | "SUSPENDED"
export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED"

export interface Workspace {
  id: string
  name: string
  workspaceType: WorkspaceType
  ownerId: string
  ownerName: string
  status: WorkspaceStatus
  planTier?: PlanTier
  maxProjects?: number
  maxMembers?: number
  maxWorkflowRules?: number
  currentUserRole: WorkspaceRole
  memberCount: number
  projectCount: number
  createdAt: string
  updatedAt?: string
}

export interface WorkspaceMember {
  id: string
  userId: string
  email: string
  firstName?: string
  lastName?: string
  role: WorkspaceRole
  status: WorkspaceMemberStatus
  joinedAt: string
}

export interface WorkspaceInvitation {
  id: string
  workspaceId: string
  workspaceName: string
  invitedEmail: string
  role: WorkspaceRole
  status: InvitationStatus
  expiresAt: string
  createdAt: string
  invitationLink?: string
}

export interface CreateOrganizationRequest {
  name: string
}

export interface UpdateWorkspaceRequest {
  name: string
}

export interface InviteMemberRequest {
  email: string
  role: WorkspaceRole
}

export interface AcceptInvitationRequest {
  token: string
}

export interface UpdateMemberRoleRequest {
  role: WorkspaceRole
}

export interface TransferOwnershipRequest {
  newOwnerId: string
}
