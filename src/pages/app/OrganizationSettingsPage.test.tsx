import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import OrganizationSettingsPage from "./OrganizationSettingsPage"
import * as workspaceHooks from "@/features/workspaces/hooks/useWorkspaces"
import { renderWithProviders } from "@/test/testUtils"
import type { Workspace, WorkspaceMember } from "@/features/workspaces/types/workspace.types"

vi.mock("@/features/workspaces/hooks/useWorkspaces", () => ({
  useWorkspaceMembersQuery: vi.fn(),
  useUpdateWorkspaceMutation: vi.fn(),
  useUpdateMemberRoleMutation: vi.fn(),
  useRemoveMemberMutation: vi.fn(),
  useInviteMemberMutation: vi.fn(),
  useTransferOwnershipMutation: vi.fn(),
}))

const orgMembers: WorkspaceMember[] = Array.from({ length: 12 }, (_, idx) => ({
  id: `wm-${idx + 1}`,
  userId: `u-${idx + 1}`,
  firstName: `Member`,
  lastName: `Number${idx + 1}`,
  email: `member${idx + 1}@acme.org`,
  role: idx === 0 ? "OWNER" : idx === 1 ? "ADMIN" : "MEMBER",
  status: "ACTIVE",
  joinedAt: "2026-01-15T10:00:00Z",
}))

const orgWorkspace: Workspace = {
  id: "ws-org",
  name: "Acme Engineering",
  workspaceType: "ORGANIZATION",
  ownerId: "u-1",
  ownerName: "Owner User",
  status: "ACTIVE",
  planTier: "PRO",
  memberCount: 12,
  projectCount: 7,
  maxProjects: 25,
  maxMembers: 50,
  currentUserRole: "OWNER",
  createdAt: new Date().toISOString(),
}

describe("OrganizationSettingsPage Members Pagination, Quotas & Governance", () => {
  const updateWsMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(workspaceHooks.useWorkspaceMembersQuery).mockReturnValue({
      data: orgMembers,
      isLoading: false,
    } as unknown as ReturnType<typeof workspaceHooks.useWorkspaceMembersQuery>)

    vi.mocked(workspaceHooks.useUpdateWorkspaceMutation).mockReturnValue({
      mutate: updateWsMutate,
      isPending: false,
    } as unknown as ReturnType<typeof workspaceHooks.useUpdateWorkspaceMutation>)

    vi.mocked(workspaceHooks.useUpdateMemberRoleMutation).mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof workspaceHooks.useUpdateMemberRoleMutation>)

    vi.mocked(workspaceHooks.useRemoveMemberMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof workspaceHooks.useRemoveMemberMutation>)

    vi.mocked(workspaceHooks.useInviteMemberMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof workspaceHooks.useInviteMemberMutation>)

    vi.mocked(workspaceHooks.useTransferOwnershipMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof workspaceHooks.useTransferOwnershipMutation>)
  })

  it("renders Personal Workspace empty state when active workspace is PERSONAL", () => {
    renderWithProviders(<OrganizationSettingsPage />, {
      preloadedState: {
        auth: {
          user: {
            id: "u-1",
            firstName: "Alice",
            lastName: "Dev",
            email: "alice@example.com",
            user_role: "USER",
          },
          isAuthenticated: true,
          isLoading: false,
        },
        workspaces: {
          workspaces: [],
          activeWorkspace: {
            ...orgWorkspace,
            id: "ws-personal",
            workspaceType: "PERSONAL",
          },
          isLoading: false,
          error: null,
        },
      },
    })

    expect(screen.getByText("Personal Workspace Active")).toBeInTheDocument()
  })

  it("paginates 12 organization members (10 per page), filters by search, and allows OWNER settings update", async () => {
    renderWithProviders(<OrganizationSettingsPage />, {
      preloadedState: {
        auth: {
          user: {
            id: "u-1",
            firstName: "Member",
            lastName: "Number1",
            email: "member1@acme.org",
            user_role: "USER",
          },
          isAuthenticated: true,
          isLoading: false,
        },
        workspaces: {
          workspaces: [orgWorkspace],
          activeWorkspace: orgWorkspace,
          isLoading: false,
          error: null,
        },
      },
    })

    expect(screen.getByText("Acme Engineering")).toBeInTheDocument()
    expect(screen.getByText("Members (12)")).toBeInTheDocument()
    expect(screen.getByText("Member Number1")).toBeInTheDocument()
    expect(screen.queryByText("Member Number11")).not.toBeInTheDocument()
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()

    // Navigate to page 2 -> Members 11-12 visible
    fireEvent.click(screen.getByRole("button", { name: /Next/i }))
    expect(screen.getByText("Member Number11")).toBeInTheDocument()
    expect(screen.getByText("Member Number12")).toBeInTheDocument()

    // Search filters across all members and resets to page 1
    fireEvent.change(screen.getByLabelText("Search organization members"), {
      target: { value: "Number12" },
    })
    expect(screen.getByText("Member Number12")).toBeInTheDocument()
    expect(screen.queryByText("Member Number1")).not.toBeInTheDocument()

    // Switch to General Settings tab
    fireEvent.click(screen.getByRole("tab", { name: /General Settings/i }))
    expect(screen.getByText("PRO Plan")).toBeInTheDocument()
    expect(screen.getByText("Transfer Organization Ownership")).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText("Organization Name"), {
      target: { value: "Acme Global" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }))

    await waitFor(() => {
      expect(updateWsMutate).toHaveBeenCalledWith({ name: "Acme Global" })
    })
  })

  it("hides Invite Member and Transfer Ownership actions for regular MEMBER role", () => {
    renderWithProviders(<OrganizationSettingsPage />, {
      preloadedState: {
        auth: {
          user: {
            id: "u-3",
            firstName: "Member",
            lastName: "Number3",
            email: "member3@acme.org",
            user_role: "USER",
          },
          isAuthenticated: true,
          isLoading: false,
        },
        workspaces: {
          workspaces: [],
          activeWorkspace: {
            ...orgWorkspace,
            currentUserRole: "MEMBER",
          },
          isLoading: false,
          error: null,
        },
      },
    })

    expect(
      screen.queryByRole("button", { name: /Invite Member/i })
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("tab", { name: /General Settings/i }))
    expect(
      screen.queryByText("Transfer Organization Ownership")
    ).not.toBeInTheDocument()
  })
})
