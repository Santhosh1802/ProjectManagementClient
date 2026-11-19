import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import NotificationsPage from "./NotificationsPage"
import { BrowserRouter } from "react-router-dom"
import * as hooks from "@/features/notifications/hooks/useNotificationsQuery"
import type { NotificationItem, NotificationPageResponse } from "@/features/notifications/types/notification.types"

vi.mock("@/features/notifications/hooks/useNotificationsQuery")

describe("NotificationsPage", () => {
  const mockNotifications: NotificationItem[] = [
    {
      id: "notif-1",
      recipientId: "user-1",
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: "You have been assigned to task: Design UI",
      taskId: "task-1",
      projectId: "proj-1",
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "notif-2",
      recipientId: "user-1",
      type: "TASK_COMMENT_ADDED",
      title: "New Comment",
      message: "Someone commented on your task",
      taskId: "task-1",
      projectId: "proj-1",
      isRead: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]

  const mockPage: NotificationPageResponse = {
    content: mockNotifications,
    pageNumber: 0,
    pageSize: 20,
    totalElements: 2,
    totalPages: 1,
    first: true,
    last: true,
  }

  const markAllMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(hooks, "useUnreadNotificationsCountQuery").mockReturnValue({
      data: 1,
      isLoading: false,
    } as unknown as ReturnType<typeof hooks.useUnreadNotificationsCountQuery>)

    vi.spyOn(hooks, "useNotificationsQuery").mockReturnValue({
      data: mockPage,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof hooks.useNotificationsQuery>)

    vi.spyOn(hooks, "useMarkNotificationAsReadMutation").mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useMarkNotificationAsReadMutation>)

    vi.spyOn(hooks, "useMarkAllNotificationsAsReadMutation").mockReturnValue({
      mutate: markAllMutate,
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useMarkAllNotificationsAsReadMutation>)

    vi.spyOn(hooks, "useDeleteNotificationMutation").mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useDeleteNotificationMutation>)

    vi.spyOn(hooks, "useClearAllNotificationsMutation").mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useClearAllNotificationsMutation>)
  })

  it("renders page header, unread badge, and notification list", () => {
    render(
      <BrowserRouter>
        <NotificationsPage />
      </BrowserRouter>
    )

    expect(screen.getByRole("heading", { level: 1, name: "Notifications" })).toBeDefined()
    expect(screen.getByText("1 unread")).toBeDefined()
    expect(screen.getByText("Task Assigned")).toBeDefined()
    expect(screen.getByText("You have been assigned to task: Design UI")).toBeDefined()
    expect(screen.getByText("New Comment")).toBeDefined()
  })

  it("displays empty state when there are no notifications", () => {
    vi.spyOn(hooks, "useNotificationsQuery").mockReturnValue({
      data: {
        content: [],
        pageNumber: 0,
        pageSize: 20,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof hooks.useNotificationsQuery>)

    render(
      <BrowserRouter>
        <NotificationsPage />
      </BrowserRouter>
    )

    expect(screen.getByRole("heading", { name: /No notifications/i })).toBeDefined()
  })

  it("supports multi-page DataPagination, Unread filter tab, and Mark all as read action", () => {
    vi.spyOn(hooks, "useNotificationsQuery").mockReturnValue({
      data: {
        content: mockNotifications,
        pageNumber: 0,
        pageSize: 20,
        totalElements: 25,
        totalPages: 2,
        first: true,
        last: false,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof hooks.useNotificationsQuery>)

    render(
      <BrowserRouter>
        <NotificationsPage />
      </BrowserRouter>
    )

    expect(screen.getByText("1–20")).toBeInTheDocument()
    expect(screen.getByText("25")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Go to next page" }))
    expect(hooks.useNotificationsQuery).toHaveBeenLastCalledWith(false, 1, 20)

    fireEvent.click(screen.getByRole("tab", { name: /Unread/i }))
    expect(hooks.useNotificationsQuery).toHaveBeenLastCalledWith(true, 0, 20)

    fireEvent.click(screen.getByRole("button", { name: /Mark all as read/i }))
    expect(markAllMutate).toHaveBeenCalled()
  })
})
