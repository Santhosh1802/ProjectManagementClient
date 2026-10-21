import { useState, useMemo } from "react"
import { ArrowRightLeft, Loader2, UserCheck, Shield } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useUpdateProjectOwnerMutation } from "@/features/projects/hooks/useProjectsQuery"
import { useAppDispatch } from "@/hooks/redux-hooks"
import { updateProject } from "@/features/projects/slice/projectSlice"
import type { Project, ProjectMember } from "@/features/projects/types/project.types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TransferOwnershipDialogProps {
  project: Project
  members: ProjectMember[]
  trigger?: React.ReactNode
  onTransferred?: (updatedProject: Project) => void
}

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase() || "U"
}

export default function TransferOwnershipDialog({
  project,
  members,
  trigger,
  onTransferred,
}: TransferOwnershipDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("")
  const dispatch = useAppDispatch()
  const transferMutation = useUpdateProjectOwnerMutation()

  // Eligible new owners: active members who are not already the current owner
  const eligibleMembers = useMemo(() => {
    return members.filter(
      (m) => m.user.id !== project.owner.id && Boolean(m.user.isActive ?? true)
    )
  }, [members, project.owner.id])

  // Map of userId -> display label for Base UI Select
  const memberItems = useMemo(() => {
    const items: Record<string, string> = {}
    for (const m of eligibleMembers) {
      const name = `${m.user.firstName} ${m.user.lastName || ""}`.trim()
      items[m.user.id] = `${name} (${m.projectRole})`
    }
    return items
  }, [eligibleMembers])

  const selectedMember = eligibleMembers.find((m) => m.user.id === selectedOwnerId)

  const handleTransfer = async () => {
    if (!selectedOwnerId) return

    try {
      const updated = await transferMutation.mutateAsync({
        id: project.id,
        ownerId: selectedOwnerId,
      })

      dispatch(updateProject(updated))
      onTransferred?.(updated)

      toast.add({
        type: "success",
        title: "Ownership transferred",
        description: `Project ownership successfully transferred to ${updated.owner.firstName} ${updated.owner.lastName || ""}.`,
      })
      setOpen(false)
      setSelectedOwnerId("")
    } catch (error) {
      toast.add({
        type: "error",
        title: "Failed to transfer ownership",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while transferring project ownership.",
      })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setSelectedOwnerId("")
      }}
    >
      <DialogTrigger
        render={
          trigger ? (
            trigger as React.ReactElement
          ) : (
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowRightLeft className="size-4" />
              Transfer Ownership
            </Button>
          )
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-foreground">
            <UserCheck className="size-5 text-primary" />
            <DialogTitle>Transfer Project Ownership</DialogTitle>
          </div>
          <DialogDescription className="text-left pt-1 text-sm text-muted-foreground">
            Select an active project member to take over ownership of{" "}
            <span className="font-semibold text-foreground">"{project.name}"</span>.
            The new owner will gain full management rights.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-left">
          {/* Current Owner Card */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground mb-1.5 font-medium">Current Owner</p>
            <div className="flex items-center gap-3">
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="text-xs font-medium">
                  {getInitials(project.owner.firstName, project.owner.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {project.owner.firstName} {project.owner.lastName || ""}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {project.owner.email}
                </p>
              </div>
            </div>
          </div>

          {/* New Owner Select */}
          <div className="space-y-2">
            <Label htmlFor="new-owner-select" className="text-xs font-semibold">
              Select New Owner
            </Label>
            {eligibleMembers.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 leading-relaxed">
                No eligible active members found. You must add and assign members to this project first before transferring ownership.
              </p>
            ) : (
              <Select
                value={selectedOwnerId}
                items={memberItems}
                onValueChange={(val) => setSelectedOwnerId(val ?? "")}
              >
                <SelectTrigger id="new-owner-select" className="w-full h-10 px-3">
                  <SelectValue placeholder="Choose a member from this project..." />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {eligibleMembers.map((member) => (
                    <SelectItem
                      key={member.user.id}
                      value={member.user.id}
                      className="py-2"
                    >
                      <div className="flex items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar className="size-6 shrink-0">
                            <AvatarFallback className="text-[10px]">
                              {getInitials(member.user.firstName, member.user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate font-medium text-xs">
                            {member.user.firstName} {member.user.lastName || ""}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                          {member.projectRole}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Transfer Preview Warning */}
          {selectedMember && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-400">
              <Shield className="size-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <span className="font-semibold text-foreground">
                  {selectedMember.user.firstName} {selectedMember.user.lastName || ""}
                </span>{" "}
                will become the sole project owner. You will retain membership access unless removed.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 pt-3 border-t">
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}
            disabled={transferMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleTransfer}
            disabled={!selectedOwnerId || transferMutation.isPending}
            className="gap-2"
          >
            {transferMutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Confirm Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
