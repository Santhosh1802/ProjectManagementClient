import { describe, it, expect, beforeEach } from "vitest"
import workspaceReducer, {
  setWorkspaces,
  setActiveWorkspace,
  clearWorkspaces,
  setWorkspaceLoading,
  setWorkspaceError,
  ACTIVE_WORKSPACE_STORAGE_KEY,
} from "./workspaceSlice"
import type { Workspace } from "../types/workspace.types"

describe("workspaceSlice", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  const mockPersonal: Workspace = {
    id: "ws-personal-1",
    name: "John Doe's Workspace",
    workspaceType: "PERSONAL",
    status: "ACTIVE",
    ownerId: "user-1",
    ownerName: "John Doe",
    currentUserRole: "OWNER",
    memberCount: 1,
    projectCount: 2,
    createdAt: "2026-10-28T10:00:00Z",
    updatedAt: "2026-10-28T10:00:00Z",
  }

  const mockOrg: Workspace = {
    id: "ws-org-1",
    name: "Acme Corp",
    workspaceType: "ORGANIZATION",
    status: "ACTIVE",
    ownerId: "user-1",
    ownerName: "John Doe",
    currentUserRole: "OWNER",
    memberCount: 5,
    projectCount: 8,
    createdAt: "2026-10-28T11:00:00Z",
    updatedAt: "2026-10-28T11:00:00Z",
  }

  it("should have correct initial state", () => {
    const state = workspaceReducer(undefined, { type: "UNKNOWN" })
    expect(state.workspaces).toEqual([])
    expect(state.activeWorkspace).toBeNull()
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it("should auto-select personal workspace when setting workspaces without prior selection", () => {
    const state = workspaceReducer(
      undefined,
      setWorkspaces([mockOrg, mockPersonal])
    )
    expect(state.workspaces).toHaveLength(2)
    expect(state.activeWorkspace?.id).toBe("ws-personal-1")
    expect(localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)).toBe("ws-personal-1")
  })

  it("should restore stored workspace selection from localStorage if valid", () => {
    localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, "ws-org-1")
    const state = workspaceReducer(
      undefined,
      setWorkspaces([mockPersonal, mockOrg])
    )
    expect(state.activeWorkspace?.id).toBe("ws-org-1")
  })

  it("should set active workspace and persist to localStorage", () => {
    const initialState = {
      workspaces: [mockPersonal, mockOrg],
      activeWorkspace: mockPersonal,
      isLoading: false,
      error: null,
    }

    const state = workspaceReducer(initialState, setActiveWorkspace(mockOrg))
    expect(state.activeWorkspace?.id).toBe("ws-org-1")
    expect(localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)).toBe("ws-org-1")
  })

  it("should clear workspaces and remove localStorage key on clearWorkspaces", () => {
    localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, "ws-org-1")
    const initialState = {
      workspaces: [mockPersonal, mockOrg],
      activeWorkspace: mockOrg,
      isLoading: false,
      error: null,
    }

    const state = workspaceReducer(initialState, clearWorkspaces())
    expect(state.workspaces).toEqual([])
    expect(state.activeWorkspace).toBeNull()
    expect(localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)).toBeNull()
  })

  it("should update loading and error states correctly", () => {
    let state = workspaceReducer(undefined, setWorkspaceLoading(true))
    expect(state.isLoading).toBe(true)

    state = workspaceReducer(state, setWorkspaceError("Network error"))
    expect(state.error).toBe("Network error")
  })
})
