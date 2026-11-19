import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, screen } from "@testing-library/react"
import SuperAdminPage from "./SuperAdminPage"
import * as superAdminQueries from "@/features/superadmin/hooks/useSuperAdminQuery"
import { renderWithProviders } from "@/test/testUtils"

vi.mock("@/features/superadmin/hooks/useSuperAdminQuery", () => ({
  usePlatformOverviewQuery: vi.fn(),
  useSuperAdminWorkspacesQuery: vi.fn(),
  useSuperAdminUsersQuery: vi.fn(),
  useSuperAdminAuditLogsQuery: vi.fn(),
  useSuperAdminAccessPolicyQuery: vi.fn(),
  useUpdateWorkspaceStatusMutation: vi.fn(),
  useUpdateWorkspacePlanMutation: vi.fn(),
  useUpdateUserRoleMutation: vi.fn(),
  useUpdateUserStatusMutation: vi.fn(),
  useVerifyUserEmailMutation: vi.fn(),
  useUpdateAccessPolicyMutation: vi.fn(),
  useResetAccessPolicyMutation: vi.fn(),
}))

const defaultPolicy = {
  allowUserDirectorySearch: true,
  allowPersonalWorkspaceProjectMembers: true,
  autoEnrollProjectMembersIntoOrg: true,
  orgAdminCanManageAllProjects: true,
  orgMemberCanCreateProjects: true,
  orgMemberCanCreateChatGroups: true,
  projectManagerCanManageMembers: true,
  projectManagerCanEditProject: true,
  projectMemberCanCreateTasks: true,
  projectMemberCanAssignTasks: false,
  freeMaxProjects: 3,
  freeMaxMembers: 5,
  freeMaxWorkflowRules: 3,
  proMaxProjects: 25,
  proMaxMembers: 50,
  proMaxWorkflowRules: 25,
  enterpriseMaxProjects: -1,
  enterpriseMaxMembers: -1,
  enterpriseMaxWorkflowRules: -1,
  maxProjectStorageMb: 50,
}

