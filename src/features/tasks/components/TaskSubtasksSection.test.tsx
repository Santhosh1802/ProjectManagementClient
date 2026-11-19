import { beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import TaskSubtasksSection from "./TaskSubtasksSection"
import {
  getEffectiveAssignees,
  SubtaskProgressBadge,
  TaskAssigneeAvatars,
} from "./TaskAssigneeAvatars"
import type { Task, TaskSubtask, TaskUser } from "@/features/tasks/types/task.types"

const createMutateAsync = vi.fn()
const updateMutateAsync = vi.fn()
const reorderMutateAsync = vi.fn()
const deleteMutateAsync = vi.fn()

let mockSubtasks: TaskSubtask[] = []

vi.mock("@/features/tasks/hooks/useTasksQuery", () => ({
  useTaskSubtasksQuery: () => ({
    data: mockSubtasks,
    isLoading: false,
  }),
  useCreateSubtaskMutation: () => ({
    mutateAsync: createMutateAsync,
    isPending: false,
  }),
  useUpdateSubtaskMutation: () => ({
    mutateAsync: updateMutateAsync,
    isPending: false,
  }),
  useReorderSubtasksMutation: () => ({
    mutateAsync: reorderMutateAsync,
    isPending: false,
  }),
  useDeleteSubtaskMutation: () => ({
    mutateAsync: deleteMutateAsync,
    isPending: false,
  }),
}))

const sampleMembers = [
  { id: "u-1", firstName: "Alice", lastName: "Owner", email: "alice@example.com" },
  { id: "u-2", firstName: "Bob", lastName: "Dev", email: "bob@example.com" },
]

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe("TaskSubtasksSection", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createMutateAsync.mockResolvedValue({})
    updateMutateAsync.mockResolvedValue({})
    reorderMutateAsync.mockResolvedValue([])
    deleteMutateAsync.mockResolvedValue(true)

    mockSubtasks = [
      {
        id: "sub-1",
        taskId: "task-1",
        title: "Design database migration",
        completed: true,
        sortOrder: 0,
        assignedTo: sampleMembers[0],
        dueDate: null,
        completedAt: "2026-11-18T10:00:00Z",
        createdById: "u-1",
        createdAt: "2026-11-18T09:00:00Z",
        updatedAt: "2026-11-18T10:00:00Z",
      },
      {
        id: "sub-2",
        taskId: "task-1",
        title: "Implement REST controller",
        completed: false,
        sortOrder: 1,
        assignedTo: sampleMembers[1],
        dueDate: null,
        completedAt: null,
        createdById: "u-1",
        createdAt: "2026-11-18T09:05:00Z",
        updatedAt: "2026-11-18T09:05:00Z",
      },
    ]
  })

  it("renders subtask checklist items and completion progress", () => {
    renderWithQuery(
      <TaskSubtasksSection
        taskId="task-1"
        projectId="proj-1"
        projectMembers={sampleMembers}
      />
    )

    expect(screen.getByText("1 / 2 completed")).toBeInTheDocument()
    expect(screen.getByText("50%")).toBeInTheDocument()
    expect(
      screen.getByRole("progressbar", { name: /subtask completion progress/i })
    ).toHaveAttribute("aria-valuenow", "50")
    expect(screen.getByText("Design database migration")).toBeInTheDocument()
    expect(screen.getByText("Implement REST controller")).toBeInTheDocument()
  })

  it("validates and creates a new subtask", async () => {
    renderWithQuery(
      <TaskSubtasksSection
        taskId="task-1"
        projectId="proj-1"
        projectMembers={sampleMembers}
      />
    )

    const input = screen.getByLabelText("New subtask title")
    fireEvent.change(input, { target: { value: "  Add unit tests  " } })
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }))

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith({
        title: "Add unit tests",
        assignedToId: null,
      })
    })
  })

  it("toggles subtask completion via checkbox", async () => {
    renderWithQuery(
      <TaskSubtasksSection
        taskId="task-1"
        projectId="proj-1"
        projectMembers={sampleMembers}
      />
    )

    const toggle = screen.getByLabelText('Toggle "Implement REST controller"')
    fireEvent.click(toggle)

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith({
        subtaskId: "sub-2",
        data: { completed: true },
      })
    })
  })

  it("edits a subtask title inline", async () => {
    renderWithQuery(
      <TaskSubtasksSection
        taskId="task-1"
        projectId="proj-1"
        projectMembers={sampleMembers}
      />
    )

    fireEvent.click(screen.getByLabelText('Edit "Implement REST controller"'))
    const editInput = screen.getByLabelText("Edit subtask title")
    fireEvent.change(editInput, { target: { value: "Update REST endpoints" } })
    fireEvent.click(screen.getByLabelText("Save subtask title"))

    await waitFor(() => {
      expect(updateMutateAsync).toHaveBeenCalledWith({
        subtaskId: "sub-2",
        data: { title: "Update REST endpoints" },
      })
    })
  })

  it("reorders and deletes subtasks", async () => {
    renderWithQuery(
      <TaskSubtasksSection
        taskId="task-1"
        projectId="proj-1"
        projectMembers={sampleMembers}
      />
    )

    fireEvent.click(screen.getByLabelText('Move "Design database migration" down'))
    await waitFor(() => {
      expect(reorderMutateAsync).toHaveBeenCalledWith(["sub-2", "sub-1"])
    })

    fireEvent.click(screen.getByLabelText('Delete "Implement REST controller"'))
    await waitFor(() => {
      expect(deleteMutateAsync).toHaveBeenCalledWith("sub-2")
    })
  })
})

describe("TaskAssigneeAvatars & SubtaskProgressBadge", () => {
  const makeUser = (id: string, firstName: string, lastName: string): TaskUser => ({
    id,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}@example.com`,
    userRole: "USER",
    isActive: true,
    emailVerified: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    lastLoginAt: null,
  })

  it("deduplicates assignees with primary assignee first and renders overflow badge", () => {
    const primary = makeUser("u-1", "Alice", "Owner")
    const co1 = makeUser("u-2", "Bob", "Dev")
    const co2 = makeUser("u-3", "Cara", "QA")
    const co3 = makeUser("u-4", "Dan", "Ops")

    const taskPick: Pick<Task, "assignedTo" | "assignees"> = {
      assignedTo: primary,
      assignees: [co1, primary, co2, co3],
    }

    const effective = getEffectiveAssignees(taskPick)
    expect(effective.map((u) => u.id)).toEqual(["u-1", "u-2", "u-3", "u-4"])

    render(<TaskAssigneeAvatars task={taskPick} maxVisible={2} />)
    expect(screen.getByText("AO")).toBeInTheDocument()
    expect(screen.getByText("BD")).toBeInTheDocument()
    expect(screen.getByText("+2")).toBeInTheDocument()
  })

  it("renders SubtaskProgressBadge only when subtasks exist", () => {
    const { container, rerender } = render(
      <SubtaskProgressBadge subtaskCount={0} completedSubtaskCount={0} />
    )
    expect(container).toBeEmptyDOMElement()

    rerender(<SubtaskProgressBadge subtaskCount={4} completedSubtaskCount={3} />)
    expect(screen.getByText("3/4")).toBeInTheDocument()
  })
})
