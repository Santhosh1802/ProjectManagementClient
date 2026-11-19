import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import TaskPage from "./TaskPage"
import * as taskService from "@/features/tasks/services/task.services"
import * as projectService from "@/features/projects/services/projects.services"
import { renderWithProviders } from "@/test/testUtils"
import type { Task } from "@/features/tasks/types/task.types"

vi.mock("@/features/tasks/services/task.services", () => ({
  getAllTasks: vi.fn(),
  getTasksByAssignedTo: vi.fn(),
  getTasksByCreatedBy: vi.fn(),
  updateTaskDetails: vi.fn(),
  updateTaskStatus: vi.fn(),
  deleteTask: vi.fn(),
}))

vi.mock("@/features/projects/services/projects.services", () => ({
  searchProjects: vi.fn(),
}))

vi.mock("@/features/savedviews/hooks/useSavedViewsQuery", () => ({
  useSavedViewsQuery: vi.fn(() => ({ data: [], isLoading: false })),
  useCreateSavedViewMutation: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteSavedViewMutation: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}))

const nowIso = new Date().toISOString()

function makeTaskUser(
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  userRole: string
) {
  return {
    id,
    firstName,
    lastName,
    email,
    userRole,
    isActive: true,
    emailVerified: true,
    createdAt: nowIso,
    updatedAt: nowIso,
    lastLoginAt: null,
  }
}

const baseProject = {
  id: "p-1",
  name: "Core Platform",
  description: "",
  projectStatus: "ACTIVE",
  startDate: "2026-01-01T00:00:00Z",
  dueDate: "2026-12-31T00:00:00Z",
  owner: {
    id: "u-admin",
    firstName: "Alice",
    lastName: "Admin",
    email: "alice@example.com",
  },
  createdAt: nowIso,
  updatedAt: nowIso,
}

const adminUser = makeTaskUser(
  "u-admin",
  "Alice",
  "Admin",
  "alice@example.com",
  "ADMIN"
)

const regularUser = makeTaskUser(
  "u-user",
  "Bob",
  "User",
  "bob@example.com",
  "USER"
)

const sampleTasks: Task[] = [
  {
    id: "t-1",
    title: "Implement SSO Login",
    description: "OAuth2 & OIDC setup",
    taskStatus: "IN_PROGRESS",
    taskPriority: "HIGH",
    dueDate: "2026-12-01T00:00:00Z",
    project: baseProject,
    assignedTo: adminUser,
    createdBy: adminUser,
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: "t-2",
    title: "Write Unit Tests",
    description: "Vitest coverage",
    taskStatus: "TODO",
    taskPriority: "MEDIUM",
    dueDate: "2026-12-10T00:00:00Z",
    project: baseProject,
    assignedTo: regularUser,
    createdBy: adminUser,
    createdAt: nowIso,
    updatedAt: nowIso,
  },
]

describe("TaskPage Scopes, Views, Filtering & DataPagination", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectService.searchProjects).mockResolvedValue({
      content: [
        {
          id: "p-1",
          name: "Core Platform",
          description: "",
          projectStatus: "ACTIVE",
          startDate: "2026-01-01T00:00:00Z",
          dueDate: "2026-12-31T00:00:00Z",
          owner: {
            id: "u-admin",
            firstName: "Alice",
            lastName: "Admin",
            email: "alice@example.com",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      page: 0,
      size: 100,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    })

    vi.mocked(taskService.getAllTasks).mockResolvedValue({
      content: sampleTasks,
      page: 0,
      size: 10,
      totalElements: 24,
      totalPages: 3,
      first: true,
      last: false,
    })

    vi.mocked(taskService.getTasksByAssignedTo).mockResolvedValue({
      content: [sampleTasks[1]],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    })
  })

  it("renders All Tasks for ADMIN, switches views, resets filter chips, and paginates", async () => {
    const { store } = renderWithProviders(<TaskPage />, {
      route: "/app/tasks?status=TODO",
      preloadedState: {
        auth: {
          user: {
            id: "u-admin",
            firstName: "Alice",
            lastName: "Admin",
            email: "alice@example.com",
            user_role: "ADMIN",
          },
          isAuthenticated: true,
          isLoading: false,
        },
      },
    })

    expect(await screen.findByText("Write Unit Tests")).toBeInTheDocument()
    expect(screen.queryByText("Implement SSO Login")).not.toBeInTheDocument()
    expect(screen.getByText(/Status: TODO/i)).toBeInTheDocument()

    // Reset filter chip restores both tasks
    fireEvent.click(screen.getByRole("button", { name: "Reset all" }))
    expect(await screen.findByText("Implement SSO Login")).toBeInTheDocument()
    expect(screen.getByText("1–10")).toBeInTheDocument()

    // Switch to Table view
    fireEvent.click(screen.getByRole("button", { name: "Table view" }))
    expect(screen.getByRole("table")).toBeInTheDocument()

    // Switch to Calendar view
    fireEvent.click(screen.getByRole("button", { name: "Calendar view" }))
    expect(screen.getByText("2 scheduled")).toBeInTheDocument()

    // Switch to Planning timeline view
    fireEvent.click(screen.getByRole("button", { name: "Planning timeline" }))
    expect(screen.getByText("Total Planned Tasks")).toBeInTheDocument()

    // Export CSV
    const createObjectURL = vi.fn(() => "blob:mock-tasks-csv")
    const revokeObjectURL = vi.fn()
    Object.defineProperty(URL, "createObjectURL", {
      value: createObjectURL,
      configurable: true,
      writable: true,
    })
    Object.defineProperty(URL, "revokeObjectURL", {
      value: revokeObjectURL,
      configurable: true,
      writable: true,
    })
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {})
    fireEvent.click(screen.getByRole("button", { name: /Export CSV/i }))
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    clickSpy.mockRestore()

    // Click Page 2
    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }))
    await waitFor(() => {
      expect(store.getState().task.page).toBe(1)
    })
  })

  it("defaults regular USER to ASSIGNED_TO_ME and hides All Tasks scope", async () => {
    renderWithProviders(<TaskPage />, {
      route: "/app/tasks",
      preloadedState: {
        auth: {
          user: {
            id: "u-user",
            firstName: "Bob",
            lastName: "User",
            email: "bob@example.com",
            user_role: "USER",
          },
          isAuthenticated: true,
          isLoading: false,
        },
      },
    })

    expect(await screen.findByText("Write Unit Tests")).toBeInTheDocument()
    expect(taskService.getTasksByAssignedTo).toHaveBeenCalled()
    expect(
      screen.queryByRole("button", { name: "All Tasks" })
    ).not.toBeInTheDocument()
  })
})
