import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import { QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import ProjectMembersPage from "./ProjectMembersPage"
import * as projectService from "@/features/projects/services/projects.services"
import * as memberService from "@/features/projects/services/project.members.service"
import * as usersService from "@/features/users/services/users.service"
import { createTestQueryClient, createTestStore } from "@/test/testUtils"

vi.mock("@/features/projects/services/projects.services", () => ({
  getProjectById: vi.fn(),
}))

vi.mock("@/features/projects/services/project.members.service", () => ({
  getProjectMembers: vi.fn(),
  createProjectMember: vi.fn(),
  updateProjectMemberRole: vi.fn(),
  deleteProjectMember: vi.fn(),
}))

vi.mock("@/features/users/services/users.service", () => ({
  searchUsers: vi.fn(),
}))

const mockProject = {
  id: "proj-1",
  name: "Core Platform",
  description: "API rewrite",
  projectStatus: "ACTIVE" as const,
  startDate: "2026-01-01T00:00:00Z",
  dueDate: "2026-12-31T00:00:00Z",
  owner: {
    id: "u-owner",
    firstName: "Alice",
    lastName: "Owner",
    email: "alice@example.com",
  },
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
}

function makeMemberUser(
  id: string,
  firstName: string,
  lastName: string,
  email: string
) {
  const nowIso = new Date().toISOString()
  return {
    id,
    firstName,
    lastName,
    email,
    userRole: "USER",
    isActive: true,
    emailVerified: true,
    createdAt: nowIso,
    updatedAt: nowIso,
    lastLoginAt: null,
  }
}

const mockMembers = [
  {
    id: "pm-1",
    projectRole: "MANAGER" as const,
    project: mockProject,
    user: makeMemberUser("u-owner", "Alice", "Owner", "alice@example.com"),
    joinedAt: new Date().toISOString(),
  },
  {
    id: "pm-2",
    projectRole: "MEMBER" as const,
    project: mockProject,
    user: makeMemberUser("u-dev", "Bob", "Developer", "bob@example.com"),
    joinedAt: new Date().toISOString(),
  },
]

describe("ProjectMembersPage Permissions, Member Directory Search & Pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject)
    vi.mocked(memberService.getProjectMembers).mockResolvedValue({
      content: mockMembers,
      page: 0,
      size: 10,
      totalElements: 15,
      totalPages: 2,
      first: true,
      last: false,
    })
    vi.mocked(usersService.searchUsers).mockResolvedValue({
      content: [
        {
          id: "u-new",
          firstName: "Charlie",
          lastName: "Tester",
          email: "charlie@example.com",
          userRole: "USER",
          isActive: true,
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: null,
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    })
  })

  function renderPage(userId = "u-owner", userRole = "USER") {
    const store = createTestStore({
      auth: {
        user: {
          id: userId,
          firstName: "Alice",
          lastName: "Owner",
          email: "alice@example.com",
          user_role: userRole,
        },
        isAuthenticated: true,
        isLoading: false,
      },
    })
    const queryClient = createTestQueryClient()
    return render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={["/app/projects/proj-1/members"]}>
            <Routes>
              <Route
                path="/app/projects/:projectId/members"
                element={<ProjectMembersPage />}
              />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </Provider>
    )
  }

  it("allows regular USER who owns project to search user directory, add a member, and paginate members", async () => {
    vi.mocked(memberService.createProjectMember).mockResolvedValueOnce({
      id: "pm-3",
      projectRole: "MEMBER",
      project: mockProject,
      user: makeMemberUser("u-new", "Charlie", "Tester", "charlie@example.com"),
      joinedAt: new Date().toISOString(),
    })

    renderPage("u-owner", "USER")

    expect(await screen.findByText("Bob Developer")).toBeInTheDocument()
    expect(screen.getByText("1–10")).toBeInTheDocument()
    expect(screen.getAllByText(/members/i).length).toBeGreaterThanOrEqual(1)

    // Filter existing members client-side
    fireEvent.change(screen.getByLabelText("Search members"), {
      target: { value: "Bob" },
    })
    expect(screen.getByText("Bob Developer")).toBeInTheDocument()
    expect(screen.queryByText("Alice Owner")).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText("Search members"), {
      target: { value: "" },
    })

    // Open Add member modal
    fireEvent.click(screen.getByRole("button", { name: /Add member/i }))

    const candidateBtn = await screen.findByRole(
      "button",
      {
        name: /Charlie Tester/i,
      },
      { timeout: 5000 }
    )
    fireEvent.click(candidateBtn)

    const confirmButtons = screen.getAllByRole("button", { name: /Add member/i })
    fireEvent.click(confirmButtons[confirmButtons.length - 1])

    await waitFor(() => {
      expect(memberService.createProjectMember).toHaveBeenCalledWith({
        projectId: "proj-1",
        projectMemberId: "u-new",
        projectRole: "MEMBER",
      })
    })
  })

  it("hides Add member button and management actions for regular project MEMBER", async () => {
    renderPage("u-dev", "USER")

    expect(await screen.findByText("Bob Developer")).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /Add member/i })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /Manage Bob Developer/i })
    ).not.toBeInTheDocument()
  })
})
