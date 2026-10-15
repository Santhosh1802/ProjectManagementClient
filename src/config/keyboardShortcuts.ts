import { ROUTE_ROLES, type AppRole } from "@/config/routeAccess"

/*
 * Central keyboard shortcut registry.
 *
 * This is the single source of truth for:
 *   - the global keyboard handler (`useKeyboardShortcuts`)
 *   - the Keyboard Shortcuts help dialog
 *   - inline <kbd> hints (header search, user menu)
 *
 * Keys are written in a platform-neutral form:
 *   "mod"  → ⌘ on macOS, Ctrl on Windows/Linux
 *   Sequences (G → D) are listed as consecutive keys with
 *   `sequence: true`.
 */

export type ShortcutCategory =
  | "Global"
  | "Navigation"
  | "Creation"
  | "Search"
  | "Actions"

export const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  "Global",
  "Navigation",
  "Creation",
  "Search",
  "Actions",
]

export type ShortcutAction =
  | { type: "openSearch" }
  | { type: "openShortcuts" }
  | { type: "navigate"; to: string }
  | { type: "focusPageSearch" }
  /*
   * Handled by an existing component (Base UI overlays, sidebar,
   * theme provider). Listed for discoverability only — the central
   * handler never re-implements these.
   */
  | { type: "external" }

export type ShortcutScope = "global" | "page"

export interface ShortcutDefinition {
  id: string
  /** e.g. ["mod", "k"], ["?"], ["g", "d"] */
  keys: string[]
  /** True for two-key sequences such as G → D. */
  sequence?: boolean
  description: string
  category: ShortcutCategory
  action: ShortcutAction
  scope?: ShortcutScope
  /** Mirrors RoleGuard `allowedRoles`; omitted = every signed-in user. */
  roles?: AppRole[]
  /** Also active while focus is in a text field. */
  allowInEditable?: boolean
}

export const KEYBOARD_SHORTCUTS: ShortcutDefinition[] = [
  /* ------------------------------------------------------------ */
  /* Global                                                       */
  /* ------------------------------------------------------------ */
  {
    id: "global.search",
    keys: ["mod", "k"],
    description: "Open global search",
    category: "Global",
    action: { type: "openSearch" },
    allowInEditable: true,
  },
  {
    id: "global.shortcuts",
    keys: ["mod", "/"],
    description: "Show keyboard shortcuts",
    category: "Global",
    action: { type: "openShortcuts" },
    allowInEditable: true,
  },
  {
    id: "global.shortcuts-help",
    keys: ["?"],
    description: "Show keyboard shortcuts",
    category: "Global",
    action: { type: "openShortcuts" },
  },
  {
    id: "global.close",
    keys: ["Esc"],
    description: "Close dialog, menu or popover",
    category: "Global",
    action: { type: "external" },
  },

  /* ------------------------------------------------------------ */
  /* Navigation                                                   */
  /* ------------------------------------------------------------ */
  {
    id: "nav.dashboard",
    keys: ["g", "d"],
    sequence: true,
    description: "Go to Dashboard",
    category: "Navigation",
    action: { type: "navigate", to: "/app/dashboard" },
  },
  {
    id: "nav.projects",
    keys: ["g", "p"],
    sequence: true,
    description: "Go to Projects",
    category: "Navigation",
    action: { type: "navigate", to: "/app/projects" },
  },
  {
    id: "nav.tasks",
    keys: ["g", "t"],
    sequence: true,
    description: "Go to Tasks",
    category: "Navigation",
    action: { type: "navigate", to: "/app/tasks" },
  },
  {
    id: "nav.users",
    keys: ["g", "u"],
    sequence: true,
    description: "Go to User Management",
    category: "Navigation",
    action: { type: "navigate", to: "/app/users" },
    roles: ROUTE_ROLES.userManagement,
  },
  {
    id: "nav.settings",
    keys: ["g", "s"],
    sequence: true,
    description: "Go to Settings",
    category: "Navigation",
    action: { type: "navigate", to: "/app/settings" },
  },
  {
    id: "nav.profile",
    keys: ["g", "m"],
    sequence: true,
    description: "Go to my Profile",
    category: "Navigation",
    action: { type: "navigate", to: "/app/profile" },
  },

  /* ------------------------------------------------------------ */
  /* Creation                                                     */
  /* ------------------------------------------------------------ */
  {
    id: "create.project",
    keys: ["c", "p"],
    sequence: true,
    description: "Create project",
    category: "Creation",
    action: { type: "navigate", to: "/app/projects/create" },
  },
  {
    id: "create.task",
    keys: ["c", "t"],
    sequence: true,
    description: "Create task",
    category: "Creation",
    action: { type: "navigate", to: "/app/tasks/create" },
  },
  {
    id: "create.user",
    keys: ["c", "u"],
    sequence: true,
    description: "Create user",
    category: "Creation",
    action: { type: "navigate", to: "/app/users/create" },
    roles: ROUTE_ROLES.userAdministration,
  },

  /* ------------------------------------------------------------ */
  /* Search                                                       */
  /* ------------------------------------------------------------ */
  {
    id: "search.page",
    keys: ["/"],
    description: "Focus search on the current page",
    category: "Search",
    action: { type: "focusPageSearch" },
    scope: "page",
  },

  /* ------------------------------------------------------------ */
  /* Actions (existing component-level shortcuts)                 */
  /* ------------------------------------------------------------ */
  {
    id: "action.submit",
    keys: ["mod", "Enter"],
    description: "Submit the current form (create & edit forms)",
    category: "Actions",
    action: { type: "external" },
    scope: "page",
  },
  {
    id: "action.sidebar",
    keys: ["mod", "b"],
    description: "Toggle sidebar",
    category: "Actions",
    action: { type: "external" },
  },
  {
    id: "action.theme",
    keys: ["d"],
    description: "Toggle light / dark theme",
    category: "Actions",
    action: { type: "external" },
  },
]

export function getShortcut(id: string): ShortcutDefinition | undefined {
  return KEYBOARD_SHORTCUTS.find((shortcut) => shortcut.id === id)
}

/** Data attribute marking the input that `/` should focus. */
export const PAGE_SEARCH_SELECTOR = "[data-page-search]"

/** How long the second key of a sequence is awaited. */
export const SEQUENCE_TIMEOUT_MS = 1000
