import { describe, it, expect } from "vitest"
import { getProjectPermissions } from "./projectPermission"

describe("getProjectPermissions RBAC matrix", () => {
  it("grants full permissions to SUPER_ADMIN and global ADMIN", () => {
    const superAdmin = getProjectPermissions({
      userId: "u-sa",
      userRole: "SUPER_ADMIN",
      projectOwnerId: "u-other",
    })
    const admin = getProjectPermissions({
      userId: "u-admin",
      userRole: "ADMIN",
      projectOwnerId: "u-other",
    })

    for (const perms of [superAdmin, admin]) {
      expect(perms).toEqual({
        canEditProject: true,
        canManageMembers: true,
        canChangeOwner: true,
        canDeleteProject: true,
        canCreateTask: true,
        canAssignTask: true,
      })
    }
  })

  it("grants full project governance to Organization OWNER and ADMIN", () => {
    const orgOwner = getProjectPermissions({
      userId: "u-org-owner",
      userRole: "USER",
      projectOwnerId: "u-other",
      workspaceRole: "OWNER",
    })
    const orgAdmin = getProjectPermissions({
      userId: "u-org-admin",
      userRole: "USER",
      projectOwnerId: "u-other",
      workspaceRole: "ADMIN",
    })

    expect(orgOwner.canDeleteProject).toBe(true)
    expect(orgAdmin.canManageMembers).toBe(true)
    expect(orgAdmin.canChangeOwner).toBe(true)
  })

  it("grants full permissions to the project owner even as a regular USER", () => {
    const ownerPerms = getProjectPermissions({
      userId: "u-owner",
      userRole: "USER",
      projectOwnerId: "u-owner",
      workspaceRole: "MEMBER",
    })

    expect(ownerPerms).toEqual({
      canEditProject: true,
      canManageMembers: true,
      canChangeOwner: true,
      canDeleteProject: true,
      canCreateTask: true,
      canAssignTask: true,
    })
  })

  it("grants management & assignment (but not ownership transfer or delete) to Project MANAGER", () => {
    const managerPerms = getProjectPermissions({
      userId: "u-mgr",
      userRole: "USER",
      projectOwnerId: "u-owner",
      projectRole: "MANAGER",
    })

    expect(managerPerms).toEqual({
      canEditProject: true,
      canManageMembers: true,
      canChangeOwner: false,
      canDeleteProject: false,
      canCreateTask: true,
      canAssignTask: true,
    })
  })

  it("restricts Project MEMBER to task creation only", () => {
    const memberPerms = getProjectPermissions({
      userId: "u-mem",
      userRole: "USER",
      projectOwnerId: "u-owner",
      projectRole: "MEMBER",
    })

    expect(memberPerms).toEqual({
      canEditProject: false,
      canManageMembers: false,
      canChangeOwner: false,
      canDeleteProject: false,
      canCreateTask: true,
      canAssignTask: false,
    })
  })

  it("denies all permissions to an unrelated USER with no project or org role", () => {
    const outsiderPerms = getProjectPermissions({
      userId: "u-outsider",
      userRole: "USER",
      projectOwnerId: "u-owner",
    })

    expect(outsiderPerms).toEqual({
      canEditProject: false,
      canManageMembers: false,
      canChangeOwner: false,
      canDeleteProject: false,
      canCreateTask: false,
      canAssignTask: false,
    })
  })
})
