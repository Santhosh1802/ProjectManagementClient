import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import ProjectTasksPage from "./ProjectTasksPage"
import * as projectHooks from "@/features/projects/hooks/useProjectsQuery"
import * as taskHooks from "@/features/tasks/hooks/useTasksQuery"
import { createTestQueryClient, createTestStore } from "@/test/testUtils"

vi.mock("@/features/projects/hooks/useProjectsQuery", () => ({
  useProjectDetailQuery: vi.fn(),
}))

vi.mock("@/features/tasks/hooks/useTasksQuery", () => ({
  useTasksByProjectQuery: vi.fn(),
  useUpdateTaskStatusMutation: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useUpdateTaskDetailsMutation: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteTaskMutation: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useProjectDependenciesQuery: vi.fn(() => ({ data: [] })),
}))

const mockProject = {
  id: "proj-1",
  name: "Phoenix",
  description: "",
  projectStatus: "ACTIVE" as const,
  startDate: "2026-01-01T00:00:00Z",
  dueDate: "2026-12-31T00:00:00Z",
  owner: {
    id: "u-1",
    firstName: "Alice",
    lastName: "Owner",
    email: "alice@example.com",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockTasks = [
  {
    id: "t-1",
    title: "Configure Redis Cache",
    description: "Cluster tuning",
    taskStatus: "IN_PROGRESS" as const,
    taskPriority: "HIGH" as const,
    dueDate: "2026-12-01T00:00:00Z",
    project: mockProject,
    assignedTo: {
      id: "u-1",
      firstName: "Alice",
      lastName: "Owner",
      email: "alice@example.com",
      userRole: "ADMIN",
    },
    createdBy: {
      id: "u-1",
      firstName: "Alice",
      lastName: "Owner",
      email: "alice@example.com",
      userRole: "ADMIN",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

describe("ProjectTasksPage Views & Persistent Pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectHooks.useProjectDetailQuery).mockReturnValue({
      data: mockProject,
    } as unknown as ReturnType<typeof projectHooks.useProjectDetailQuery>)

    vi.mocked(taskHooks.useTasksByProjectQuery).mockReturnValue({
      data: {
        content: mockTasks,
        page: 0,
        size: 10,
        totalElements: 25,
        totalPages: 3,
        first: true,
        last: false,
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof taskHooks.useTasksByProjectQuery>)
  })

  it("switches across Card, Table, Kanban, and Timeline views and keeps pagination visible when filter yields 0 items", () => {
    const store = createTestStore()
    const queryClient = createTestQueryClient()

    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={["/app/projects/proj-1/tasks"]}>
            <Routes>
              <Route
                path="/app/projects/:projectId/tasks"
                element={<ProjectTasksPage />}
              />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </Provider>
    )

    expect(screen.getByText("Phoenix Tasks")).toBeInTheDocument()
    expect(screen.getByText("Configure Redis Cache")).toBeInTheDocument()
    expect(screen.getByText("1–10")).toBeInTheDocument()

    // Table view
    fireEvent.click(screen.getByTitle("Table View"))
    expect(screen.getByRole("table")).toBeInTheDocument()

    // Calendar view
    fireEvent.click(screen.getByTitle("Calendar View"))
    expect(screen.getByText("1 scheduled")).toBeInTheDocument()

    // Planning Timeline view
    fireEvent.click(screen.getByTitle("Planning Timeline"))
    expect(screen.getByText("Configure Redis Cache")).toBeInTheDocument()

    // Search query that matches 0 items on current page must NOT hide DataPagination
    fireEvent.change(screen.getByPlaceholderText("Search tasks..."), {
      target: { value: "non-existent-keyword-xyz" },
    })
    expect(screen.getByText("No tasks found")).toBeInTheDocument()
    expect(screen.getByText("1–10")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Go to page 2" })
    ).toBeInTheDocument()
  })
})
