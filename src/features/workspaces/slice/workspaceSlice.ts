import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Workspace } from "../types/workspace.types"

export type DefaultWorkspacePreference =
  | "AUTO_PERSONAL"
  | "AUTO_ORGANIZATION"
  | string

interface WorkspaceState {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  defaultWorkspacePreference?: string | null
  isLoading: boolean
  error: string | null
}

export const ACTIVE_WORKSPACE_STORAGE_KEY = "devflow_active_workspace_id"
export const DEFAULT_WORKSPACE_STORAGE_KEY =
  "devflow_default_workspace_preference"

export function getDefaultWorkspaceStorageKey(userId?: string | null): string {
  return userId
    ? `${DEFAULT_WORKSPACE_STORAGE_KEY}_${userId}`
    : DEFAULT_WORKSPACE_STORAGE_KEY
}

export function readDefaultWorkspacePreference(
  userId?: string | null
): string | null {
  try {
    const key = getDefaultWorkspaceStorageKey(userId)
    const value = localStorage.getItem(key)
    return value && value.trim().length > 0 ? value : null
  } catch {
    return null
  }
}

export function writeDefaultWorkspacePreference(
  preference: string | null,
  userId?: string | null
): void {
  try {
    const key = getDefaultWorkspaceStorageKey(userId)
    if (!preference || preference === "AUTO_PERSONAL") {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, preference)
    }
  } catch {
    // Ignore storage errors (e.g. private mode / restricted test env)
  }
}

export function resolveDefaultWorkspace(
  workspaces: Workspace[],
  preference?: string | null
): Workspace | null {
  if (workspaces.length === 0) return null

  if (preference === "AUTO_ORGANIZATION") {
    return (
      workspaces.find((w) => w.workspaceType === "ORGANIZATION") ??
      workspaces.find((w) => w.workspaceType === "PERSONAL") ??
      workspaces[0] ??
      null
    )
  }

  if (preference && preference !== "AUTO_PERSONAL") {
    const matched = workspaces.find((w) => w.id === preference)
    if (matched) return matched
  }

  const personal = workspaces.find((w) => w.workspaceType === "PERSONAL")
  return personal ?? workspaces[0] ?? null
}

type SetWorkspacesPayload =
  | Workspace[]
  | { workspaces: Workspace[]; userId?: string | null }

type SetDefaultWorkspacePayload =
  | string
  | null
  | { preference: string | null; userId?: string | null }

const initialState: WorkspaceState = {
  workspaces: [],
  activeWorkspace: null,
  defaultWorkspacePreference: null,
  isLoading: false,
  error: null,
}

export const workspaceSlice = createSlice({
  name: "workspaces",
  initialState,
  reducers: {
    setWorkspaces: (state, action: PayloadAction<SetWorkspacesPayload>) => {
      const workspaces = Array.isArray(action.payload)
        ? action.payload
        : action.payload.workspaces
      const userId = Array.isArray(action.payload)
        ? null
        : (action.payload.userId ?? null)

      state.workspaces = workspaces

      const storedPref = readDefaultWorkspacePreference(userId)
      const effectivePref =
        storedPref ?? (userId ? null : (state.defaultWorkspacePreference ?? null))
      state.defaultWorkspacePreference = effectivePref

      const storedId = (() => {
        try {
          return localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)
        } catch {
          return null
        }
      })()

      if (state.activeWorkspace) {
        // Refresh active workspace data if it still exists in the list
        const updated = workspaces.find(
          (w) => w.id === state.activeWorkspace?.id
        )
        if (updated) {
          state.activeWorkspace = updated
          return
        }
      }

      // If storedId matches an accessible workspace, select it
      if (storedId) {
        const matching = workspaces.find((w) => w.id === storedId)
        if (matching) {
          state.activeWorkspace = matching
          return
        }
      }

      // Resolve startup workspace from user default preference, falling back to personal/first
      const fallback = resolveDefaultWorkspace(workspaces, effectivePref)
      state.activeWorkspace = fallback
      if (fallback) {
        try {
          localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, fallback.id)
        } catch {
          // Ignore storage errors
        }
      }
    },

    setActiveWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.activeWorkspace = action.payload
      try {
        localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, action.payload.id)
      } catch {
        // Ignore storage errors
      }
    },

    setDefaultWorkspacePreference: (
      state,
      action: PayloadAction<SetDefaultWorkspacePayload>
    ) => {
      const rawPref =
        typeof action.payload === "string" || action.payload === null
          ? action.payload
          : action.payload.preference
      const userId =
        typeof action.payload === "string" || action.payload === null
          ? null
          : (action.payload.userId ?? null)

      const normalized =
        !rawPref || rawPref === "AUTO_PERSONAL" ? null : rawPref

      state.defaultWorkspacePreference = normalized
      writeDefaultWorkspacePreference(normalized, userId)
    },

    clearWorkspaces: (state) => {
      state.workspaces = []
      state.activeWorkspace = null
      state.defaultWorkspacePreference = undefined
      state.error = null
      try {
        localStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY)
      } catch {
        // Ignore storage errors
      }
    },

    setWorkspaceLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    setWorkspaceError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setWorkspaces,
  setActiveWorkspace,
  setDefaultWorkspacePreference,
  clearWorkspaces,
  setWorkspaceLoading,
  setWorkspaceError,
} = workspaceSlice.actions

export default workspaceSlice.reducer
