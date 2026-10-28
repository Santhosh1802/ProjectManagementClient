import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Workspace } from "../types/workspace.types"

interface WorkspaceState {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  isLoading: boolean
  error: string | null
}

export const ACTIVE_WORKSPACE_STORAGE_KEY = "devflow_active_workspace_id"

const initialState: WorkspaceState = {
  workspaces: [],
  activeWorkspace: null,
  isLoading: false,
  error: null,
}

export const workspaceSlice = createSlice({
  name: "workspaces",
  initialState,
  reducers: {
    setWorkspaces: (state, action: PayloadAction<Workspace[]>) => {
      state.workspaces = action.payload

      const storedId = localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)

      if (state.activeWorkspace) {
        // Refresh active workspace data if it still exists in the list
        const updated = action.payload.find((w) => w.id === state.activeWorkspace?.id)
        if (updated) {
          state.activeWorkspace = updated
          return
        }
      }

      // If storedId matches an accessible workspace, select it
      if (storedId) {
        const matching = action.payload.find((w) => w.id === storedId)
        if (matching) {
          state.activeWorkspace = matching
          return
        }
      }

      // Default to personal workspace first, or the first available
      const personal = action.payload.find((w) => w.workspaceType === "PERSONAL")
      const fallback = personal ?? action.payload[0] ?? null
      state.activeWorkspace = fallback
      if (fallback) {
        localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, fallback.id)
      }
    },

    setActiveWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.activeWorkspace = action.payload
      localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, action.payload.id)
    },

    clearWorkspaces: (state) => {
      state.workspaces = []
      state.activeWorkspace = null
      state.error = null
      localStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY)
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
  clearWorkspaces,
  setWorkspaceLoading,
  setWorkspaceError,
} = workspaceSlice.actions

export default workspaceSlice.reducer
