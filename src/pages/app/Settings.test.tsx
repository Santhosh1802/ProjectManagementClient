import { describe, it, expect, beforeEach } from "vitest"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { MemoryRouter } from "react-router-dom"
import themeReducer from "@/app/slice/themeSlice"
import authReducer from "@/features/auth/slice/authSlice"
import workspaceReducer, {
  getDefaultWorkspaceStorageKey,
} from "@/features/workspaces/slice/workspaceSlice"
import type { Workspace } from "@/features/workspaces/types/workspace.types"
import Settings from "./Settings"

function renderSettings() {
  const store = configureStore({
    reducer: { theme: themeReducer },
  })
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    </Provider>
  )
}

const mockPersonal: Workspace = {
  id: "ws-personal",
  name: "Personal Workspace",
  workspaceType: "PERSONAL",
  status: "ACTIVE",
  ownerId: "user-1",
  ownerName: "Dev User",
  currentUserRole: "OWNER",
  memberCount: 1,
  projectCount: 2,
  createdAt: "2026-10-28T10:00:00Z",
  updatedAt: "2026-10-28T10:00:00Z",
}

const mockOrg: Workspace = {
  id: "ws-org",
  name: "Acme Organization",
  workspaceType: "ORGANIZATION",
  status: "ACTIVE",
  ownerId: "user-1",
  ownerName: "Dev User",
  currentUserRole: "OWNER",
  memberCount: 5,
  projectCount: 7,
  createdAt: "2026-10-28T11:00:00Z",
  updatedAt: "2026-10-28T11:00:00Z",
}

describe("Settings Page", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("renders upgraded settings navigation and switches across appearance, whiteboard, accessibility, and workspace tabs", () => {
    renderSettings()

    expect(screen.getByText("Settings")).toBeInTheDocument()
    expect(screen.getByText("Interface Mode")).toBeInTheDocument()
    expect(screen.getByText("Dual Color Theme")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Violet \+ Blue/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Whiteboard/i }))
    expect(screen.getByText("Whiteboard Studio Preferences")).toBeInTheDocument()
    expect(screen.getByText("Auto-Save & Broadcast")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Accessibility/i }))
    expect(screen.getByText("Accessibility & Readability")).toBeInTheDocument()
    expect(screen.getByText("High Contrast Mode")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Workspace/i }))
    expect(screen.getByText("Profile & Security")).toBeInTheDocument()
    expect(screen.getByText("Organization & Plan")).toBeInTheDocument()
  })

  it("allows selecting organization as default startup workspace and switching to it", () => {
    const store = configureStore({
      reducer: {
        theme: themeReducer,
        auth: authReducer,
        workspaces: workspaceReducer,
      },
      preloadedState: {
        auth: {
          isAuthenticated: true,
          isLoading: false,
          user: {
            id: "user-1",
            firstName: "Dev",
            lastName: "User",
            email: "dev@example.com",
            user_role: "USER",
          },
        },
        workspaces: {
          workspaces: [mockPersonal, mockOrg],
          activeWorkspace: mockPersonal,
          defaultWorkspacePreference: null,
          isLoading: false,
          error: null,
        },
      },
    })

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/app/settings?tab=workspace"]}>
          <Settings />
        </MemoryRouter>
      </Provider>
    )

    expect(screen.getByText("Default Startup Workspace")).toBeInTheDocument()

    // Select Organization First mode
    fireEvent.click(screen.getByRole("button", { name: /Organization First/i }))
    expect(store.getState().workspaces.defaultWorkspacePreference).toBe(
      "AUTO_ORGANIZATION"
    )
    expect(localStorage.getItem(getDefaultWorkspaceStorageKey("user-1"))).toBe(
      "AUTO_ORGANIZATION"
    )

    // Select the specific Acme Organization workspace
    const orgOption = screen.getByRole("button", { name: /Acme Organization/i })
    fireEvent.click(orgOption)
    expect(store.getState().workspaces.defaultWorkspacePreference).toBe("ws-org")
    expect(within(orgOption).getByText("Default")).toBeInTheDocument()

    // Switch active workspace to the selected default now
    fireEvent.click(
      screen.getByRole("button", { name: /Switch to Default Now/i })
    )
    expect(store.getState().workspaces.activeWorkspace?.id).toBe("ws-org")
  })
})
