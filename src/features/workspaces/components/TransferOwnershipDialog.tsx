import { useState } from "react"
import { ShieldAlert, Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTransferOwnershipMutation } from "../hooks/useWorkspaces"
import type { WorkspaceMember } from "../types/workspace.types"

interface TransferOwnershipDialogProps {
  workspaceId: string
  workspaceName: string
  members: WorkspaceMember[]
  currentUserId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransferOwnershipDialog({
  workspaceId,
  workspaceName,
  members,
  currentUserId,
  open,
  onOpenChange,
}: TransferOwnershipDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const { mutate: transfer, isPending, error } = useTransferOwnershipMutation(workspaceId)

  // Filter out current user from candidate list
  const eligibleMembers = members.filter(
    (m) => m.userId !== currentUserId && m.status === "ACTIVE"
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) return

    transfer(
      { newOwnerId: selectedUserId },
      {
        onSuccess: () => {
          setSelectedUserId("")
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <DialogTitle>Transfer Ownership</DialogTitle>
              <DialogDescription>
                Transfer primary ownership of <strong>{workspaceName}</strong>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {error instanceof Error ? error.message : "Failed to transfer ownership"}
            </div>
          )}

          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
            <strong>Warning:</strong> You will be demoted to an Admin. Only the new owner will be able to delete the organization or transfer ownership again.
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-owner">Select New Owner</Label>
            {eligibleMembers.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No other active members found in this organization. Invite a member first.
              </p>
            ) : (
              <Select
                value={selectedUserId}
                onValueChange={(val) => setSelectedUserId(val ?? "")}
                disabled={isPending}
              >
                <SelectTrigger id="new-owner">
                  <SelectValue placeholder="Choose an active member" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleMembers.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      <span className="font-medium">
                        {m.firstName ? `${m.firstName} ${m.lastName ?? ""}`.trim() : m.email}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">({m.email})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isPending || !selectedUserId || eligibleMembers.length === 0}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Transfer Ownership
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
