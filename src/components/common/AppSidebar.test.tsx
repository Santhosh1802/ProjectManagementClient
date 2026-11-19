import { describe, it, expect, vi } from "vitest"
import { fireEvent, screen } from "@testing-library/react"
import AppSidebar from "./AppSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { renderWithProviders } from "@/test/testUtils"

vi.mock("@/features/notifications/hooks/useNotificationsQuery", () => ({
  useUnreadNotificationsCountQuery: vi.fn(() => ({ data: 5 })),
}))

vi.mock("@/features/workspaces/components/WorkspaceSwitcher", () => ({
  WorkspaceSwitcher: () => <div data-testid="workspace-switcher-stub" />,
}))

vi.mock("@/context/KeyboardShortcutsContext", () => ({
  useKeyboardShortcutsUI: () => ({ openShortcuts: vi.fn() }),
}))

vi.mock("@/features/auth/services/auth.service", () => ({
  LogoutUser: vi.fn(async () => ({})),
}))

describe("AppSidebar Navigation & Submenus", () => {
  it("renders collapsible submenus, unread badge, and hides individual project items", () => {
    renderWithProviders(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>,
      {
        route: "/app/dashboard",
        preloadedState: {
          auth: {
            user: {
              id: "u-1",
              firstName: "Regular",
              lastName: "Member",
              email: "member@example.com",
              user_role: "USER",
            },
            isAuthenticated: true,
            isLoading: false,
          },
          project: {
            projects: [
              {
                id: "p-secret",
                name: "Unlisted Sidebar Project Alpha",
                description: "",
                projectStatus: "ACTIVE",
                startDate: "2026-01-01T00:00:00Z",
                dueDate: "2026-12-31T00:00:00Z",
                owner: {
                  id: "u-1",
                  firstName: "Regular",
                  lastName: "Member",
                  email: "member@example.com",
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
            selectedProject: null,
            page: 0,
            size: 10,
            totalElements: 1,
            totalPages: 1,
            first: true,
            last: true,
            loading: false,
            error: null,
          },
          workspaces: {
            workspaces: [],
            activeWorkspace: {
              id: "ws-personal",
              name: "Personal Workspace",
              workspaceType: "PERSONAL",
              ownerId: "u-1",
              ownerName: "Regular Member",
              status: "ACTIVE",
              planTier: "FREE",
              memberCount: 1,
              projectCount: 1,
              maxProjects: 3,
              maxMembers: 5,
              currentUserRole: "OWNER",
              createdAt: new Date().toISOString(),
            },
            isLoading: false,
            error: null,
          },
        },
      }
    )

    // Primary nav links and unread count
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Projects")).toBeInTheDocument()
    expect(screen.getByText("All Projects")).toBeInTheDocument()
    expect(screen.getByText("Create Project")).toBeInTheDocument()
    expect(screen.getByText("All Tasks")).toBeInTheDocument()
    expect(screen.getByText("Create Task")).toBeInTheDocument()
    expect(screen.getByText("Team Chat")).toBeInTheDocument()
    expect(screen.getByText("5")).toBeInTheDocument()

    // Projects must NOT be enumerated in the sidebar
    expect(
      screen.queryByText("Unlisted Sidebar Project Alpha")
    ).not.toBeInTheDocument()

    // Regular USER + PERSONAL workspace must NOT see admin / organization links
    expect(screen.queryByText("Organization")).not.toBeInTheDocument()
    expect(screen.queryByText("Super Admin")).not.toBeInTheDocument()
    expect(screen.queryByText("Users & Directory")).not.toBeInTheDocument()

    // Toggle Projects submenu collapse/expand
    const toggleBtn = screen.getByRole("button", {
      name: "Toggle Projects submenu",
    })
    expect(toggleBtn).toHaveAttribute("aria-expanded", "true")
    fireEvent.click(toggleBtn)
    expect(screen.queryByText("All Projects")).not.toBeInTheDocument()
    fireEvent.click(toggleBtn)
    expect(screen.getByText("All Projects")).toBeInTheDocument()
  })

  it("shows Organization, Super Admin submenus, and Users & Directory for SUPER_ADMIN in Organization workspace", () => {
    renderWithProviders(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>,
      {
        route: "/app/super-admin",
        preloadedState: {
          auth: {
            user: {
              id: "sa-1",
              firstName: "Super",
              lastName: "Admin",
              email: "sa@example.com",
              user_role: "SUPER_ADMIN",
            },
            isAuthenticated: true,
            isLoading: false,
          },
          workspaces: {
            workspaces: [],
            activeWorkspace: {
              id: "ws-org",
              name: "Acme Org",
              workspaceType: "ORGANIZATION",
              ownerId: "u-sa",
              ownerName: "Super Admin",
              status: "ACTIVE",
              planTier: "ENTERPRISE",
              memberCount: 20,
              projectCount: 10,
              maxProjects: -1,
              maxMembers: -1,
              currentUserRole: "OWNER",
              createdAt: new Date().toISOString(),
            },
            isLoading: false,
            error: null,
          },
        },
      }
    )

    expect(screen.getByText("Organization")).toBeInTheDocument()
    expect(screen.getAllByText("Super Admin").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Platform Overview")).toBeInTheDocument()
    expect(screen.getByText("Access Control & Plans")).toBeInTheDocument()
    expect(screen.getByText("Audit Logs")).toBeInTheDocument()
    expect(screen.getByText("Users & Directory")).toBeInTheDocument()
    expect(screen.getByText("Platform Overview").parentElement).toHaveTextContent("GA")
    expect(screen.getByText("Organization").parentElement).toHaveTextContent("GO")
    expect(screen.getByText("Whiteboards").parentElement).toHaveTextContent("GW")
    expect(screen.getByText("Notifications").parentElement).toHaveTextContent("GN")
  })
})
