import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import workspaceReducer from "../slice/workspaceSlice"
import authReducer from "@/features/auth/slice/authSlice"
import { SidebarProvider } from "@/components/ui/sidebar"
import { WorkspaceSwitcher } from "./WorkspaceSwitcher"
import AcceptInvitationPage from "@/pages/public/AcceptInvitationPage"
import type { Workspace } from "../types/workspace.types"

// Mock the hooks
vi.mock("../hooks/useWorkspaces", () => {
  return {
    useWorkspacesQuery: vi.fn(),
    useSwitchWorkspace: vi.fn(),
    useAcceptInvitationMutation: vi.fn(),
    useCreateOrganizationMutation: vi.fn(() => ({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    })),
  }
})

import {
  useWorkspacesQuery,
  useSwitchWorkspace,
  useAcceptInvitationMutation,
} from "../hooks/useWorkspaces"

describe("Workspace Components", () => {
  let queryClient: QueryClient

  const mockWorkspaces: Workspace[] = [
    {
      id: "ws-personal",
      name: "Personal Workspace",
      workspaceType: "PERSONAL",
      status: "ACTIVE",
      ownerId: "user-1",
      ownerName: "Dev User",
      currentUserRole: "OWNER",
      memberCount: 1,
      projectCount: 3,
      createdAt: "2026-10-28T10:00:00Z",
      updatedAt: "2026-10-28T10:00:00Z",
    },
    {
      id: "ws-org",
      name: "InnovateTech Org",
      workspaceType: "ORGANIZATION",
      status: "ACTIVE",
      ownerId: "user-1",
      ownerName: "Dev User",
      currentUserRole: "ADMIN",
      memberCount: 6,
      projectCount: 12,
      createdAt: "2026-10-28T10:00:00Z",
      updatedAt: "2026-10-28T10:00:00Z",
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  function createTestStore(
    activeWorkspace: Workspace | null = mockWorkspaces[0],
    isAuthenticated = true
  ) {
    return configureStore({
      reducer: {
        workspaces: workspaceReducer,
        auth: authReducer,
      },
      preloadedState: {
        workspaces: {
          workspaces: mockWorkspaces,
          activeWorkspace,
          isLoading: false,
          error: null,
        },
        auth: {
          isAuthenticated,
          user: isAuthenticated
            ? ({
                id: "user-1",
                email: "test@example.com",
                firstName: "Dev",
                lastName: "User",
                user_role: "ADMIN",
              } as any)
            : null,
          token: null,
          isLoading: false,
          error: null,
        },
      },
    })
  }

  describe("WorkspaceSwitcher", () => {
    it("renders active workspace details and switcher trigger", () => {
      vi.mocked(useWorkspacesQuery).mockReturnValue({
        data: mockWorkspaces,
        isLoading: false,
      } as any)
      const mockSwitch = vi.fn()
      vi.mocked(useSwitchWorkspace).mockReturnValue(mockSwitch)

      const store = createTestStore(mockWorkspaces[0])

      render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter>
              <SidebarProvider>
                <WorkspaceSwitcher />
              </SidebarProvider>
            </MemoryRouter>
          </QueryClientProvider>
        </Provider>
      )

      expect(screen.getByText("Personal Workspace")).toBeInTheDocument()
      expect(screen.getByText("Personal")).toBeInTheDocument()
    })

    it("displays organization badge when organization workspace is active", () => {
      vi.mocked(useWorkspacesQuery).mockReturnValue({
        data: mockWorkspaces,
        isLoading: false,
      } as any)
      const mockSwitch = vi.fn()
      vi.mocked(useSwitchWorkspace).mockReturnValue(mockSwitch)

      const store = createTestStore(mockWorkspaces[1])

      render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter>
              <SidebarProvider>
                <WorkspaceSwitcher />
              </SidebarProvider>
            </MemoryRouter>
          </QueryClientProvider>
        </Provider>
      )

      expect(screen.getByText("InnovateTech Org")).toBeInTheDocument()
      expect(screen.getByText("Organization")).toBeInTheDocument()
      expect(screen.getByText("ADMIN")).toBeInTheDocument()
    })
  })

  describe("AcceptInvitationPage", () => {
    it("renders invalid invitation warning when no token is in URL", () => {
      vi.mocked(useAcceptInvitationMutation).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        isSuccess: false,
        error: null,
      } as any)

      const store = createTestStore(null, false)

      render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={["/invite/accept"]}>
              <AcceptInvitationPage />
            </MemoryRouter>
          </QueryClientProvider>
        </Provider>
      )

      expect(screen.getByText("Invalid Invitation")).toBeInTheDocument()
      expect(screen.getByText(/No invitation token was found/i)).toBeInTheDocument()
    })

    it("renders invitation acceptance prompt when token is present", () => {
      const mockMutate = vi.fn()
      vi.mocked(useAcceptInvitationMutation).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isSuccess: false,
        error: null,
      } as any)

      const store = createTestStore()

      render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={["/invite/accept?token=valid-invite-token"]}>
              <AcceptInvitationPage />
            </MemoryRouter>
          </QueryClientProvider>
        </Provider>
      )

      expect(screen.getByText("Workspace Invitation")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /accept & join workspace/i })).toBeInTheDocument()

      fireEvent.click(screen.getByRole("button", { name: /accept & join workspace/i }))
      expect(mockMutate).toHaveBeenCalledWith(
        { token: "valid-invite-token" },
        expect.any(Object)
      )
    })
  })
})
