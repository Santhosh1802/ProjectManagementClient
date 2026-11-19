import { describe, it, expect, vi } from "vitest"
import { fireEvent, screen } from "@testing-library/react"
import { WhiteboardsDirectoryView } from "./WhiteboardsDirectoryView"
import { renderWithProviders } from "@/test/testUtils"
import type { Whiteboard } from "../types/whiteboard.types"

const mockBoards: Whiteboard[] = Array.from({ length: 10 }, (_, idx) => ({
  id: `wb-${idx + 1}`,
  title:
    idx % 2 === 0
      ? `Workspace Architecture ${idx + 1}`
      : `Project Sprint Board ${idx + 1}`,
  workspaceId: "ws-1",
  projectId: idx % 2 === 1 ? "p-1" : null,
  projectName: idx % 2 === 1 ? "Core API" : null,
  canvasJson: "[]",
  meetingNotes: `Notes for board ${idx + 1}`,
  version: idx + 1,
  createdById: "u-1",
  createdByName: "Alice",
  updatedByName: "Bob",
  createdAt: new Date(Date.now() - idx * 60_000).toISOString(),
  updatedAt: new Date(Date.now() - idx * 30_000).toISOString(),
}))

describe("WhiteboardsDirectoryView Pagination & Visibility Filtering", () => {
  it("paginates 10 whiteboards (8 per page), filters by Workspace/Project Only and search", () => {
    const onSelectBoard = vi.fn()
    const onBackToStudio = vi.fn()

    renderWithProviders(
      <WhiteboardsDirectoryView
        boards={mockBoards}
        activeBoardId="wb-1"
        onSelectBoard={onSelectBoard}
        onBackToStudio={onBackToStudio}
      />
    )

    expect(screen.getByText("Available Whiteboards (10)")).toBeInTheDocument()
    // Page 1 shows boards 1..8
    expect(
      screen.getByText("Workspace Architecture 1")
    ).toBeInTheDocument()
    expect(
      screen.queryByText("Project Sprint Board 10")
    ).not.toBeInTheDocument()
    expect(screen.getByText("1–8")).toBeInTheDocument()

    // Navigate to Page 2
    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }))
    expect(screen.getByText("Project Sprint Board 10")).toBeInTheDocument()
    expect(screen.getByText("Workspace Architecture 9")).toBeInTheDocument()

    // Filter to "Project Only"
    fireEvent.click(screen.getByRole("button", { name: "Project Only" }))
    expect(screen.getByText("Project Sprint Board 2")).toBeInTheDocument()
    expect(
      screen.queryByText("Workspace Architecture 1")
    ).not.toBeInTheDocument()

    // Search within boards
    fireEvent.change(screen.getByLabelText("Search available whiteboards"), {
      target: { value: "Board 6" },
    })
    expect(screen.getByText("Project Sprint Board 6")).toBeInTheDocument()
    expect(
      screen.queryByText("Project Sprint Board 2")
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Open Whiteboard" }))
    expect(onSelectBoard).toHaveBeenCalledWith("wb-6")
  })
})
