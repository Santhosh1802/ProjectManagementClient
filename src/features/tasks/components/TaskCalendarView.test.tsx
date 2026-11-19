import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import { format } from "date-fns"
import TaskCalendarView from "./TaskCalendarView"
import { renderWithProviders } from "@/test/testUtils"
import type { Task } from "@/features/tasks/types/task.types"

vi.mock("@/components/ui/date-picker", () => ({
  DatePicker: ({
    value,
    onChange,
    placeholder,
    disabled,
  }: {
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
  }) => (
    <input
      aria-label="Mock DatePicker"
      placeholder={placeholder}
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

const now = new Date()
const todayMiddayIso = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate(),
  14,
  30,
  0
).toISOString()

const baseProject = {
  id: "proj-1",
  name: "Phoenix",
  description: "",
  projectStatus: "ACTIVE",
  startDate: "2026-01-01T00:00:00Z",
  dueDate: "2026-12-31T00:00:00Z",
  owner: {
    id: "u-1",
    firstName: "Alice",
    lastName: "Owner",
    email: "alice@example.com",
  },
  createdAt: now.toISOString(),
  updatedAt: now.toISOString(),
}

const sampleUser = {
  id: "u-1",
  firstName: "Alice",
  lastName: "Owner",
  email: "alice@example.com",
  userRole: "ADMIN",
  isActive: true,
  emailVerified: true,
  createdAt: now.toISOString(),
  updatedAt: now.toISOString(),
  lastLoginAt: null,
}

const sampleTasks: Task[] = [
  {
    id: "t-scheduled",
    title: "Deploy Calendar Release",
    description: "Ship monthly calendar",
    taskStatus: "IN_PROGRESS",
    taskPriority: "HIGH",
    dueDate: todayMiddayIso,
    project: baseProject,
    assignedTo: sampleUser,
    createdBy: sampleUser,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "t-unscheduled",
    title: "Backlog Cleanup",
    description: null,
    taskStatus: "TODO",
    taskPriority: "LOW",
    dueDate: null,
    project: baseProject,
    assignedTo: sampleUser,
    createdBy: sampleUser,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
]

describe("TaskCalendarView", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders Month, Week, and Agenda views, navigates periods, and displays unscheduled tasks", () => {
    const onViewTask = vi.fn()

    renderWithProviders(
      <TaskCalendarView tasks={sampleTasks} onViewTask={onViewTask} />
    )

    expect(screen.getByText(format(now, "MMMM yyyy"))).toBeInTheDocument()
    expect(screen.getByText("1 scheduled")).toBeInTheDocument()
    expect(screen.getByText("1 unscheduled")).toBeInTheDocument()
    expect(screen.getAllByText("Deploy Calendar Release").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Backlog Cleanup")).toBeInTheDocument()

    // Click task title triggers onViewTask
    fireEvent.click(screen.getAllByText("Deploy Calendar Release")[0])
    expect(onViewTask).toHaveBeenCalledWith(sampleTasks[0])

    // Navigate next month and back to today
    fireEvent.click(screen.getByRole("button", { name: "Next period" }))
    fireEvent.click(screen.getByRole("button", { name: "Today" }))
    expect(screen.getByText(format(now, "MMMM yyyy"))).toBeInTheDocument()

    // Switch to Week mode
    fireEvent.click(screen.getByRole("button", { name: "Week" }))
    expect(screen.getByText("Deploy Calendar Release")).toBeInTheDocument()

    // Switch to Agenda mode
    fireEvent.click(screen.getByRole("button", { name: "Agenda" }))
    expect(screen.getByText("Chronological Agenda")).toBeInTheDocument()
    expect(screen.getAllByText("Deploy Calendar Release").length).toBeGreaterThanOrEqual(1)
  })

  it("opens the Reschedule dialog and calls onRescheduleTask with updated ISO date", async () => {
    const onRescheduleTask = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(
      <TaskCalendarView
        tasks={sampleTasks}
        onRescheduleTask={onRescheduleTask}
      />
    )

    fireEvent.click(
      screen.getByRole("button", { name: "Reschedule Deploy Calendar Release" })
    )

    expect(screen.getByText("Reschedule Task")).toBeInTheDocument()
    const pickerInput = screen.getByLabelText("Mock DatePicker")
    fireEvent.change(pickerInput, { target: { value: "2026-11-25 16:45" } })

    fireEvent.click(screen.getByRole("button", { name: "Save schedule" }))

    await waitFor(() => {
      expect(onRescheduleTask).toHaveBeenCalledTimes(1)
      expect(onRescheduleTask.mock.calls[0][0].id).toBe("t-scheduled")
      expect(onRescheduleTask.mock.calls[0][1]).toBe(
        new Date("2026-11-25T16:45:00").toISOString()
      )
    })
  })
})
