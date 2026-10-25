import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  MoreVertical,
  Plus,
  Pencil,
  Trash2,
  History,
  Workflow,
  Loader2,
  Zap,
} from "lucide-react"
import {
  useWorkflowRulesQuery,
  useCreateWorkflowRuleMutation,
  useUpdateWorkflowRuleMutation,
  useToggleWorkflowRuleMutation,
  useDeleteWorkflowRuleMutation,
} from "../hooks/useWorkflowRulesQuery"
import { WorkflowRuleModal } from "./WorkflowRuleModal"
import { WorkflowExecutionHistoryDialog } from "./WorkflowExecutionHistoryDialog"
import type { WorkflowRule, RuleCondition, RuleAction } from "../types/workflow.types"
import type { ProjectMember } from "@/features/projects/types/project.types"

interface WorkflowRulesListProps {
  projectId: string
  canManage: boolean
  members?: ProjectMember[]
}

export function WorkflowRulesList({
  projectId,
  canManage,
  members = [],
}: WorkflowRulesListProps) {
  const { data: rules = [], isLoading, isError, error } = useWorkflowRulesQuery(projectId)

  const createMutation = useCreateWorkflowRuleMutation(projectId)
  const updateMutation = useUpdateWorkflowRuleMutation(projectId)
  const toggleMutation = useToggleWorkflowRuleMutation(projectId)
  const deleteMutation = useDeleteWorkflowRuleMutation(projectId)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<WorkflowRule | null>(null)

  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedRuleForHistory, setSelectedRuleForHistory] = useState<WorkflowRule | null>(null)

  const [ruleToDelete, setRuleToDelete] = useState<WorkflowRule | null>(null)

  const handleCreate = () => {
    setEditingRule(null)
    setModalOpen(true)
  }

  const handleEdit = (rule: WorkflowRule) => {
    setEditingRule(rule)
    setModalOpen(true)
  }

  const handleHistory = (rule: WorkflowRule) => {
    setSelectedRuleForHistory(rule)
    setHistoryOpen(true)
  }

  const handleToggle = (rule: WorkflowRule) => {
    toggleMutation.mutate(rule.id)
  }

  const handleDeleteConfirm = () => {
    if (ruleToDelete) {
      deleteMutation.mutate(ruleToDelete.id)
      setRuleToDelete(null)
    }
  }

  const formatTriggerLabel = (trigger: string) => {
    switch (trigger) {
      case "TASK_CREATED":
        return "When task is created"
      case "TASK_STATUS_CHANGED":
        return "When task status changes"
      case "TASK_ASSIGNED":
        return "When task is assigned"
      case "TASK_DUE_DATE_CHANGED":
        return "When task due date changes"
      default:
        return trigger.replace(/_/g, " ")
    }
  }

  const renderConditionsSummary = (json: string) => {
    try {
      const conds: RuleCondition[] = JSON.parse(json || "[]")
      if (conds.length === 0) return <span className="text-muted-foreground">Always applies</span>
      return conds.map((c, i) => (
        <Badge key={i} variant="outline" className="mr-1 text-[11px] font-mono">
          {c.field} {c.operator.toLowerCase().replace(/_/g, " ")} {c.value || ""}
        </Badge>
      ))
    } catch {
      return <span className="text-muted-foreground">No conditions</span>
    }
  }

  const renderActionsSummary = (json: string) => {
    try {
      const acts: RuleAction[] = JSON.parse(json || "[]")
      return acts.map((a, i) => (
        <Badge key={i} variant="secondary" className="mr-1 text-[11px]">
          {a.type.replace(/_/g, " ").toLowerCase()}
        </Badge>
      ))
    } catch {
      return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center text-sm text-destructive">
        {error instanceof Error ? error.message : "Failed to load workflow rules"}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            <h3 className="font-semibold text-base">Workflow Automation</h3>
            <Badge variant="outline" className="text-xs">
              {rules.length} {rules.length === 1 ? "rule" : "rules"}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Automate routine task status updates, assignments, and notifications on project events.
          </p>
        </div>

        {canManage && (
          <Button onClick={handleCreate} size="sm" className="gap-1.5 h-8 text-xs shrink-0">
            <Plus className="size-3.5" />
            Add Rule
          </Button>
        )}
      </div>

      {rules.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center bg-card/40">
          <Workflow className="mx-auto size-9 text-muted-foreground/60 mb-2" />
          <h4 className="text-sm font-medium">No workflow rules configured</h4>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            Set up rules to automatically assign tasks, adjust priorities, or send notifications when tasks are created or updated.
          </p>
          {canManage && (
            <Button onClick={handleCreate} variant="outline" size="sm" className="mt-4 gap-1.5 text-xs">
              <Plus className="size-3.5" />
              Create your first rule
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-foreground/20"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-sm truncate">{rule.name}</h4>
                  <Badge variant="outline" className="text-[11px] bg-primary/5 text-primary border-primary/20">
                    {formatTriggerLabel(rule.triggerType)}
                  </Badge>
                  {!rule.isEnabled && (
                    <Badge variant="secondary" className="text-[10px] text-muted-foreground">
                      Disabled
                    </Badge>
                  )}
                </div>

                {rule.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{rule.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                  <span className="font-medium text-muted-foreground text-[11px]">If:</span>
                  {renderConditionsSummary(rule.conditionsJson)}
                  <span className="font-medium text-muted-foreground text-[11px] ml-1">Then:</span>
                  {renderActionsSummary(rule.actionsJson)}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                {canManage && (
                  <div className="flex items-center gap-1.5" title="Toggle active status">
                    <span className="text-xs text-muted-foreground select-none">Active</span>
                    <Checkbox
                      checked={rule.isEnabled}
                      onCheckedChange={() => handleToggle(rule)}
                      aria-label="Toggle rule"
                    />
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleHistory(rule)}
                  className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                  title="View execution runs"
                >
                  <History className="size-3.5" />
                  <span className="hidden sm:inline">Runs</span>
                </Button>

                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(rule)}>
                        <Pencil className="mr-2 size-3.5" />
                        Edit Rule
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleHistory(rule)}>
                        <History className="mr-2 size-3.5" />
                        Execution History
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setRuleToDelete(rule)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 size-3.5" />
                        Delete Rule
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialogs */}
      <WorkflowRuleModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        rule={editingRule}
        projectId={projectId}
        members={members}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={async (data) => {
          if (editingRule) {
            await updateMutation.mutateAsync({
              ruleId: editingRule.id,
              request: data,
            })
          } else {
            await createMutation.mutateAsync(data)
          }
        }}
      />

      <WorkflowExecutionHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        rule={selectedRuleForHistory}
      />

      <AlertDialog open={Boolean(ruleToDelete)} onOpenChange={(open) => !open && setRuleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{ruleToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Rule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
