import type { ProjectRole } from "@/features/projects/types/project.types"

export interface ProjectPermissionContext {
  userId: string
  userRole: string
  projectOwnerId: string
  projectRole?: ProjectRole
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
}: ProjectPermissionContext): ProjectPermissions {
  const isAdmin = userRole === "ADMIN"
  const isOwner = userId === projectOwnerId
  const isManager = projectRole === "MANAGER"
  const isMember = projectRole === "MEMBER"

  return {
    canEditProject:
      isAdmin || isOwner || isManager,

    canManageMembers:
      isAdmin || isOwner || isManager,

    canChangeOwner:
      isAdmin || isOwner,

    canDeleteProject:
      isAdmin || isOwner,

    canCreateTask:
      isAdmin || isOwner || isManager || isMember,

    canAssignTask:
      isAdmin || isOwner || isManager,
  }
}