import type { ProjectRole } from "@/features/projects/types/project.types"
import type { WorkspaceRole } from "@/features/workspaces/types/workspace.types"

export interface ProjectPermissionContext {
  userId: string
  userRole: string
  projectOwnerId: string
  projectRole?: ProjectRole
  workspaceRole?: WorkspaceRole | string | null
}

export interface ProjectPermissions {
  canEditProject: boolean
  canManageMembers: boolean
  canChangeOwner: boolean
  canDeleteProject: boolean
  canCreateTask: boolean
  canAssignTask: boolean
}

export function getProjectPermissions({
  userId,
  userRole,
  projectOwnerId,
  projectRole,
  workspaceRole,
}: ProjectPermissionContext): ProjectPermissions {
  const normalizedGlobalRole = (userRole ?? "").toUpperCase()
  const normalizedWorkspaceRole = (workspaceRole ?? "").toUpperCase()

  const isGlobalAdmin =
    normalizedGlobalRole === "SUPER_ADMIN" || normalizedGlobalRole === "ADMIN"
  const isOrgAdmin =
    normalizedWorkspaceRole === "OWNER" || normalizedWorkspaceRole === "ADMIN"
  const isOwner = Boolean(userId && projectOwnerId && userId === projectOwnerId)
  const isManager = projectRole === "MANAGER"
  const isMember = projectRole === "MEMBER"

  return {
    canEditProject: isGlobalAdmin || isOrgAdmin || isOwner || isManager,

    canManageMembers: isGlobalAdmin || isOrgAdmin || isOwner || isManager,

    canChangeOwner: isGlobalAdmin || isOrgAdmin || isOwner,

    canDeleteProject: isGlobalAdmin || isOrgAdmin || isOwner,

    canCreateTask:
      isGlobalAdmin || isOrgAdmin || isOwner || isManager || isMember,

    canAssignTask: isGlobalAdmin || isOrgAdmin || isOwner || isManager,
  }
}
