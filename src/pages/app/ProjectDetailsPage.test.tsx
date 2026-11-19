import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import ProjectDetailsPage from "./ProjectDetailsPage"
import * as projectHooks from "@/features/projects/hooks/useProjectsQuery"
import * as taskHooks from "@/features/tasks/hooks/useTasksQuery"
import { createTestQueryClient, createTestStore } from "@/test/testUtils"

vi.mock("@/features/projects/hooks/useProjectsQuery", () => ({
  useProjectDetailQuery: vi.fn(),
  useProjectMembersQuery: vi.fn(),
  useUpdateProjectOwnerMutation: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteProjectMutation: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}))

vi.mock("@/features/tasks/hooks/useTasksQuery", () => ({
  useTasksByProjectQuery: vi.fn(),
}))

vi.mock("@/features/projects/components/ProjectStorageSection", () => ({
  ProjectStorageSection: () => (
    <div data-testid="project-storage-section">Storage Quota Widget</div>
  ),
}))

vi.mock("@/features/workflow/components/WorkflowRulesList", () => ({
  WorkflowRulesList: () => (
    <div data-testid="workflow-rules-section">Workflow Rules Widget</div>
  ),
}))

vi.mock("@/features/tasks/components/TeamWorkloadPlanningView", () => ({
  default: () => (
    <div data-testid="team-workload-section">Team Workload Widget</div>
  ),
}))

vi.mock("@/features/projects/components/EditProjectModel", () => ({
  default: () => null,
}))

const mockProject = {
  id: "proj-1",
  name: "Enterprise Portal",
  description: "Full SaaS rebuild",
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

describe("ProjectDetailsPage Sections, Pagination & RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectHooks.useProjectDetailQuery).mockReturnValue({
      data: mockProject,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof projectHooks.useProjectDetailQuery>)

    vi.mocked(projectHooks.useProjectMembersQuery).mockReturnValue({
      data: {
        content: [
          {
            id: "pm-1",
            projectRole: "MEMBER",
            user: {
              id: "u-mem",
              firstName: "Bob",
              lastName: "Mem",
              email: "bob@example.com",
              userRole: "USER",
              isActive: true,
            },
            createdAt: new Date().toISOString(),
          },
        ],
        page: 0,
        size: 10,
        totalElements: 18,
        totalPages: 2,
        first: true,
        last: false,
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof projectHooks.useProjectMembersQuery>)

    vi.mocked(taskHooks.useTasksByProjectQuery).mockReturnValue({
      data: {
        content: [
          {
            id: "t-1",
            title: "Build Auth API",
            description: "JWT setup",
            taskStatus: "IN_PROGRESS",
            taskPriority: "HIGH",
            dueDate: null,
            project: mockProject,
            assignedTo: {
              id: "u-mem",
              firstName: "Bob",
              lastName: "Mem",
              email: "bob@example.com",
              userRole: "USER",
            },
            createdBy: {
              id: "u-owner",
              firstName: "Alice",
              lastName: "Owner",
              email: "alice@example.com",
              userRole: "USER",
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        page: 0,
        size: 10,
        totalElements: 14,
        totalPages: 2,
        first: true,
        last: false,
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof taskHooks.useTasksByProjectQuery>)
  })

  function renderDetails(userId: string) {
    const store = createTestStore({
      auth: {
        user: {
          id: userId,
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          user_role: "USER",
        },
        isAuthenticated: true,
        isLoading: false,
      },
    })
    const queryClient = createTestQueryClient()
    return {
      store,
      ...render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={["/app/projects/proj-1"]}>
              <Routes>
                <Route
                  path="/app/projects/:projectId"
                  element={<ProjectDetailsPage />}
                />
              </Routes>
            </MemoryRouter>
          </QueryClientProvider>
        </Provider>
      ),
    }
  }

  it("renders project details, storage, workflow, and compact DataPagination for members and tasks", () => {
    const { store } = renderDetails("u-owner")

    expect(screen.getByText("Enterprise Portal")).toBeInTheDocument()
    expect(screen.getByTestId("project-storage-section")).toBeInTheDocument()
    expect(screen.getByTestId("workflow-rules-section")).toBeInTheDocument()
    expect(screen.getByTestId("team-workload-section")).toBeInTheDocument()

    // Owner sees Edit Project & Danger Zone
    expect(screen.getByRole("button", { name: /Edit Project/i })).toBeInTheDocument()
    expect(screen.getByText("Danger Zone")).toBeInTheDocument()

    // Both members and tasks display compact DataPagination
    expect(screen.getAllByText("1–10").length).toBe(2)
    expect(screen.getAllByText(/Page 1 of 2/).length).toBe(2)

    const nextButtons = screen.getAllByRole("button", { name: /Next/i })
    fireEvent.click(nextButtons[0])
    expect(store.getState().projectMember.page).toBe(1)

    fireEvent.click(nextButtons[1])
    expect(store.getState().task.page).toBe(1)
  })

  it("hides Edit Project, Manage members, and Danger Zone for regular MEMBER", () => {
    renderDetails("u-mem")

    expect(
      screen.queryByRole("button", { name: /Edit Project/i })
    ).not.toBeInTheDocument()
    expect(screen.queryByText("Danger Zone")).not.toBeInTheDocument()
  })
})
