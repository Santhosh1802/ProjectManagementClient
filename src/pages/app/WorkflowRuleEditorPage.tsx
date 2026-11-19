import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import {
  ArrowLeft,
  Zap,
  Plus,
  Trash2,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Sparkles,
  ShieldAlert,
} from "lucide-react"

import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import ShortcutHint from "@/components/common/ShortcutHint"
import { submitFormOnModEnter, toAriaKeyShortcuts } from "@/lib/keyboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"

import {
  useProjectDetailQuery,
  useProjectMembersQuery,
} from "@/features/projects/hooks/useProjectsQuery"
import type { ProjectMember } from "@/features/projects/types/project.types"
import {
  useWorkflowRulesQuery,
  useCreateWorkflowRuleMutation,
  useUpdateWorkflowRuleMutation,
} from "@/features/workflow/hooks/useWorkflowRulesQuery"
import type {
  RuleTriggerType,
  RuleCondition,
  RuleAction,
  ConditionField,
  ConditionOperator,
  ActionType,
} from "@/features/workflow/types/workflow.types"
import { getApiErrorMessage } from "@/lib/apiError"

export default function WorkflowRuleEditorPage() {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const [searchParams] = useSearchParams()
  const ruleId = searchParams.get("ruleId")
  const isEditing = Boolean(ruleId)

  // Load project details (for context)
  const { data: project, isLoading: isProjectLoading } = useProjectDetailQuery(projectId)

  // Load project members (for member assignee selector)
  const { data: memberData } = useProjectMembersQuery(
    { projectId: projectId || "", page: 0, size: 100 },
    { enabled: Boolean(projectId) }
  )
  const members: ProjectMember[] = memberData?.content || []

  // Load rules for this project to retrieve rule data if in edit mode
  const { data: rules = [], isLoading: isRulesLoading } = useWorkflowRulesQuery(projectId)

  const createMutation = useCreateWorkflowRuleMutation(projectId || "")
  const updateMutation = useUpdateWorkflowRuleMutation(projectId || "")

  // Form State
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [triggerType, setTriggerType] = useState<RuleTriggerType>("TASK_CREATED")
  const [conditions, setConditions] = useState<RuleCondition[]>([])
  const [actions, setActions] = useState<RuleAction[]>([
    { type: "CHANGE_PRIORITY", parameters: { priority: "HIGH" } },
  ])
  const [validationError, setValidationError] = useState<string | null>(null)

  // Populate data when editing
  useEffect(() => {
    if (ruleId && rules.length > 0) {
      const existing = rules.find((r) => r.id === ruleId)
      if (existing) {
        setName(existing.name)
        setDescription(existing.description || "")
        setTriggerType(existing.triggerType)
        try {
          setConditions(JSON.parse(existing.conditionsJson || "[]"))
        } catch {
          setConditions([])
        }
        try {
          const parsedActions = JSON.parse(existing.actionsJson || "[]")
          setActions(parsedActions.length > 0 ? parsedActions : [
            { type: "CHANGE_PRIORITY", parameters: { priority: "HIGH" } },
          ])
        } catch {
          setActions([{ type: "CHANGE_PRIORITY", parameters: { priority: "HIGH" } }])
        }
      }
    }
  }, [ruleId, rules])

  // Helpers
  const addCondition = () => {
    setConditions((prev) => [
      ...prev,
      { field: "status", operator: "EQUALS", value: "TODO" },
    ])
  }

  const removeCondition = (index: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== index))
  }

  const updateCondition = (
    index: number,
    field: ConditionField,
    operator: ConditionOperator,
    value?: string
  ) => {
    setConditions((prev) => {
      const next = [...prev]
      next[index] = { field, operator, value }
      return next
    })
  }

  const addAction = () => {
    setActions((prev) => [
      ...prev,
      { type: "CHANGE_PRIORITY", parameters: { priority: "HIGH" } },
    ])
  }

  const removeAction = (index: number) => {
    if (actions.length <= 1) return
    setActions((prev) => prev.filter((_, i) => i !== index))
  }

  const updateActionType = (index: number, type: ActionType) => {
    setActions((prev) => {
      const next = [...prev]
      let defaultParams: Record<string, string> = {}
      if (type === "CHANGE_STATUS") defaultParams = { status: "IN_PROGRESS" }
      if (type === "CHANGE_PRIORITY") defaultParams = { priority: "HIGH" }
      if (type === "ASSIGN_TO_USER") {
        const firstMemberId = members[0]?.user?.id || ""
        defaultParams = { userId: firstMemberId }
      }
      if (type === "SEND_NOTIFICATION") {
        defaultParams = { message: "Task has been updated by automation rule." }
      }
      next[index] = { type, parameters: defaultParams }
      return next
    })
  }

  const updateActionParam = (index: number, key: string, value: string) => {
    setActions((prev) => {
      const next = [...prev]
      next[index] = {
        ...next[index],
        parameters: {
          ...next[index].parameters,
          [key]: value,
        },
      }
      return next
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!name.trim()) {
      setValidationError("Please enter a name for the workflow rule.")
      return
    }

    if (actions.length === 0) {
      setValidationError("At least one action is required.")
      return
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      triggerType,
      conditionsJson: JSON.stringify(conditions),
      actionsJson: JSON.stringify(actions),
    }

    try {
      if (isEditing && ruleId) {
        await updateMutation.mutateAsync({
          ruleId,
          request: payload,
        })
        toast.add({
          type: "success",
          title: "Workflow rule updated",
          description: `"${name}" has been updated successfully.`,
        })
      } else {
        await createMutation.mutateAsync(payload)
        toast.add({
          type: "success",
          title: "Workflow rule created",
          description: `"${name}" has been configured and is active.`,
        })
      }
      navigate(`/app/projects/${projectId}`)
    } catch (err) {
      const errMsg = getApiErrorMessage(err, "Failed to save workflow rule.")
      setValidationError(errMsg)
      toast.add({
        type: "error",
        title: "Save failed",
        description: errMsg,
      })
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending
  const isPageLoading = isProjectLoading || (isEditing && isRulesLoading)

  return (
    <PageContainer>
      {/* Top back navigation & Header */}
      <div className="mb-6">
        <Button
          type="button"
          variant="ghost"
          className="mb-4 -ml-3 gap-2"
          onClick={() => navigate(`/app/projects/${projectId}`)}
        >
          <ArrowLeft className="size-4" />
          Back to Project
        </Button>

        <PageHeader
          title={isEditing ? "Edit Workflow Rule" : "Create Workflow Rule"}
          description={
            project
              ? `Configure automated event-driven task actions for ${project.name}.`
              : "Configure automated event-driven task actions."
          }
          className="mb-0"
        />
      </div>

      {isPageLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          onKeyDown={submitFormOnModEnter}
          aria-keyshortcuts={toAriaKeyShortcuts(["mod", "Enter"])}
          className="space-y-6 max-w-4xl"
        >
          {validationError && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <ShieldAlert className="size-5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <Card>
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Zap className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base">1. Rule Definition</CardTitle>
                  <CardDescription className="text-xs">
                    Give this automation rule a clear title and purpose.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="space-y-2">
                <Label htmlFor="rule-name" className="text-sm font-medium">
                  Rule Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rule-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Automatically escalate bug tasks to Urgent priority"
                  className="max-w-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rule-description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="rule-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe when and why this rule should run (optional)..."
                  className="max-w-xl"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Trigger Event */}
          <Card>
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base">2. Trigger (When this happens)</CardTitle>
                  <CardDescription className="text-xs">
                    Choose the task lifecycle event that activates this rule.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-2 max-w-md">
                <Label htmlFor="rule-trigger" className="text-sm font-medium">
                  Event Trigger <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={triggerType}
                  onValueChange={(val) => setTriggerType(val as RuleTriggerType)}
                >
                  <SelectTrigger id="rule-trigger">
                    <SelectValue placeholder="Select trigger event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TASK_CREATED">
                      <div className="flex flex-col">
                        <span className="font-medium">Task is Created</span>
                        <span className="text-xs text-muted-foreground">Runs immediately after a new task is created</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="TASK_STATUS_CHANGED">
                      <div className="flex flex-col">
                        <span className="font-medium">Task Status Changes</span>
                        <span className="text-xs text-muted-foreground">Runs whenever a task transitions between status states</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="TASK_ASSIGNED">
                      <div className="flex flex-col">
                        <span className="font-medium">Task Assigned or Reassigned</span>
                        <span className="text-xs text-muted-foreground">Runs when a task is assigned or its assignee changes</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="TASK_DUE_DATE_CHANGED">
                      <div className="flex flex-col">
                        <span className="font-medium">Task Due Date Changes</span>
                        <span className="text-xs text-muted-foreground">Runs when the target completion date is modified</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Conditions (If) */}
          <Card>
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <HelpCircle className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">3. Conditions (Only if)</CardTitle>
                    <CardDescription className="text-xs">
                      All conditions must evaluate to true. If no conditions are added, the rule executes for all tasks.
                    </CardDescription>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCondition}
                  className="gap-1.5 h-8 text-xs shrink-0 self-start sm:self-center"
                >
                  <Plus className="size-3.5" />
                  Add Condition
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {conditions.length === 0 ? (
                <div className="rounded-lg border border-dashed py-8 px-4 text-center bg-muted/10">
                  <p className="text-sm font-medium text-foreground/80">No conditions set</p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                    This rule will execute unconditionally whenever the trigger event occurs.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addCondition}
                    className="mt-3 gap-1.5 text-xs"
                  >
                    <Plus className="size-3.5" />
                    Add a filter condition
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {conditions.map((cond, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-lg border bg-card/60 p-3 shadow-xs"
                    >
                      <Badge variant="outline" className="text-xs px-2 py-1 self-start sm:self-center shrink-0">
                        {idx === 0 ? "IF" : "AND"}
                      </Badge>

                      {/* Field */}
                      <Select
                        value={cond.field}
                        onValueChange={(val) =>
                          updateCondition(
                            idx,
                            val as ConditionField,
                            cond.operator,
                            val === "assignee" ? undefined : cond.value || "TODO"
                          )
                        }
                      >
                        <SelectTrigger className="w-full sm:w-36">
                          <SelectValue placeholder="Field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="status">Status</SelectItem>
                          <SelectItem value="priority">Priority</SelectItem>
                          <SelectItem value="assignee">Assignee</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Operator */}
                      <Select
                        value={cond.operator}
                        onValueChange={(val) =>
                          updateCondition(idx, cond.field, val as ConditionOperator, cond.value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {cond.field === "assignee" ? (
                            <>
                              <SelectItem value="IS_UNASSIGNED">Is Unassigned</SelectItem>
                              <SelectItem value="IS_ASSIGNED">Is Assigned</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="EQUALS">Equals</SelectItem>
                              <SelectItem value="NOT_EQUALS">Does Not Equal</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>

                      {/* Value based on field */}
                      {cond.field === "status" && (
                        <Select
                          value={cond.value || "TODO"}
                          onValueChange={(val) =>
                            updateCondition(idx, cond.field, cond.operator, val ?? "TODO")
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TODO">To Do</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="REVIEW">Review</SelectItem>
                            <SelectItem value="DONE">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {cond.field === "priority" && (
                        <Select
                          value={cond.value || "MEDIUM"}
                          onValueChange={(val) =>
                            updateCondition(idx, cond.field, cond.operator, val ?? "MEDIUM")
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="URGENT">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {cond.field === "assignee" && (
                        <div className="flex-1 px-3 py-2 text-xs text-muted-foreground italic rounded-md bg-muted/30">
                          {cond.operator === "IS_UNASSIGNED"
                            ? "Matches tasks with no assigned member"
                            : "Matches tasks assigned to any member"}
                        </div>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCondition(idx)}
                        className="size-8 text-muted-foreground hover:text-destructive self-end sm:self-center shrink-0"
                        title="Remove condition"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 4: Actions (Then) */}
          <Card>
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">4. Actions (Perform these operations) *</CardTitle>
                    <CardDescription className="text-xs">
                      Actions are safely executed in sequential order without recursion.
                    </CardDescription>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAction}
                  className="gap-1.5 h-8 text-xs shrink-0 self-start sm:self-center"
                >
                  <Plus className="size-3.5" />
                  Add Action
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-3">
                {actions.map((act, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-lg border bg-card/60 p-3 shadow-xs"
                  >
                    <Badge variant="secondary" className="text-xs px-2 py-1 self-start sm:self-center shrink-0">
                      STEP {idx + 1}
                    </Badge>

                    {/* Action Type */}
                    <Select
                      value={act.type}
                      onValueChange={(val) => updateActionType(idx, val as ActionType)}
                    >
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CHANGE_PRIORITY">Change Priority</SelectItem>
                        <SelectItem value="CHANGE_STATUS">Change Status</SelectItem>
                        <SelectItem value="ASSIGN_TO_USER">Assign to Member</SelectItem>
                        <SelectItem value="SEND_NOTIFICATION">Send Notification</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Parameter: Status */}
                    {act.type === "CHANGE_STATUS" && (
                      <Select
                        value={act.parameters.status || "IN_PROGRESS"}
                        onValueChange={(val) => updateActionParam(idx, "status", val ?? "IN_PROGRESS")}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TODO">To Do</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="REVIEW">Review</SelectItem>
                          <SelectItem value="DONE">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {/* Parameter: Priority */}
                    {act.type === "CHANGE_PRIORITY" && (
                      <Select
                        value={act.parameters.priority || "HIGH"}
                        onValueChange={(val) => updateActionParam(idx, "priority", val ?? "HIGH")}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {/* Parameter: Assign to member */}
                    {act.type === "ASSIGN_TO_USER" && (
                      <Select
                        value={act.parameters.userId || (members[0]?.user?.id ?? "")}
                        onValueChange={(val) => updateActionParam(idx, "userId", val ?? "")}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map((m: ProjectMember) => (
                            <SelectItem key={m.user.id} value={m.user.id}>
                              {m.user.firstName} {m.user.lastName} ({m.projectRole})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Parameter: Notification message */}
                    {act.type === "SEND_NOTIFICATION" && (
                      <Input
                        value={act.parameters.message || ""}
                        onChange={(e) => updateActionParam(idx, "message", e.target.value)}
                        placeholder="Notification message to recipient"
                        className="flex-1"
                      />
                    )}

                    {actions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAction(idx)}
                        className="size-8 text-muted-foreground hover:text-destructive self-end sm:self-center shrink-0"
                        title="Remove action"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/app/projects/${projectId}`)}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="w-full sm:w-auto gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving Rule...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>{isEditing ? "Update Workflow Rule" : "Create Workflow Rule"}</span>
                  <ShortcutHint
                    keys={["mod", "Enter"]}
                    compact
                    decorative
                    variant="onPrimary"
                    className="hidden sm:inline-flex ml-1"
                  />
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </PageContainer>
  )
}
