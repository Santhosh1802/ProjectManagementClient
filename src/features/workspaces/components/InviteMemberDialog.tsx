import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserPlus, Loader2, Check, Copy } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  inviteMemberSchema,
  type InviteMemberForm,
} from "../schemas/workspace.schema"
import { useInviteMemberMutation } from "../hooks/useWorkspaces"
import type { WorkspaceInvitation } from "../types/workspace.types"

interface InviteMemberDialogProps {
  workspaceId: string
  workspaceName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteMemberDialog({
  workspaceId,
  workspaceName,
  open,
  onOpenChange,
}: InviteMemberDialogProps) {
  const [createdInvitation, setCreatedInvitation] = useState<WorkspaceInvitation | null>(null)
  const [copied, setCopied] = useState(false)

  const { mutate: invite, isPending, error, reset: resetMutation } = useInviteMemberMutation(workspaceId)

  const {
    register,
    handleSubmit,
    control,
    reset: resetForm,
    formState: { errors },
  } = useForm<InviteMemberForm>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "MEMBER",
    },
  })

  const onSubmit = (data: InviteMemberForm) => {
    invite(data, {
      onSuccess: (invitation) => {
        setCreatedInvitation(invitation)
        resetForm()
      },
    })
  }

  const handleClose = () => {
    setCreatedInvitation(null)
    setCopied(false)
    resetMutation()
    resetForm()
    onOpenChange(false)
  }

  const handleCopyLink = () => {
    if (createdInvitation?.invitationLink) {
      navigator.clipboard.writeText(createdInvitation.invitationLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus className="size-5" />
            </div>
            <div>
              <DialogTitle>Invite Member</DialogTitle>
              <DialogDescription>
                Invite a colleague to collaborate in <strong>{workspaceName}</strong>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {createdInvitation ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm text-emerald-600 dark:text-emerald-400">
              <p className="font-semibold">Invitation created successfully!</p>
              <p className="text-xs text-muted-foreground mt-1">
                An invitation email was dispatched to <strong>{createdInvitation.invitedEmail}</strong>.
                You can also share the direct invitation link below:
              </p>
            </div>

            {createdInvitation.invitationLink && (
              <div className="space-y-1.5">
                <Label className="text-xs">Direct Invitation Link (expires in 7 days)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={createdInvitation.invitationLink}
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    aria-label="Copy invitation link"
                  >
                    {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" onClick={handleClose}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                {error instanceof Error ? error.message : "Failed to invite member"}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                disabled={isPending}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invite-role">Organization Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger id="invite-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">
                        <div className="flex flex-col text-left">
                          <span className="font-medium">Member</span>
                          <span className="text-[11px] text-muted-foreground">
                            Can join assigned projects and tasks
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ADMIN">
                        <div className="flex flex-col text-left">
                          <span className="font-medium">Admin</span>
                          <span className="text-[11px] text-muted-foreground">
                            Can manage workspace settings and invite members
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-xs text-destructive">{errors.role.message}</p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
