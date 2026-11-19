import { describe, it, expect, beforeEach } from "vitest"
import workspaceReducer, {
  setWorkspaces,
  setActiveWorkspace,
  setDefaultWorkspacePreference,
  clearWorkspaces,
  setWorkspaceLoading,
  setWorkspaceError,
  ACTIVE_WORKSPACE_STORAGE_KEY,
  getDefaultWorkspaceStorageKey,
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

  it("should auto-select organization workspace when AUTO_ORGANIZATION default preference is set", () => {
    let state = workspaceReducer(
      undefined,
      setDefaultWorkspacePreference({
        preference: "AUTO_ORGANIZATION",
        userId: "user-1",
      })
    )
    expect(state.defaultWorkspacePreference).toBe("AUTO_ORGANIZATION")
    expect(localStorage.getItem(getDefaultWorkspaceStorageKey("user-1"))).toBe(
      "AUTO_ORGANIZATION"
    )

    state = workspaceReducer(
      state,
      setWorkspaces({ workspaces: [mockPersonal, mockOrg], userId: "user-1" })
    )
    expect(state.activeWorkspace?.id).toBe("ws-org-1")
    expect(localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)).toBe("ws-org-1")
  })

  it("should preserve user default workspace across clearWorkspaces (logout) and isolate by userId", () => {
    let state = workspaceReducer(
      undefined,
      setDefaultWorkspacePreference({ preference: "ws-org-1", userId: "user-1" })
    )
    state = workspaceReducer(state, clearWorkspaces())
    expect(state.activeWorkspace).toBeNull()
    expect(localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)).toBeNull()

    // Re-login as user-1 restores ws-org-1 as startup default
    const user1State = workspaceReducer(
      state,
      setWorkspaces({ workspaces: [mockPersonal, mockOrg], userId: "user-1" })
    )
    expect(user1State.activeWorkspace?.id).toBe("ws-org-1")

    // Re-login as user-2 on same browser does not inherit user-1's preference
    localStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY)
    const user2State = workspaceReducer(
      undefined,
      setWorkspaces({ workspaces: [mockPersonal, mockOrg], userId: "user-2" })
    )
    expect(user2State.activeWorkspace?.id).toBe("ws-personal-1")
  })

  it("should fall back to personal workspace when a saved default workspace ID is no longer accessible", () => {
    let state = workspaceReducer(
      undefined,
      setDefaultWorkspacePreference({
        preference: "ws-removed-org",
        userId: "user-1",
      })
    )
    state = workspaceReducer(
      state,
      setWorkspaces({ workspaces: [mockOrg, mockPersonal], userId: "user-1" })
    )
    expect(state.activeWorkspace?.id).toBe("ws-personal-1")
  })
})
