import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import WorkflowRuleEditorPage from "./WorkflowRuleEditorPage"

vi.mock("@/features/projects/hooks/useProjectsQuery", () => ({
  useProjectDetailQuery: () => ({
    data: {
      id: "proj-1",
      name: "Project Titan",
      members: [
        {
          user: { id: "user-1", firstName: "Alice", lastName: "Smith" },
          projectRole: "DEVELOPER",
        },
      ],
    },
    isLoading: false,
    error: null,
  }),
  useProjectMembersQuery: () => ({
    data: {
      content: [
        {
          id: "member-1",
          user: { id: "user-1", firstName: "Alice", lastName: "Smith" },
          projectRole: "DEVELOPER",
        },
      ],
    },
    isLoading: false,
    error: null,
  }),
}))

vi.mock("@/features/workflow/hooks/useWorkflowRulesQuery", () => ({
  useWorkflowRulesQuery: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useCreateWorkflowRuleMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateWorkflowRuleMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

describe("WorkflowRuleEditorPage", () => {
  const queryClient = new QueryClient()

  it("renders dedicated workflow rule editor with 4 configuration sections", () => {
    render(
      <MemoryRouter initialEntries={["/app/projects/proj-1/rules/editor"]}>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route
              path="/app/projects/:projectId/rules/editor"
              element={<WorkflowRuleEditorPage />}
            />
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>
    )

    expect(
      screen.getByRole("heading", { name: "Create Workflow Rule" })
    ).toBeInTheDocument()
    expect(screen.getByText("1. Rule Definition")).toBeInTheDocument()
    expect(screen.getByText("2. Trigger (When this happens)")).toBeInTheDocument()
    expect(screen.getByText("3. Conditions (Only if)")).toBeInTheDocument()
    expect(screen.getByText("4. Actions (Perform these operations) *")).toBeInTheDocument()
    expect(screen.getByText("Back to Project")).toBeInTheDocument()
  })
})
