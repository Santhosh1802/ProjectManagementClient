import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import SavedViewsBar from "../components/SavedViewsBar"

// Mock hooks
vi.mock("../hooks/useSavedViewsQuery", () => ({
  useSavedViewsQuery: () => ({
    data: [
      {
        id: "view-1",
        name: "My Bugs",
        viewTarget: "TASKS",
        filtersJson: "{\"status\":\"TODO\"}",
        isDefault: true,
        isShared: false,
        isOwnedByCurrentUser: true,
      },
    ],
    isLoading: false,
  }),
  useCreateSavedViewMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeleteSavedViewMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

describe("SavedViewsBar Component", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  it("renders Saved Views trigger button with active or default text", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SavedViewsBar
          target="TASKS"
          currentFiltersJson="{}"
          activeViewId={null}
          onApplyView={vi.fn()}
          onClearActiveView={vi.fn()}
        />
      </QueryClientProvider>
    )

    expect(screen.getByText("Saved Views")).toBeDefined()
  })

  it("renders active view name when activeViewId is matched", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SavedViewsBar
          target="TASKS"
          currentFiltersJson="{}"
          activeViewId="view-1"
          onApplyView={vi.fn()}
          onClearActiveView={vi.fn()}
        />
      </QueryClientProvider>
    )

    expect(screen.getByText("My Bugs")).toBeDefined()
  })
})
