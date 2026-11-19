import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WorkflowRulesList } from "./WorkflowRulesList"
import * as workflowHooks from "../hooks/useWorkflowRulesQuery"

vi.mock("../hooks/useWorkflowRulesQuery", () => ({
  useWorkflowRulesQuery: vi.fn(),
  useCreateWorkflowRuleMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateWorkflowRuleMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useToggleWorkflowRuleMutation: vi.fn(),
  useDeleteWorkflowRuleMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useWorkflowRuleExecutionsQuery: vi.fn(),
}))

const singleRule = {
  id: "rule-1",
  name: "Auto-escalate high priority bugs",
  description: "Escalates priority when status is in progress",
  projectId: "proj-1",
  triggerType: "TASK_STATUS_CHANGED" as const,
  conditionsJson: JSON.stringify([
    { field: "priority", operator: "EQUALS", value: "HIGH" },
  ]),
  actionsJson: JSON.stringify([
    { type: "CHANGE_PRIORITY", parameters: { priority: "URGENT" } },
  ]),
  isEnabled: true,
  createdAt: "2026-10-25T12:00:00Z",
  updatedAt: "2026-10-25T12:00:00Z",
}

describe("WorkflowRulesList", () => {
  const toggleMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(workflowHooks.useWorkflowRulesQuery).mockReturnValue({
      data: [singleRule],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof workflowHooks.useWorkflowRulesQuery>)

    vi.mocked(workflowHooks.useToggleWorkflowRuleMutation).mockReturnValue({
      mutate: toggleMutate,
      isPending: false,
    } as unknown as ReturnType<typeof workflowHooks.useToggleWorkflowRuleMutation>)

    vi.mocked(workflowHooks.useWorkflowRuleExecutionsQuery).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof workflowHooks.useWorkflowRuleExecutionsQuery>)
  })

  it("renders workflow rules and details properly", () => {
    const queryClient = new QueryClient()
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

  it("paginates 7 rules (5 per page), filters by search, toggles rules, and paginates execution history runs", () => {
    vi.mocked(workflowHooks.useWorkflowRulesQuery).mockReturnValue({
      data: Array.from({ length: 7 }, (_, i) => ({
        ...singleRule,
        id: `rule-${i + 1}`,
        name: `Automation Rule #${i + 1}`,
      })),
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof workflowHooks.useWorkflowRulesQuery>)

    vi.mocked(workflowHooks.useWorkflowRuleExecutionsQuery).mockReturnValue({
      data: Array.from({ length: 7 }, (_, i) => ({
        id: `exec-${i + 1}`,
        ruleId: "rule-1",
        status: i === 6 ? "FAILED" : "SUCCESS",
        triggerType: "TASK_CREATED",
        executedAt: "2026-11-18T12:00:00Z",
        errorMessage: i === 6 ? "Target user missing" : null,
        actionsExecutedJson: JSON.stringify([{ type: "CHANGE_PRIORITY" }]),
      })),
      isLoading: false,
    } as unknown as ReturnType<typeof workflowHooks.useWorkflowRuleExecutionsQuery>)

    const queryClient = new QueryClient()
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <WorkflowRulesList projectId="proj-1" canManage={true} />
        </QueryClientProvider>
      </MemoryRouter>
    )

    expect(screen.getByText("Automation Rule #1")).toBeInTheDocument()
    expect(screen.queryByText("Automation Rule #6")).not.toBeInTheDocument()
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()

    // Navigate to Page 2 of workflow rules
    fireEvent.click(screen.getByRole("button", { name: /Next/i }))
    expect(screen.getByText("Automation Rule #6")).toBeInTheDocument()
    expect(screen.getByText("Automation Rule #7")).toBeInTheDocument()

    // Search automation rules
    fireEvent.change(screen.getByLabelText("Search automation rules"), {
      target: { value: "Rule #1" },
    })
    expect(screen.getByText("Automation Rule #1")).toBeInTheDocument()
    expect(screen.queryByText("Automation Rule #6")).not.toBeInTheDocument()

    // Toggle active checkbox
    fireEvent.click(screen.getByRole("checkbox", { name: "Toggle rule" }))
    expect(toggleMutate).toHaveBeenCalledWith("rule-1")

    // Open Execution History dialog and paginate runs (5 per page)
    fireEvent.click(screen.getByRole("button", { name: /Runs/i }))
    expect(screen.getByText("Execution History")).toBeInTheDocument()
    expect(screen.queryByText("Target user missing")).not.toBeInTheDocument()

    const dialogNextButtons = screen.getAllByRole("button", { name: /Next/i })
    fireEvent.click(dialogNextButtons[dialogNextButtons.length - 1])
    expect(screen.getByText("Target user missing")).toBeInTheDocument()
  })
})
