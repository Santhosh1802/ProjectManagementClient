/*
 * Role requirements for role-guarded application routes.
 *
 * Shared by `AppRoutes` (RoleGuard) and the keyboard shortcut
 * registry so both always enforce the same access rules.
 */

export type AppRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "USER"

export const ROUTE_ROLES = {
  /** /app/super-admin */
  superAdmin: ["SUPER_ADMIN"],

  /** /app/users */
  userManagement: ["ADMIN", "SUPER_ADMIN"],

  /** /app/users/create and /app/users/:userId */
  userAdministration: ["MANAGER", "ADMIN", "SUPER_ADMIN"],
} satisfies Record<string, AppRole[]>

export function hasAllowedRole(
  role: string | null | undefined,
  allowedRoles?: readonly AppRole[]
): boolean {
  if (!allowedRoles) {
    return true
  }

  if (!role) {
    return false
  }

  return allowedRoles.includes(role.toUpperCase() as AppRole)
}
