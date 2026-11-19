import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { configureStore } from "@reduxjs/toolkit"

import Dashboard from "@/pages/app/Dashboard"
import authReducer from "@/features/auth/slice/authSlice"
import * as analyticsHooks from "@/features/analytics/hooks/useAnalyticsQuery"
import * as activityHooks from "@/features/activity/hooks/useActivityQuery"

vi.mock("@/features/analytics/hooks/useAnalyticsQuery", () => ({
  useOverviewAnalyticsQuery: vi.fn(),
  useProjectAnalyticsQuery: vi.fn(),
  useWorkloadAnalyticsQuery: vi.fn(),
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
  useProjectActivityQuery: vi.fn(),
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

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(analyticsHooks.useOverviewAnalyticsQuery).mockReturnValue({
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
    } as unknown as ReturnType<typeof analyticsHooks.useOverviewAnalyticsQuery>)

    vi.mocked(analyticsHooks.useProjectAnalyticsQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof analyticsHooks.useProjectAnalyticsQuery>)

    vi.mocked(analyticsHooks.useWorkloadAnalyticsQuery).mockReturnValue({
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
    } as unknown as ReturnType<typeof analyticsHooks.useWorkloadAnalyticsQuery>)

    vi.mocked(activityHooks.useProjectActivityQuery).mockReturnValue({
      data: [
        {
          id: "act-1",
          details: "Task status changed to DONE",
          actorName: "Alex Dev",
          createdAt: "2026-10-24T12:00:00Z",
        },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof activityHooks.useProjectActivityQuery>)
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

    expect(screen.getByText("Dashboard Analytics")).toBeInTheDocument()
    expect(
      screen.getByText(/Comprehensive workspace metrics/i)
    ).toBeInTheDocument()

    expect(screen.getByText("Total Tasks")).toBeInTheDocument()
    expect(screen.getByText("Completion Rate")).toBeInTheDocument()
    expect(screen.getAllByText("67%").length).toBeGreaterThanOrEqual(1)

    expect(screen.getByText("Fix database deadlocks")).toBeInTheDocument()
    expect(screen.getAllByText(/Alex Dev/i).length).toBeGreaterThanOrEqual(1)

    expect(screen.getByText("Team Workload")).toBeInTheDocument()
    expect(screen.getByText("5 tasks")).toBeInTheDocument()
  })

  it("paginates Project Progress, Team Workload, Overdue Deadlines, and Recent Activity cards via DataPagination", () => {
    vi.mocked(analyticsHooks.useOverviewAnalyticsQuery).mockReturnValue({
      data: {
        totalProjects: 7,
        activeProjects: 7,
        completedProjects: 0,
        planningProjects: 0,
        totalTasks: 30,
        completedTasks: 15,
        inProgressTasks: 10,
        todoTasks: 5,
        cancelledTasks: 0,
        overdueTasks: 5,
        completionPercentage: 50,
        tasksByStatus: { DONE: 15, IN_PROGRESS: 10, TODO: 5, CANCELLED: 0 },
        tasksByPriority: { URGENT: 5, HIGH: 10, MEDIUM: 10, LOW: 5 },
        projectProgress: Array.from({ length: 7 }, (_, i) => ({
          projectId: `p-${i + 1}`,
          projectName: `Initiative ${i + 1}`,
          projectStatus: "ACTIVE",
          totalTasks: 10,
          completedTasks: 5,
          completionPercentage: 50,
          dueDate: "2026-12-01T00:00:00Z",
        })),
        overdueTasksList: Array.from({ length: 5 }, (_, i) => ({
          taskId: `od-${i + 1}`,
          title: `Overdue Deliverable ${i + 1}`,
          taskPriority: "URGENT",
          taskStatus: "IN_PROGRESS",
          dueDate: "2026-10-01T00:00:00Z",
          projectId: "p-1",
          projectName: "Initiative 1",
          assignedToName: "Alex",
        })),
        upcomingTasksList: [],
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof analyticsHooks.useOverviewAnalyticsQuery>)

    vi.mocked(analyticsHooks.useWorkloadAnalyticsQuery).mockReturnValue({
      data: {
        members: Array.from({ length: 7 }, (_, i) => ({
          userId: `wm-${i + 1}`,
          name: `Member Workload ${i + 1}`,
          email: `m${i + 1}@example.com`,
          totalAssigned: 4,
          completedTasks: 2,
          inProgressTasks: 2,
          todoTasks: 0,
          overdueTasks: 0,
        })),
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof analyticsHooks.useWorkloadAnalyticsQuery>)

    vi.mocked(activityHooks.useProjectActivityQuery).mockReturnValue({
      data: Array.from({ length: 7 }, (_, i) => ({
        id: `act-${i + 1}`,
        details: `Activity Event ${i + 1}`,
        actorName: "Alex Dev",
        createdAt: "2026-10-24T12:00:00Z",
      })),
      isLoading: false,
    } as unknown as ReturnType<typeof activityHooks.useProjectActivityQuery>)

    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <Dashboard />
          </MemoryRouter>
        </QueryClientProvider>
      </Provider>
    )

    // Initial page items present, overflow items hidden
    expect(screen.getByText("Initiative 1")).toBeInTheDocument()
    expect(screen.queryByText("Initiative 6")).not.toBeInTheDocument()

    expect(screen.getByText("Member Workload 1")).toBeInTheDocument()
    expect(screen.queryByText("Member Workload 6")).not.toBeInTheDocument()

    expect(screen.getByText("Overdue Deliverable 1")).toBeInTheDocument()
    expect(screen.queryByText("Overdue Deliverable 4")).not.toBeInTheDocument()

    expect(screen.getByText("Activity Event 1")).toBeInTheDocument()
    expect(screen.queryByText("Activity Event 6")).not.toBeInTheDocument()

    // Click Next on all 4 paginated cards
    const nextButtons = screen.getAllByRole("button", { name: /Next/i })
    expect(nextButtons.length).toBe(4)
    nextButtons.forEach((btn) => fireEvent.click(btn))

    expect(screen.getByText("Initiative 6")).toBeInTheDocument()
    expect(screen.getByText("Member Workload 6")).toBeInTheDocument()
    expect(screen.getByText("Overdue Deliverable 4")).toBeInTheDocument()
    expect(screen.getByText("Activity Event 6")).toBeInTheDocument()
  })
})
