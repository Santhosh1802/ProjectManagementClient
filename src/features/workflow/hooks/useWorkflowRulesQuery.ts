import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { workflowKeys } from "@/lib/queryKeys"
import {
  getWorkflowRules,
  createWorkflowRule,
  updateWorkflowRule,
  toggleWorkflowRule,
  deleteWorkflowRule,
  getWorkflowRuleExecutions,
} from "../services/workflow.service"
import type {
  CreateWorkflowRuleRequest,
  UpdateWorkflowRuleRequest,
} from "../types/workflow.types"
import { toast } from "@/components/ui/toast"

export function useWorkflowRulesQuery(projectId?: string) {
  return useQuery({
    queryKey: workflowKeys.byProject(projectId || ""),
    queryFn: () => getWorkflowRules(projectId!),
    enabled: Boolean(projectId),
    staleTime: 30 * 1000,
  })
}

export function useWorkflowRuleExecutionsQuery(ruleId?: string) {
  return useQuery({
    queryKey: workflowKeys.executions(ruleId || ""),
    queryFn: () => getWorkflowRuleExecutions(ruleId!),
    enabled: Boolean(ruleId),
    staleTime: 10 * 1000,
  })
}

export function useCreateWorkflowRuleMutation(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateWorkflowRuleRequest) =>
      createWorkflowRule(projectId, request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.byProject(projectId) })
      toast.add({
        type: "success",
        title: "Workflow Rule",
        description: `Rule "${data.name}" created successfully`,
      })
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to create workflow rule"
      toast.add({
        type: "error",
        title: "Workflow Rule",
        description: msg,
      })
    },
  })
}

export function useUpdateWorkflowRuleMutation(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      ruleId,
      request,
    }: {
      ruleId: string
      request: UpdateWorkflowRuleRequest
    }) => updateWorkflowRule(ruleId, request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.byProject(projectId) })
      toast.add({
        type: "success",
        title: "Workflow Rule",
        description: `Rule "${data.name}" updated successfully`,
      })
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update workflow rule"
      toast.add({
        type: "error",
        title: "Workflow Rule",
        description: msg,
      })
    },
  })
}

export function useToggleWorkflowRuleMutation(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ruleId: string) => toggleWorkflowRule(ruleId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.byProject(projectId) })
      toast.add({
        type: "success",
        title: "Workflow Rule",
        description: `Rule "${data.name}" is now ${data.isEnabled ? "enabled" : "disabled"}`,
      })
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to toggle workflow rule"
      toast.add({
        type: "error",
        title: "Workflow Rule",
        description: msg,
      })
    },
  })
}

export function useDeleteWorkflowRuleMutation(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ruleId: string) => deleteWorkflowRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.byProject(projectId) })
      toast.add({
        type: "success",
        title: "Workflow Rule",
        description: "Workflow rule deleted",
      })
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to delete workflow rule"
      toast.add({
        type: "error",
        title: "Workflow Rule",
        description: msg,
      })
    },
  })
}
