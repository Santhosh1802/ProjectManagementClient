import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Loader2 } from "lucide-react"
import type {
  WorkflowRule,
  RuleTriggerType,
  RuleCondition,
  RuleAction,
  ConditionField,
  ConditionOperator,
  ActionType,
} from "../types/workflow.types"
import type { ProjectMember } from "@/features/projects/types/project.types"

interface WorkflowRuleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule: WorkflowRule | null
  projectId: string
  members?: ProjectMember[]
  onSubmit: (data: {
    name: string
    description?: string
    triggerType: RuleTriggerType
    conditionsJson: string
    actionsJson: string
  }) => Promise<void>
  isSubmitting?: boolean
}

export function WorkflowRuleModal({
  open,
  onOpenChange,
  rule,
  members = [],
  onSubmit,
  isSubmitting = false,
}: WorkflowRuleModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [triggerType, setTriggerType] = useState<RuleTriggerType>("TASK_CREATED")
  const [conditions, setConditions] = useState<RuleCondition[]>([])
  const [actions, setActions] = useState<RuleAction[]>([
    { type: "CHANGE_PRIORITY", parameters: { priority: "HIGH" } },
  ])

  useEffect(() => {
    if (rule) {
      setName(rule.name)
      setDescription(rule.description || "")
      setTriggerType(rule.triggerType)
      try {
        setConditions(JSON.parse(rule.conditionsJson || "[]"))
      } catch {
        setConditions([])
      }
      try {
        setActions(JSON.parse(rule.actionsJson || "[]"))
      } catch {
        setActions([{ type: "CHANGE_PRIORITY", parameters: { priority: "HIGH" } }])
      }
    } else {
      setName("")
      setDescription("")
      setTriggerType("TASK_CREATED")
      setConditions([])
      setActions([{ type: "CHANGE_PRIORITY", parameters: { priority: "HIGH" } }])
    }
  }, [rule, open])

  const addCondition = () => {
    setConditions([
      ...conditions,
      { field: "status", operator: "EQUALS", value: "TODO" },
    ])
  }

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const updateCondition = (
    index: number,
    field: ConditionField,
    operator: ConditionOperator,
    value?: string
  ) => {
    const updated = [...conditions]
    updated[index] = { field, operator, value }
    setConditions(updated)
  }

  const addAction = () => {
    setActions([
      ...actions,
      { type: "CHANGE_PRIORITY", parameters: { priority: "MEDIUM" } },
    ])
  }

  const removeAction = (index: number) => {
    if (actions.length <= 1) return
    setActions(actions.filter((_, i) => i !== index))
  }

  const updateActionType = (index: number, type: ActionType) => {
    const updated = [...actions]
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
    updated[index] = { type, parameters: defaultParams }
    setActions(updated)
  }

  const updateActionParam = (index: number, key: string, value: string) => {
    const updated = [...actions]
    updated[index] = {
      ...updated[index],
      parameters: {
        ...updated[index].parameters,
        [key]: value,
      },
    }
    setActions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      triggerType,
      conditionsJson: JSON.stringify(conditions),
      actionsJson: JSON.stringify(actions),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>
              {rule ? "Edit Workflow Rule" : "Create Workflow Rule"}
            </DialogTitle>
            <DialogDescription>
              Configure automated task management rules triggered by project activity.
            </DialogDescription>
          </DialogHeader>

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rule-name">Rule Name *</Label>
              <Input
                id="rule-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Escalate urgent bug tasks"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rule-desc">Description</Label>
              <Textarea
                id="rule-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description of what this automation does"
                rows={2}
              />
            </div>

            {/* Trigger */}
            <div className="space-y-1.5">
              <Label htmlFor="rule-trigger">Trigger When *</Label>
              <Select
                value={triggerType}
                onValueChange={(val) => setTriggerType(val as RuleTriggerType)}
              >
                <SelectTrigger id="rule-trigger">
                  <SelectValue placeholder="Select trigger event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TASK_CREATED">Task is created</SelectItem>
                  <SelectItem value="TASK_STATUS_CHANGED">Task status changes</SelectItem>
                  <SelectItem value="TASK_ASSIGNED">Task is assigned or reassigned</SelectItem>
                  <SelectItem value="TASK_DUE_DATE_CHANGED">Task due date changes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold">Conditions (If)</h4>
                <p className="text-xs text-muted-foreground">
                  Task must meet all specified criteria. If empty, the rule applies to all tasks.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCondition}
                className="gap-1 h-8 text-xs"
              >
                <Plus className="size-3.5" />
                Add Condition
              </Button>
            </div>

            {conditions.length === 0 ? (
              <p className="text-xs italic text-muted-foreground py-2 text-center">
                Always runs when trigger occurs (no conditions).
              </p>
            ) : (
              <div className="space-y-2">
                {conditions.map((cond, idx) => (
                  <div key={idx} className="flex items-center gap-2">
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
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="assignee">Assignee</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={cond.operator}
                      onValueChange={(val) =>
                        updateCondition(idx, cond.field, val as ConditionOperator, cond.value)
                      }
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cond.field === "assignee" ? (
                          <>
                            <SelectItem value="IS_UNASSIGNED">Is unassigned</SelectItem>
                            <SelectItem value="IS_ASSIGNED">Is assigned</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="EQUALS">Equals</SelectItem>
                            <SelectItem value="NOT_EQUALS">Does not equal</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>

                    {cond.field === "status" && (
                      <Select
                        value={cond.value || "TODO"}
                        onValueChange={(val) =>
                          updateCondition(idx, cond.field, cond.operator, val ?? "TODO")
                        }
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

                    {cond.field === "priority" && (
                      <Select
                        value={cond.value || "MEDIUM"}
                        onValueChange={(val) =>
                          updateCondition(idx, cond.field, cond.operator, val ?? "MEDIUM")
                        }
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

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCondition(idx)}
                      className="size-8 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold">Actions (Then) *</h4>
                <p className="text-xs text-muted-foreground">
                  Actions executed sequentially when rule conditions are satisfied.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAction}
                className="gap-1 h-8 text-xs"
              >
                <Plus className="size-3.5" />
                Add Action
              </Button>
            </div>

            <div className="space-y-2">
              {actions.map((act, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Select
                    value={act.type}
                    onValueChange={(val) => updateActionType(idx, val as ActionType)}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CHANGE_STATUS">Change Status</SelectItem>
                      <SelectItem value="CHANGE_PRIORITY">Change Priority</SelectItem>
                      <SelectItem value="ASSIGN_TO_USER">Assign to Member</SelectItem>
                      <SelectItem value="SEND_NOTIFICATION">Send Notification</SelectItem>
                    </SelectContent>
                  </Select>

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

                  {act.type === "ASSIGN_TO_USER" && (
                    <Select
                      value={act.parameters.userId || (members[0]?.user?.id ?? "")}
                      onValueChange={(val) => updateActionParam(idx, "userId", val ?? "")}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((m) => (
                          <SelectItem key={m.user.id} value={m.user.id}>
                            {m.user.firstName} {m.user.lastName} ({m.projectRole})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {act.type === "SEND_NOTIFICATION" && (
                    <Input
                      value={act.parameters.message || ""}
                      onChange={(e) => updateActionParam(idx, "message", e.target.value)}
                      placeholder="Notification message"
                      className="flex-1"
                    />
                  )}

                  {actions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAction(idx)}
                      className="size-8 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {rule ? "Update Rule" : "Create Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
