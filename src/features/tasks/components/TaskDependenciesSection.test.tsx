import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import TaskDependenciesSection from "./TaskDependenciesSection"
import type { Task } from "@/features/tasks/types/task.types"

// Mock hooks
vi.mock("@/features/tasks/hooks/useTasksQuery", () => ({
  useTaskDependenciesQuery: () => ({
    data: {
      taskId: "task-1",
      isBlocked: true,
      blockedBy: [
        {
          dependencyId: "dep-1",
          taskId: "task-2",
          taskTitle: "Database Migration",
          taskStatus: "IN_PROGRESS",
          taskPriority: "HIGH",
          dueDate: "2026-11-01T10:00:00Z",
          dependencyType: "FINISH_TO_START",
          createdById: "user-1",
          createdByName: "Lead Dev",
          createdAt: "2026-10-25T10:00:00Z",
        },
      ],
      blocking: [
        {
          dependencyId: "dep-2",
          taskId: "task-3",
          taskTitle: "Integration Testing",
          taskStatus: "TODO",
          taskPriority: "MEDIUM",
          dueDate: "2026-11-10T10:00:00Z",
          dependencyType: "FINISH_TO_START",
          createdById: "user-1",
          createdByName: "Lead Dev",
          createdAt: "2026-10-25T10:00:00Z",
        },
      ],
    },
    isLoading: false,
  }),
  useCreateTaskDependencyMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useRemoveTaskDependencyMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

describe("TaskDependenciesSection", () => {
  const mockTask: Task = {
    id: "task-1",
    title: "Backend API Implementation",
    description: "Build endpoints",
    taskStatus: "TODO",
    taskPriority: "HIGH",
    dueDate: "2026-11-05T00:00:00Z",
    project: {
      id: "proj-1",
      name: "Core Project",
      description: null,
      projectStatus: "ACTIVE",
      startDate: "2026-10-01T00:00:00Z",
      dueDate: "2026-12-01T00:00:00Z",
      owner: { id: "u-1", firstName: "Alice", lastName: "Owner", email: "alice@example.com" },
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-01T00:00:00Z",
    },
    assignedTo: {
      id: "u-2",
      firstName: "Bob",
      lastName: "Dev",
      email: "bob@example.com",
      userRole: "USER",
      isActive: true,
      emailVerified: true,
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-01T00:00:00Z",
      lastLoginAt: null,
    },
    createdBy: {
      id: "u-1",
      firstName: "Alice",
      lastName: "Owner",
      email: "alice@example.com",
      userRole: "ADMIN",
      isActive: true,
      emailVerified: true,
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-01T00:00:00Z",
      lastLoginAt: null,
    },
    createdAt: "2026-10-01T00:00:00Z",
    updatedAt: "2026-10-01T00:00:00Z",
  }

  it("renders blocked state badge and prerequisite items correctly", () => {
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TaskDependenciesSection
            task={mockTask}
            projectTasks={[mockTask]}
            canManage={true}
          />
        </BrowserRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText("Dependencies")).toBeDefined()
    expect(screen.getAllByText("Blocked").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Database Migration")).toBeDefined()
    expect(screen.getByText("Integration Testing")).toBeDefined()
    expect(screen.getByText("Add Dependency")).toBeDefined()
  })
})
