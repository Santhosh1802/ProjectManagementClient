import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, screen } from "@testing-library/react"
import { TaskActivityTimeline } from "@/features/activity/components/TaskActivityTimeline"
import { TaskAttachmentsSection } from "@/features/attachments/components/TaskAttachmentsSection"
import TeamWorkloadPlanningView from "./TeamWorkloadPlanningView"
import * as activityHooks from "@/features/activity/hooks/useActivityQuery"
import * as attachmentsHooks from "@/features/attachments/hooks/useAttachmentsQuery"
import { renderWithProviders } from "@/test/testUtils"
import type { ProjectMember } from "@/features/projects/types/project.types"
import type { Task } from "@/features/tasks/types/task.types"

vi.mock("@/features/activity/hooks/useActivityQuery", () => ({
  useTaskActivityQuery: vi.fn(),
}))

vi.mock("@/features/attachments/hooks/useAttachmentsQuery", () => ({
  useTaskAttachmentsQuery: vi.fn(),
  useUploadAttachmentMutation: vi.fn(),
  useDeleteAttachmentMutation: vi.fn(),
}))

describe("Paginated Detail Sections (Activity Timeline, Attachments, Team Workload)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("paginates TaskActivityTimeline across multiple pages (6 events per page)", () => {
    vi.mocked(activityHooks.useTaskActivityQuery).mockReturnValue({
      data: Array.from({ length: 8 }, (_, idx) => ({
        id: `act-${idx + 1}`,
        taskId: "t-1",
        actorName: `Actor ${idx + 1}`,
        actionType: "UPDATED",
        details: `Activity log entry number ${idx + 1}`,
        createdAt: new Date().toISOString(),
      })),
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof activityHooks.useTaskActivityQuery>)

    renderWithProviders(<TaskActivityTimeline taskId="t-1" />)

    expect(screen.getByText("Activity log entry number 1")).toBeInTheDocument()
    expect(screen.queryByText("Activity log entry number 7")).not.toBeInTheDocument()
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Next/i }))
    expect(screen.getByText("Activity log entry number 7")).toBeInTheDocument()
    expect(screen.getByText("Activity log entry number 8")).toBeInTheDocument()
  })

  it("paginates TaskAttachmentsSection (5 attachments per page) and handles deletion", () => {
    const deleteMutate = vi.fn()
    vi.mocked(attachmentsHooks.useTaskAttachmentsQuery).mockReturnValue({
      data: Array.from({ length: 7 }, (_, idx) => ({
        id: `att-${idx + 1}`,
        fileName: `spec-sheet-${idx + 1}.pdf`,
        fileSize: 1024 * (idx + 1),
        uploadedByName: "Alice",
        createdAt: new Date().toISOString(),
      })),
      isLoading: false,
    } as unknown as ReturnType<typeof attachmentsHooks.useTaskAttachmentsQuery>)

    vi.mocked(attachmentsHooks.useUploadAttachmentMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof attachmentsHooks.useUploadAttachmentMutation>)

    vi.mocked(attachmentsHooks.useDeleteAttachmentMutation).mockReturnValue({
      mutate: deleteMutate,
      isPending: false,
    } as unknown as ReturnType<typeof attachmentsHooks.useDeleteAttachmentMutation>)

    renderWithProviders(<TaskAttachmentsSection taskId="t-1" />)

    expect(screen.getByText("Attachments (7)")).toBeInTheDocument()
    expect(screen.getByText("spec-sheet-1.pdf")).toBeInTheDocument()
    expect(screen.queryByText("spec-sheet-6.pdf")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Next/i }))
    expect(screen.getByText("spec-sheet-6.pdf")).toBeInTheDocument()
    expect(screen.getByText("spec-sheet-7.pdf")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Delete spec-sheet-6.pdf" }))
    expect(deleteMutate).toHaveBeenCalledWith("att-6")
  })

  it("paginates and searches TeamWorkloadPlanningView across 8 members (6 per page)", () => {
    const nowIso = new Date().toISOString()
    const makeTaskUser = (
      id: string,
      firstName: string,
      lastName: string,
      email: string,
      userRole = "USER"
    ) => ({
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
    })

    const sharedProject = {
      id: "p-1",
      name: "Core",
      description: "",
      projectStatus: "ACTIVE" as const,
      startDate: "2026-01-01T00:00:00Z",
      dueDate: "2026-12-31T00:00:00Z",
      owner: {
        id: "u-1",
        firstName: "Engineer",
        lastName: "Number1",
        email: "eng1@example.com",
      },
      createdAt: nowIso,
      updatedAt: nowIso,
    }

    const members: ProjectMember[] = Array.from({ length: 8 }, (_, idx) => ({
      id: `pm-${idx + 1}`,
      projectRole: idx === 0 ? "MANAGER" : "MEMBER",
      joinedAt: nowIso,
      project: sharedProject,
      user: makeTaskUser(
        `u-${idx + 1}`,
        "Engineer",
        `Number${idx + 1}`,
        `eng${idx + 1}@example.com`
      ),
    }))

    const tasks: Task[] = [
      {
        id: "t-1",
        title: "Critical API Fix",
        description: "",
        taskStatus: "IN_PROGRESS",
        taskPriority: "URGENT",
        dueDate: "2026-12-01T00:00:00Z",
        project: sharedProject,
        assignedTo: makeTaskUser(
          "u-7",
          "Engineer",
          "Number7",
          "eng7@example.com"
        ),
        createdBy: makeTaskUser(
          "u-1",
          "Engineer",
          "Number1",
          "eng1@example.com"
        ),
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    ]

    renderWithProviders(<TeamWorkloadPlanningView members={members} tasks={tasks} />)

    expect(screen.getByText("Engineer Number1")).toBeInTheDocument()
    expect(screen.queryByText("Engineer Number7")).not.toBeInTheDocument()
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /Next/i }))
    expect(screen.getByText("Engineer Number7")).toBeInTheDocument()
    expect(screen.getByText("Critical API Fix")).toBeInTheDocument()

    // Search resets to matching member cleanly
    fireEvent.change(screen.getByPlaceholderText("Search team member..."), {
      target: { value: "Number2" },
    })
    expect(screen.getByText("Engineer Number2")).toBeInTheDocument()
    expect(screen.queryByText("Engineer Number7")).not.toBeInTheDocument()
  })
})
