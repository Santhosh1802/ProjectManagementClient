export type RuleTriggerType =
  | "TASK_CREATED"
  | "TASK_STATUS_CHANGED"
  | "TASK_ASSIGNED"
  | "TASK_DUE_DATE_CHANGED"

export type ConditionField = "status" | "priority" | "assignee"

export type ConditionOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "IS_UNASSIGNED"
  | "IS_ASSIGNED"

export interface RuleCondition {
  field: ConditionField
  operator: ConditionOperator
  value?: string
}

export type ActionType =
  | "CHANGE_STATUS"
  | "CHANGE_PRIORITY"
  | "ASSIGN_TO_USER"
  | "SEND_NOTIFICATION"

export interface RuleAction {
  type: ActionType
  parameters: Record<string, string>
}

export type ExecutionStatus = "SUCCESS" | "SKIPPED" | "FAILED"

export interface WorkflowRule {
  id: string
  name: string
  description?: string
  projectId: string
  projectName?: string
  triggerType: RuleTriggerType
  conditionsJson: string
  actionsJson: string
  isEnabled: boolean
  createdById?: string
  createdByName?: string
  lastTriggeredAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateWorkflowRuleRequest {
  name: string
  description?: string
  triggerType: RuleTriggerType
  conditionsJson: string
  actionsJson: string
  isEnabled?: boolean
}

export interface UpdateWorkflowRuleRequest {
  name: string
  description?: string
  triggerType: RuleTriggerType
  conditionsJson: string
  actionsJson: string
  isEnabled?: boolean
}

export interface WorkflowExecutionLog {
  id: string
  ruleId: string
  ruleName: string
  projectId: string
  taskId: string
  triggerType: RuleTriggerType
  status: ExecutionStatus
  actionsExecutedJson?: string
  errorMessage?: string
  executedAt: string
}
