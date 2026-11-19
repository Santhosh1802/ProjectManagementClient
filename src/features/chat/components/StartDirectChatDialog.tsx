import { useEffect, useState } from "react"
import { Loader2, MessageSquare, Search, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { searchUsers } from "@/features/users/services/users.service"
import type { User } from "@/features/users/types/user.types"

interface StartDirectChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId?: string
  isPending: boolean
  onSelectUser: (userId: string) => void
}

export function StartDirectChatDialog({
  open,
  onOpenChange,
  currentUserId,
  isPending,
  onSelectUser,
}: StartDirectChatDialogProps) {
  const [keyword, setKeyword] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true)
        const res = await searchUsers({
          keyword: keyword.trim() || undefined,
          page: 0,
          size: 20,
        })
        if (!cancelled) {
          setUsers(res.content.filter((u) => u.id !== currentUserId))
        }
      } catch {
        if (!cancelled) setUsers([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 200)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [open, keyword, currentUserId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <UserPlus className="size-4 text-primary" />
            Direct Message
          </DialogTitle>
          <DialogDescription>
            Start a private 1-to-1 conversation with a workspace member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="relative">
            <Search className="pointer-events-none absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search teammates by name or email..."
              aria-label="Search teammates for direct chat"
              className="pl-8 text-xs"
            />
          </div>

          <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                <Loader2 className="mr-2 size-3.5 animate-spin" />
                Loading teammates...
              </div>
            ) : users.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No matching teammates found.
              </p>
            ) : (
              users.map((u) => {
                const name = `${u.firstName} ${u.lastName}`.trim() || u.email
                const initials =
                  `${u.firstName?.charAt(0) ?? ""}${u.lastName?.charAt(0) ?? ""}`.toUpperCase() ||
                  "U"
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-card p-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">{name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="xs"
                      disabled={isPending}
                      onClick={() => onSelectUser(u.id)}
                    >
                      <MessageSquare className="mr-1 size-3" />
                      Message
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
