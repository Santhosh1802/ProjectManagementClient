import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import ProjectPage from "./ProjectPage"
import * as projectsQuery from "@/features/projects/hooks/useProjectsQuery"
import { renderWithProviders } from "@/test/testUtils"

vi.mock("@/features/projects/hooks/useProjectsQuery", () => ({
  useProjectsQuery: vi.fn(),
}))

vi.mock("@/features/savedviews/hooks/useSavedViewsQuery", () => ({
  useSavedViewsQuery: vi.fn(() => ({ data: [], isLoading: false })),
  useCreateSavedViewMutation: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteSavedViewMutation: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}))

const owner = {
  id: "u-1",
  firstName: "Alice",
  lastName: "Owner",
  email: "alice@example.com",
}

const sampleProjects = [
  {
    id: "p-1",
    name: "Alpha Platform",
    description: "Core backend services",
    projectStatus: "ACTIVE" as const,
    startDate: "2026-01-01T00:00:00Z",
    dueDate: "2020-01-01T00:00:00Z", // overdue
    owner,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
  },
  {
    id: "p-2",
    name: "Beta Mobile",
    description: "iOS and Android client",
    projectStatus: "PLANNING" as const,
    startDate: "2026-01-01T00:00:00Z",
    dueDate: "2099-12-31T00:00:00Z", // far future
    owner,
    createdAt: "2026-01-03T00:00:00Z",
    updatedAt: "2026-01-04T00:00:00Z",
  },
]

describe("ProjectPage Directory, Views, Filters & Pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectsQuery.useProjectsQuery).mockReturnValue({
      data: {
        content: sampleProjects,
        page: 0,
        size: 10,
        totalElements: 25,
        totalPages: 3,
        first: true,
        last: false,
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof projectsQuery.useProjectsQuery>)
  })

  it("renders projects, switches Card/List/Table views, and updates page via DataPagination", async () => {
    const { store } = renderWithProviders(<ProjectPage />, {
      route: "/app/projects",
    })

    expect(screen.getByText("Alpha Platform")).toBeInTheDocument()
    expect(screen.getByText("Beta Mobile")).toBeInTheDocument()
    expect(screen.getByText("1–10")).toBeInTheDocument()

    // Switch to List view
    fireEvent.click(screen.getByRole("button", { name: "List view" }))
    expect(screen.getByText("Alpha Platform")).toBeInTheDocument()

    // Switch to Table view
    fireEvent.click(screen.getByRole("button", { name: "Table view" }))
    expect(screen.getByRole("table")).toBeInTheDocument()

    // Click Page 2 in DataPagination
    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }))
    await waitFor(() => {
      expect(store.getState().project.page).toBe(1)
    })
  })

  it("applies dueDate=OVERDUE filter and resets active filters cleanly", async () => {
    renderWithProviders(<ProjectPage />, {
      route: "/app/projects?dueDate=OVERDUE&search=Alpha",
    })

    expect(screen.getByText("Alpha Platform")).toBeInTheDocument()
    expect(screen.queryByText("Beta Mobile")).not.toBeInTheDocument()
    expect(screen.getByText(/Due: OVERDUE/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Reset all" }))
    await waitFor(() => {
      expect(screen.getByText("Beta Mobile")).toBeInTheDocument()
    })
  })
})
