import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, screen, waitFor, within } from "@testing-library/react"
import { TaskCommentsSection } from "./TaskCommentsSection"
import * as commentsHooks from "../hooks/useCommentsQuery"
import { renderWithProviders } from "@/test/testUtils"

vi.mock("../hooks/useCommentsQuery", () => ({
  useTaskCommentsQuery: vi.fn(),
  useCreateCommentMutation: vi.fn(),
  useUpdateCommentMutation: vi.fn(),
  useDeleteCommentMutation: vi.fn(),
}))

const TASK_ID = "11111111-1111-4111-8111-111111111111"
const COMMENT_ID = "22222222-2222-4222-8222-222222222222"
const REPLY_ID = "33333333-3333-4333-8333-333333333333"

const sampleComments = [
  {
    id: COMMENT_ID,
    taskId: TASK_ID,
    parentCommentId: null,
    author: {
      id: "u-1",
      firstName: "Alice",
      lastName: "Dev",
      email: "alice@example.com",
    },
    content: "First top-level comment",
    isDeleted: false,
    replies: [
      {
        id: REPLY_ID,
        taskId: TASK_ID,
        parentCommentId: COMMENT_ID,
        author: {
          id: "u-2",
          firstName: "Bob",
          lastName: "QA",
          email: "bob@example.com",
        },
        content: "Existing threaded reply",
        isDeleted: false,
        replies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

describe("TaskCommentsSection Server Pagination & Threading", () => {
  const createMutateAsync = vi.fn()
  const updateMutateAsync = vi.fn()
  const deleteMutateAsync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(commentsHooks.useTaskCommentsQuery).mockReturnValue({
      data: {
        content: sampleComments,
        totalElements: 15,
        totalPages: 2,
        page: 0,
        size: 10,
        first: true,
        last: false,
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof commentsHooks.useTaskCommentsQuery>)

    vi.mocked(commentsHooks.useCreateCommentMutation).mockReturnValue({
      mutateAsync: createMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof commentsHooks.useCreateCommentMutation>)

    vi.mocked(commentsHooks.useUpdateCommentMutation).mockReturnValue({
      mutateAsync: updateMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof commentsHooks.useUpdateCommentMutation>)

    vi.mocked(commentsHooks.useDeleteCommentMutation).mockReturnValue({
      mutateAsync: deleteMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof commentsHooks.useDeleteCommentMutation>)
  })

  it("paginates comments via DataPagination and submits new comments & threaded replies", async () => {
    renderWithProviders(<TaskCommentsSection taskId={TASK_ID} />, {
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
      },
    })

    expect(commentsHooks.useTaskCommentsQuery).toHaveBeenCalledWith(
      TASK_ID,
      0,
      10
    )
    expect(screen.getByText("Discussion (15)")).toBeInTheDocument()
    expect(screen.getByText("First top-level comment")).toBeInTheDocument()
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()

    // Navigate to page 2 of comments
    fireEvent.click(screen.getByRole("button", { name: /Next/i }))
    await waitFor(() => {
      expect(commentsHooks.useTaskCommentsQuery).toHaveBeenCalledWith(
        TASK_ID,
        1,
        10
      )
    })

    // Post a new comment
    fireEvent.change(screen.getByLabelText("Add a comment"), {
      target: { value: "Looks good to ship!" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Post/i }))

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith({
        taskId: TASK_ID,
        content: "Looks good to ship!",
      })
    })

    // Open replies thread and add a reply
    fireEvent.click(screen.getByRole("button", { name: /View replies \(1\)/i }))
    expect(screen.getByText("Existing threaded reply")).toBeInTheDocument()

    const replyButtons = screen.getAllByRole("button", { name: "Reply" })
    fireEvent.click(replyButtons[0])

    const replyTextarea = screen.getByPlaceholderText("Write a reply...")
    fireEvent.change(replyTextarea, {
      target: { value: "@Alice Verified on staging" },
    })

    const replyComposer = replyTextarea.parentElement!
    fireEvent.click(within(replyComposer).getByRole("button", { name: "Reply" }))

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith({
        taskId: TASK_ID,
        parentCommentId: COMMENT_ID,
        content: "@Alice Verified on staging",
      })
    })
  })

  it("autocompletes @member mentions into @email tokens and renders formatted mention badges", async () => {
    vi.mocked(commentsHooks.useTaskCommentsQuery).mockReturnValue({
      data: {
        content: [
          {
            ...sampleComments[0],
            content: "Please review @bob@example.com before release",
          },
        ],
        totalElements: 1,
        totalPages: 1,
        page: 0,
        size: 10,
        first: true,
        last: true,
      },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof commentsHooks.useTaskCommentsQuery>)

    const mentionMembers = [
      {
        id: "u-1",
        firstName: "Alice",
        lastName: "Dev",
        email: "alice@example.com",
      },
      {
        id: "u-2",
        firstName: "Bob",
        lastName: "QA",
        email: "bob@example.com",
      },
    ]

    renderWithProviders(
      <TaskCommentsSection taskId={TASK_ID} mentionMembers={mentionMembers} />,
      {
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
        },
      }
    )

    // Existing comment formats @bob@example.com into a readable mention badge
    expect(screen.getByText("@Bob QA")).toBeInTheDocument()

    const input = screen.getByLabelText("Add a comment") as HTMLTextAreaElement
    fireEvent.change(input, {
      target: { value: "Hey @bob", selectionStart: 8 },
    })

    const listbox = screen.getByRole("listbox", { name: "Mention project member" })
    expect(within(listbox).getByText("Bob QA")).toBeInTheDocument()
    expect(within(listbox).getByText("@bob@example.com")).toBeInTheDocument()

    fireEvent.click(within(listbox).getByRole("option"))

    expect(input.value).toBe("Hey @bob@example.com ")

    fireEvent.click(screen.getByRole("button", { name: /Post/i }))
    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith({
        taskId: TASK_ID,
        content: "Hey @bob@example.com",
      })
    })
  })
})
