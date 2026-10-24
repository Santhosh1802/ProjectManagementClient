import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { NotificationBell } from "./NotificationBell"
import { BrowserRouter } from "react-router-dom"
import * as hooks from "../hooks/useNotificationsQuery"
import type { NotificationItem, NotificationPageResponse } from "../types/notification.types"

vi.mock("../hooks/useNotificationsQuery")

describe("NotificationBell Component", () => {
  const mockNotifications: NotificationItem[] = [
    {
      id: "notif-1",
      recipientId: "user-1",
      type: "TASK_ASSIGNED",
      title: "New Task Assigned",
      message: "You have been assigned to task: Build UI",
      taskId: "task-100",
      projectId: "proj-10",
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "notif-2",
      recipientId: "user-1",
      type: "TASK_COMMENT_ADDED",
      title: "New Comment on Task",
      message: "A new comment was posted",
      taskId: "task-100",
      projectId: "proj-10",
      isRead: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]

  const mockPage: NotificationPageResponse = {
    content: mockNotifications,
    pageNumber: 0,
    pageSize: 15,
    totalElements: 2,
    totalPages: 1,
    first: true,
    last: true,
  }

  it("should render unread count badge when there are unread notifications", () => {
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
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof hooks.useMarkAllNotificationsAsReadMutation>)


    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    )

    expect(screen.getByText("1")).toBeDefined()
    expect(screen.getByRole("button", { name: /1 unread notifications/i })).toBeDefined()
  })

  it("should open panel and display notification items when clicked", () => {
    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    )

    const trigger = screen.getByRole("button", { name: /1 unread notifications/i })
    fireEvent.click(trigger)

    expect(screen.getByText("New Task Assigned")).toBeDefined()
    expect(screen.getByText("You have been assigned to task: Build UI")).toBeDefined()
    expect(screen.getByText("New Comment on Task")).toBeDefined()
  })
})

