import type { UserRole } from "@/features/users/types/user.types"

export interface KafkaStatusSnapshot {
  enabled: boolean
  bootstrapServers: string
  domainEventsTopic: string
  dlqTopic: string
  publishedCount: number
  consumedCount: number
  failedCount: number
  lastPublishedAt: string | null
  lastConsumedAt: string | null
  lastError: string | null
}

export interface PlatformOverview {
  totalUsers: number
  activeUsers: number
  verifiedUsers: number
  totalWorkspaces: number
  organizationWorkspaces: number
  personalWorkspaces: number
  activeWorkspaces: number
  suspendedWorkspaces: number
  totalProjects: number
  totalTasks: number
  totalWorkflowExecutions: number
  kafkaStatus: KafkaStatusSnapshot
}

export type WorkspaceStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED"
export type WorkspaceType = "PERSONAL" | "ORGANIZATION"
export type PlanTier = "FREE" | "PRO" | "ENTERPRISE"

export interface SuperAdminWorkspace {
  id: string
  name: string
  workspaceType: WorkspaceType
  status: WorkspaceStatus
  planTier: PlanTier
  maxProjects: number
  maxMembers: number
  maxWorkflowRules: number
  ownerId: string | null
  ownerName: string
  ownerEmail: string
  memberCount: number
  projectCount: number
  createdAt: string
}

export interface SuperAdminUser {
  id: string
  firstName: string
  lastName: string | null
  email: string
  userRole: UserRole
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  lastLoginAt: string | null
}

export interface SuperAdminAuditLog {
  id: string
  taskId: string | null
  projectId: string | null
  actorId: string | null
  actorName: string
  actorEmail: string
  actionType: string
  details: string
  createdAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface AccessControlPolicy {
  allowUserDirectorySearch: boolean
  allowPersonalWorkspaceProjectMembers: boolean
  autoEnrollProjectMembersIntoOrg: boolean
  orgAdminCanManageAllProjects: boolean
  orgMemberCanCreateProjects: boolean
  orgMemberCanCreateChatGroups: boolean
  projectManagerCanManageMembers: boolean
  projectManagerCanEditProject: boolean
  projectMemberCanCreateTasks: boolean
  projectMemberCanAssignTasks: boolean
  freeMaxProjects: number
  freeMaxMembers: number
  freeMaxWorkflowRules: number
  proMaxProjects: number
  proMaxMembers: number
  proMaxWorkflowRules: number
  enterpriseMaxProjects: number
  enterpriseMaxMembers: number
  enterpriseMaxWorkflowRules: number
  maxProjectStorageMb?: number
  updatedByEmail?: string | null
  updatedAt?: string | null
}
