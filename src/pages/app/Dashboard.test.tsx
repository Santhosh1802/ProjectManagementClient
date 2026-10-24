import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { configureStore } from "@reduxjs/toolkit"

import Dashboard from "@/pages/app/Dashboard"
import authReducer from "@/features/auth/slice/authSlice"

// Mock the analytics query hooks
vi.mock("@/features/analytics/hooks/useAnalyticsQuery", () => ({
  useOverviewAnalyticsQuery: () => ({
    data: {
      totalProjects: 3,
      activeProjects: 2,
      completedProjects: 1,
      planningProjects: 0,
      totalTasks: 12,
      completedTasks: 8,
      inProgressTasks: 3,
      todoTasks: 1,
      cancelledTasks: 0,
      overdueTasks: 2,
      completionPercentage: 67,
      tasksByStatus: {
        DONE: 8,
        IN_PROGRESS: 3,
        TODO: 1,
        CANCELLED: 0,
      },
      tasksByPriority: {
        URGENT: 2,
        HIGH: 4,
        MEDIUM: 5,
        LOW: 1,
      },
      projectProgress: [
        {
          projectId: "proj-1",
          projectName: "Phoenix Migration",
          projectStatus: "ACTIVE",
          totalTasks: 6,
          completedTasks: 4,
          completionPercentage: 67,
          dueDate: "2026-11-01T00:00:00Z",
        },
      ],
      overdueTasksList: [
        {
          taskId: "task-overdue-1",
          title: "Fix database deadlocks",
          taskPriority: "URGENT",
          taskStatus: "IN_PROGRESS",
          dueDate: "2026-10-20T00:00:00Z",
          projectId: "proj-1",
          projectName: "Phoenix Migration",
          assignedToName: "Alex Dev",
        },
      ],
      upcomingTasksList: [
        {
          taskId: "task-upcoming-1",
          title: "Review security audit logs",
          taskPriority: "HIGH",
          taskStatus: "TODO",
          dueDate: "2026-10-30T00:00:00Z",
          projectId: "proj-1",
          projectName: "Phoenix Migration",
          assignedToName: "Sarah Lead",
        },
      ],
    },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useProjectAnalyticsQuery: () => ({
    data: undefined,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useWorkloadAnalyticsQuery: () => ({
    data: {
      members: [
        {
          userId: "user-1",
          name: "Alex Dev",
          email: "alex@example.com",
          totalAssigned: 5,
          completedTasks: 3,
          inProgressTasks: 2,
          todoTasks: 0,
          overdueTasks: 1,
        },
      ],
    },
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}))

vi.mock("@/features/projects/hooks/useProjectsQuery", () => ({
  useProjectsQuery: () => ({
    data: {
      content: [
        { id: "proj-1", name: "Phoenix Migration" },
        { id: "proj-2", name: "Mobile App V2" },
      ],
    },
    isLoading: false,
  }),
}))

vi.mock("@/features/activity/hooks/useActivityQuery", () => ({
  useProjectActivityQuery: () => ({
    data: [
      {
        id: "act-1",
        summary: "Task status changed to DONE",
        actorName: "Alex Dev",
        createdAt: "2026-10-24T12:00:00Z",
      },
    ],
    isLoading: false,
  }),
}))

describe("Dashboard Page", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: {
          id: "test-user-id",
          email: "test@example.com",
          user_role: "ADMIN",
          firstName: "Test",
          lastName: "User",
        },
        isAuthenticated: true,
        isLoading: false,
      },
    },
  })

  it("renders page header, metric cards, and progress items correctly", () => {
    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <Dashboard />
          </MemoryRouter>
        </QueryClientProvider>
      </Provider>
    )

    // Page title and description
    expect(screen.getByText("Dashboard Analytics")).toBeInTheDocument()
    expect(
      screen.getByText(/Comprehensive workspace metrics/i)
    ).toBeInTheDocument()

    // Metric Summary
    expect(screen.getByText("Total Tasks")).toBeInTheDocument()
    expect(screen.getByText("Completion Rate")).toBeInTheDocument()
    expect(screen.getAllByText("67%").length).toBeGreaterThanOrEqual(1)

    // Overdue task alert section
    expect(screen.getByText("Fix database deadlocks")).toBeInTheDocument()
    expect(screen.getAllByText(/Alex Dev/i).length).toBeGreaterThanOrEqual(1)

    // Team workload
    expect(screen.getByText("Team Workload")).toBeInTheDocument()
    expect(screen.getByText("5 tasks")).toBeInTheDocument()
  })
})
