import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WorkflowRulesList } from "./WorkflowRulesList"

vi.mock("../hooks/useWorkflowRulesQuery", () => ({
  useWorkflowRulesQuery: () => ({
    data: [
      {
        id: "rule-1",
        name: "Auto-escalate high priority bugs",
        description: "Escalates priority when status is in progress",
        projectId: "proj-1",
        triggerType: "TASK_STATUS_CHANGED",
        conditionsJson: JSON.stringify([
          { field: "priority", operator: "EQUALS", value: "HIGH" },
        ]),
        actionsJson: JSON.stringify([
          { type: "CHANGE_PRIORITY", parameters: { priority: "URGENT" } },
        ]),
        isEnabled: true,
        createdAt: "2026-10-25T12:00:00Z",
        updatedAt: "2026-10-25T12:00:00Z",
      },
    ],
    isLoading: false,
    isError: false,
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
  useToggleWorkflowRuleMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDeleteWorkflowRuleMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useWorkflowRuleExecutionsQuery: () => ({
    data: [],
    isLoading: false,
  }),
}))

describe("WorkflowRulesList", () => {
  const queryClient = new QueryClient()

  it("renders workflow rules and details properly", () => {
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <WorkflowRulesList projectId="proj-1" canManage={true} />
        </QueryClientProvider>
      </MemoryRouter>
    )

    expect(screen.getByText("Workflow Automation")).toBeInTheDocument()
    expect(screen.getByText("Auto-escalate high priority bugs")).toBeInTheDocument()
    expect(screen.getByText("When task status changes")).toBeInTheDocument()
    expect(screen.getByText("Add Rule")).toBeInTheDocument()
  })
})