describe("SuperAdminPage", () => {
  const updatePolicyMutate = vi.fn()
  const resetPolicyMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(superAdminQueries.usePlatformOverviewQuery).mockReturnValue({
      isLoading: false,
      refetch: vi.fn(),
      data: {
        totalUsers: 42,
        activeUsers: 40,
        verifiedUsers: 39,
        totalWorkspaces: 12,
        organizationWorkspaces: 5,
        personalWorkspaces: 7,
        activeWorkspaces: 11,
        suspendedWorkspaces: 1,
        totalProjects: 28,
        totalTasks: 194,
        totalWorkflowExecutions: 63,
        kafkaStatus: {
          enabled: true,
          bootstrapServers: "localhost:9092",
          domainEventsTopic: "pm.domain.events",
          dlqTopic: "pm.domain.events.dlq",
          publishedCount: 150,
          consumedCount: 149,
          failedCount: 0,
          lastPublishedAt: null,
          lastConsumedAt: null,
          lastError: null,
        },
      },
    } as unknown as ReturnType<typeof superAdminQueries.usePlatformOverviewQuery>)

    vi.mocked(superAdminQueries.useSuperAdminWorkspacesQuery).mockReturnValue({
      isLoading: false,
      refetch: vi.fn(),
      data: {
        content: [
          {
            id: "ws-1",
            name: "Acme Org",
            workspaceType: "ORGANIZATION",
            planTier: "PRO",
            ownerName: "Alice",
            ownerEmail: "alice@acme.com",
            memberCount: 10,
            maxMembers: 50,
            projectCount: 4,
            maxProjects: 25,
            status: "ACTIVE",
          },
        ],
        page: 0,
        size: 15,
        totalElements: 35,
        totalPages: 3,
        first: true,
        last: false,
      },
    } as unknown as ReturnType<typeof superAdminQueries.useSuperAdminWorkspacesQuery>)

    vi.mocked(superAdminQueries.useSuperAdminUsersQuery).mockReturnValue({
      isLoading: false,
      refetch: vi.fn(),
      data: {
        content: [
          {
            id: "u-2",
            firstName: "Bob",
            lastName: "Dev",
            email: "bob@example.com",
            userRole: "USER",
            isActive: true,
            emailVerified: true,
          },
        ],
        page: 0,
        size: 15,
        totalElements: 32,
        totalPages: 3,
        first: true,
        last: false,
      },
    } as unknown as ReturnType<typeof superAdminQueries.useSuperAdminUsersQuery>)

    vi.mocked(superAdminQueries.useSuperAdminAuditLogsQuery).mockReturnValue({
      isLoading: false,
      refetch: vi.fn(),
      data: {
        content: [
          {
            id: "log-1",
            actorName: "Super Admin",
            actorEmail: "superadmin@devflow.app",
            actionType: "POLICY_UPDATED",
            details: "Updated project storage limit",
            createdAt: new Date().toISOString(),
          },
        ],
        page: 0,
        size: 20,
        totalElements: 45,
        totalPages: 3,
        first: true,
        last: false,
      },
    } as unknown as ReturnType<typeof superAdminQueries.useSuperAdminAuditLogsQuery>)

    vi.mocked(superAdminQueries.useSuperAdminAccessPolicyQuery).mockReturnValue({
      isLoading: false,
      refetch: vi.fn(),
      data: defaultPolicy,
    } as unknown as ReturnType<typeof superAdminQueries.useSuperAdminAccessPolicyQuery>)

    const noopMutation = { mutate: vi.fn(), isPending: false }
    vi.mocked(superAdminQueries.useUpdateWorkspaceStatusMutation).mockReturnValue(
      noopMutation as unknown as ReturnType<typeof superAdminQueries.useUpdateWorkspaceStatusMutation>
    )
    vi.mocked(superAdminQueries.useUpdateWorkspacePlanMutation).mockReturnValue(
      noopMutation as unknown as ReturnType<typeof superAdminQueries.useUpdateWorkspacePlanMutation>
    )
    vi.mocked(superAdminQueries.useUpdateUserRoleMutation).mockReturnValue(
      noopMutation as unknown as ReturnType<typeof superAdminQueries.useUpdateUserRoleMutation>
    )
    vi.mocked(superAdminQueries.useUpdateUserStatusMutation).mockReturnValue(
      noopMutation as unknown as ReturnType<typeof superAdminQueries.useUpdateUserStatusMutation>
    )
    vi.mocked(superAdminQueries.useVerifyUserEmailMutation).mockReturnValue(
      noopMutation as unknown as ReturnType<typeof superAdminQueries.useVerifyUserEmailMutation>
    )
    vi.mocked(superAdminQueries.useUpdateAccessPolicyMutation).mockReturnValue({
      mutate: updatePolicyMutate,
      isPending: false,
    } as unknown as ReturnType<typeof superAdminQueries.useUpdateAccessPolicyMutation>)
    vi.mocked(superAdminQueries.useResetAccessPolicyMutation).mockReturnValue({
      mutate: resetPolicyMutate,
      isPending: false,
    } as unknown as ReturnType<typeof superAdminQueries.useResetAccessPolicyMutation>)
  })

  function renderSuperAdmin() {
    return renderWithProviders(<SuperAdminPage />, {
      preloadedState: {
        auth: {
          user: {
            id: "sa-1",
            email: "superadmin@devflow.app",
            firstName: "Super",
            lastName: "Admin",
            user_role: "SUPER_ADMIN",
          },
          isAuthenticated: true,
          isLoading: false,
        },
      },
    })
  }

  it("renders platform overview KPIs, Kafka pipeline telemetry, and saves centralized Access Control & Storage Quota", () => {
    renderSuperAdmin()

    expect(screen.getByText("Super Admin Console")).toBeInTheDocument()
    expect(screen.getByText("42")).toBeInTheDocument()
    expect(screen.getByText("Kafka Enabled")).toBeInTheDocument()
    expect(screen.getByText("pm.domain.events")).toBeInTheDocument()
    expect(screen.getByText("150 / 149")).toBeInTheDocument()

    // Switch to centralized Access Control & Plans tab
    fireEvent.click(screen.getByRole("tab", { name: /Access Control & Plans/i }))
    expect(
      screen.getByText("Centralized Access Control & Plan Governance")
    ).toBeInTheDocument()
    expect(
      screen.getByText("Allow User Directory Search (/api/users/all)")
    ).toBeInTheDocument()

    const storageInput = document.getElementById(
      "quota-project-storage-mb"
    ) as HTMLInputElement
    expect(storageInput).toHaveValue(50)
    fireEvent.change(storageInput, { target: { value: "120" } })

    fireEvent.click(screen.getByRole("button", { name: /Save Policy & Quotas/i }))
    expect(updatePolicyMutate).toHaveBeenCalledWith(
      expect.objectContaining({ maxProjectStorageMb: 120 }),
      expect.any(Object)
    )

    fireEvent.click(screen.getByRole("button", { name: /Reset Defaults/i }))
    expect(resetPolicyMutate).toHaveBeenCalled()
  })

  it("renders unified DataPagination across Workspaces, Users & Roles, and Audit Logs tabs", () => {
    renderSuperAdmin()

    // Workspaces tab
    fireEvent.click(screen.getByRole("tab", { name: /Workspaces/i }))
    expect(screen.getByText("Acme Org")).toBeInTheDocument()
    expect(screen.getByText("1–15")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }))
    expect(superAdminQueries.useSuperAdminWorkspacesQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1 })
    )

    // Users & Roles tab
    fireEvent.click(screen.getByRole("tab", { name: /Users & Roles/i }))
    expect(screen.getByText("Bob Dev")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }))
    expect(superAdminQueries.useSuperAdminUsersQuery).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1 })
    )

    // Audit Logs tab
    fireEvent.click(screen.getByRole("tab", { name: /Audit Logs/i }))
    expect(screen.getByText("Updated project storage limit")).toBeInTheDocument()
    expect(screen.getByText("1–20")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }))
    expect(superAdminQueries.useSuperAdminAuditLogsQuery).toHaveBeenLastCalledWith(
      1,
      20
    )
  })
})
