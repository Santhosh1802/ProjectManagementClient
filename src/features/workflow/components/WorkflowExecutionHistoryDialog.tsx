import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react"
import { useWorkflowRuleExecutionsQuery } from "../hooks/useWorkflowRulesQuery"
import type { WorkflowRule } from "../types/workflow.types"

interface WorkflowExecutionHistoryDialogProps {
  rule: WorkflowRule | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WorkflowExecutionHistoryDialog({
  rule,
  open,
  onOpenChange,
}: WorkflowExecutionHistoryDialogProps) {
  const { data: executions = [], isLoading } = useWorkflowRuleExecutionsQuery(
    open ? rule?.id : undefined
  )

  const formatTimestamp = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString()
    } catch {
      return isoString
    }
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3" />
            Success
          </Badge>
        )
      case "FAILED":
        return (
          <Badge variant="outline" className="gap-1 border-destructive/30 bg-destructive/10 text-destructive">
            <XCircle className="size-3" />
            Failed
          </Badge>
        )
      case "SKIPPED":
      default:
        return (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <Clock className="size-3" />
            Skipped
          </Badge>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Execution History</span>
            {rule && (
              <Badge variant="secondary" className="font-normal text-xs">
                {rule.name}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Recent automated runs, outcomes, and execution details for this workflow rule.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : executions.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No execution history recorded for this rule yet.
          </div>
        ) : (
          <div className="max-h-[380px] overflow-y-auto pr-3 space-y-3">
            {executions.map((exec) => (
              <div
                key={exec.id}
                className="rounded-lg border bg-card/60 p-3 text-sm space-y-1.5 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {renderStatusBadge(exec.status)}
                    <span className="text-xs text-muted-foreground">
                      {exec.triggerType.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(exec.executedAt)}
                  </span>
                </div>

                {exec.errorMessage ? (
                  <p className="text-xs text-destructive font-mono bg-destructive/5 rounded p-2">
                    {exec.errorMessage}
                  </p>
                ) : exec.actionsExecutedJson && exec.actionsExecutedJson !== "[]" ? (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Actions: </span>
                    {exec.actionsExecutedJson}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
