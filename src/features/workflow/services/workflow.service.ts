import api from "@/config/api"
import type { ApiResponse } from "@/features/tasks/types/task.types"
import type {
  WorkflowRule,
  CreateWorkflowRuleRequest,
  UpdateWorkflowRuleRequest,
  WorkflowExecutionLog,
} from "../types/workflow.types"

export async function getWorkflowRules(projectId: string): Promise<WorkflowRule[]> {
  const res = await api.get<ApiResponse<WorkflowRule[]>>(`/projects/${projectId}/workflow-rules`)
  return res.data.data || []
}

export async function getWorkflowRuleById(ruleId: string): Promise<WorkflowRule> {
  const res = await api.get<ApiResponse<WorkflowRule>>(`/workflow-rules/${ruleId}`)
  return res.data.data
}

export async function createWorkflowRule(
  projectId: string,
  request: CreateWorkflowRuleRequest
): Promise<WorkflowRule> {
  const res = await api.post<ApiResponse<WorkflowRule>>(`/projects/${projectId}/workflow-rules`, request)
  return res.data.data
}

export async function updateWorkflowRule(
  ruleId: string,
  request: UpdateWorkflowRuleRequest
): Promise<WorkflowRule> {
  const res = await api.put<ApiResponse<WorkflowRule>>(`/workflow-rules/${ruleId}`, request)
  return res.data.data
}

export async function toggleWorkflowRule(ruleId: string): Promise<WorkflowRule> {
  const res = await api.patch<ApiResponse<WorkflowRule>>(`/workflow-rules/${ruleId}/toggle`)
  return res.data.data
}

export async function deleteWorkflowRule(ruleId: string): Promise<void> {
  await api.delete<ApiResponse<void>>(`/workflow-rules/${ruleId}`)
}

export async function getWorkflowRuleExecutions(ruleId: string): Promise<WorkflowExecutionLog[]> {
  const res = await api.get<ApiResponse<WorkflowExecutionLog[]>>(`/workflow-rules/${ruleId}/executions`)
  return res.data.data || []
}
