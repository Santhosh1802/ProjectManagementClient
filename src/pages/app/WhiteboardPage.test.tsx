import { describe, it, expect, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import themeReducer from "@/app/slice/themeSlice"
import WhiteboardPage from "./WhiteboardPage"
import * as wbQueries from "@/features/whiteboard/hooks/useWhiteboardsQuery"

vi.mock("@excalidraw/excalidraw/index.css", () => ({}))
vi.mock("@excalidraw/excalidraw", () => ({
  Excalidraw: () => <div data-testid="excalidraw-canvas">Excalidraw Mock</div>,
}))

vi.mock("@/features/projects/hooks/useProjectsQuery", () => ({
  useProjectsQuery: vi.fn(() => ({ data: [] })),
}))

vi.mock("@/features/whiteboard/hooks/useWhiteboardsQuery", () => ({
  useWhiteboardsQuery: vi.fn(),
  useCreateWhiteboardMutation: vi.fn(),
  useUpdateWhiteboardMutation: vi.fn(),
  useDeleteWhiteboardMutation: vi.fn(),
  useRealtimeWhiteboard: vi.fn(),
}))

describe("WhiteboardPage", () => {
  it("renders official Excalidraw canvas, meeting notes panel, directory, settings, and delete confirmation", () => {
    vi.mocked(wbQueries.useWhiteboardsQuery).mockReturnValue({
      isLoading: false,
      data: [
        {
          id: "wb-1",
          title: "Sprint 14 Architecture",
          workspaceId: "ws-1",
          projectId: null,
          projectName: null,
          createdById: "u-1",
          createdByName: "Alice",
          updatedByName: "Alice",
          canvasJson: "[]",
          meetingNotes: "## Agenda\n- Review Kafka flow",
          version: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    } as unknown as ReturnType<typeof wbQueries.useWhiteboardsQuery>)

    const noop = { mutate: vi.fn(), isPending: false }
    vi.mocked(wbQueries.useCreateWhiteboardMutation).mockReturnValue(
      noop as unknown as ReturnType<typeof wbQueries.useCreateWhiteboardMutation>
    )
    vi.mocked(wbQueries.useUpdateWhiteboardMutation).mockReturnValue(
      noop as unknown as ReturnType<typeof wbQueries.useUpdateWhiteboardMutation>
    )
    vi.mocked(wbQueries.useDeleteWhiteboardMutation).mockReturnValue(
      noop as unknown as ReturnType<typeof wbQueries.useDeleteWhiteboardMutation>
    )

    const store = configureStore({
      reducer: { theme: themeReducer },
    })
    const queryClient = new QueryClient()
    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <WhiteboardPage />
        </QueryClientProvider>
      </Provider>
    )

    expect(screen.getByText("Meeting Whiteboards")).toBeInTheDocument()
    expect(screen.getAllByText("Sprint 14 Architecture").length).toBeGreaterThan(0)
    expect(screen.getByText(/Live Sync · v3/)).toBeInTheDocument()
    expect(screen.getByTestId("excalidraw-canvas")).toBeInTheDocument()
    expect(screen.getByText(/Meeting Notes & Textual Summary/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Checklist" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Save meeting notes" })).toBeInTheDocument()
    expect(screen.getByText("22/180")).toBeInTheDocument()
    expect(screen.getByText(/Auto-save · 5s/)).toBeInTheDocument()

    const newBoardBtn = screen.getByRole("button", { name: "New Whiteboard" })
    fireEvent.click(newBoardBtn)
    expect(screen.getByText("Create Meeting Whiteboard")).toBeInTheDocument()
    expect(screen.getByLabelText("Board Title")).toBeInTheDocument()
    expect(screen.getByText("Initial Studio Settings")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))

    const boardsBtn = screen.getByRole("button", { name: "Available whiteboards list" })
    fireEvent.click(boardsBtn)
    expect(screen.getByText(/Available Whiteboards \(1\)/)).toBeInTheDocument()
    expect(screen.getByLabelText("Search available whiteboards")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Back to Studio" }))

    const settingsBtn = screen.getByRole("button", { name: "Whiteboard settings" })
    fireEvent.click(settingsBtn)
    expect(screen.getByText("Whiteboard Settings")).toBeInTheDocument()
    expect(screen.getByText("Auto-Save Changes")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Canvas & Style" }))
    expect(screen.getByText("Default Canvas Grid")).toBeInTheDocument()
    expect(screen.getByText("Default Sketch Sloppiness")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Visibility" }))
    expect(screen.getByText(/Presentation \(Read-Only\) Mode/)).toBeInTheDocument()
    expect(screen.getByText("Change Board Visibility")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Apply Visibility" })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Done" }))

    fireEvent.click(screen.getByRole("button", { name: "Delete whiteboard" }))
    expect(screen.getByText("Delete Whiteboard?")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Delete Whiteboard" })).toBeInTheDocument()
  })

  it("supports F / Escape focus mode toggling and Ctrl+S save keyboard shortcuts", () => {
    vi.mocked(wbQueries.useWhiteboardsQuery).mockReturnValue({
      isLoading: false,
      data: [
        {
          id: "wb-1",
          title: "Architecture Board",
          workspaceId: "ws-1",
          projectId: null,
          projectName: null,
          createdById: "u-1",
          createdByName: "Alice",
          updatedByName: "Alice",
          canvasJson: "[]",
          meetingNotes: "",
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    } as unknown as ReturnType<typeof wbQueries.useWhiteboardsQuery>)

    const updateMutate = vi.fn()
    const noop = { mutate: vi.fn(), isPending: false }
    vi.mocked(wbQueries.useCreateWhiteboardMutation).mockReturnValue(
      noop as unknown as ReturnType<typeof wbQueries.useCreateWhiteboardMutation>
    )
    vi.mocked(wbQueries.useUpdateWhiteboardMutation).mockReturnValue({
      mutate: updateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof wbQueries.useUpdateWhiteboardMutation>)
    vi.mocked(wbQueries.useDeleteWhiteboardMutation).mockReturnValue(
      noop as unknown as ReturnType<typeof wbQueries.useDeleteWhiteboardMutation>
    )

    const store = configureStore({ reducer: { theme: themeReducer } })
    const queryClient = new QueryClient()
    render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <WhiteboardPage />
        </QueryClientProvider>
      </Provider>
    )

    // Focus Mode keyboard shortcut (F toggles in, Escape exits)
    expect(screen.getByText("Meeting Whiteboards")).toBeInTheDocument()
    fireEvent.keyDown(window, { key: "f" })
    expect(screen.queryByText("Meeting Whiteboards")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Exit focus mode" })).toBeInTheDocument()

    fireEvent.keyDown(window, { key: "Escape" })
    expect(screen.getByText("Meeting Whiteboards")).toBeInTheDocument()

    // Ctrl+S triggers Save & Broadcast
    fireEvent.keyDown(window, { key: "s", ctrlKey: true })
    expect(updateMutate).toHaveBeenCalled()
  })
})
