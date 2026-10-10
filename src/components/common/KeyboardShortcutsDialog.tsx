import { useMemo } from "react"
import { Keyboard } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ShortcutHint from "@/components/common/ShortcutHint"

import {
  KEYBOARD_SHORTCUTS,
  SHORTCUT_CATEGORIES,
  type ShortcutCategory,
  type ShortcutDefinition,
} from "@/config/keyboardShortcuts"
import { hasAllowedRole } from "@/config/routeAccess"

const CATEGORY_LABELS: Record<ShortcutCategory, string> = {
  Global: "Global",
  Navigation: "Navigation",
  Creation: "Create",
  Search: "Search",
  Actions: "Actions",
}

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: string | null | undefined
}

export default function KeyboardShortcutsDialog({
  open,
  onOpenChange,
  role,
}: KeyboardShortcutsDialogProps) {
  // Only list shortcuts the current user is allowed to use.
  const groups = useMemo(() => {
    const visible = KEYBOARD_SHORTCUTS.filter((shortcut) =>
      hasAllowedRole(role, shortcut.roles)
    )

    return SHORTCUT_CATEGORIES.map((category) => ({
      category,
      shortcuts: visible.filter((shortcut) => shortcut.category === category),
    })).filter((group) => group.shortcuts.length > 0)
  }, [role])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90dvh,44rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="gap-1.5 border-b px-4 py-4 pe-12 sm:px-6">
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Keyboard className="size-4" aria-hidden="true" />
            </span>
            Keyboard shortcuts
          </DialogTitle>

          <DialogDescription className="text-sm">
            Move around DevFlow without leaving the keyboard. Letter
            shortcuts pause while you are typing in a field.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            {groups.map((group) => (
              <section
                key={group.category}
                aria-labelledby={`shortcut-group-${group.category}`}
                className="min-w-0"
              >
                <h3
                  id={`shortcut-group-${group.category}`}
                  className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                >
                  {CATEGORY_LABELS[group.category]}
                </h3>

                <ul className="divide-y divide-border/60 rounded-lg border bg-muted/20">
                  {group.shortcuts.map((shortcut) => (
                    <ShortcutRow key={shortcut.id} shortcut={shortcut} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <DialogFooter className="border-t bg-muted/30 px-4 py-3 text-xs text-muted-foreground sm:justify-between sm:px-6">
          <p className="flex flex-wrap items-center gap-1.5">
            Press
            <ShortcutHint keys={["?"]} />
            anywhere to open this list.
          </p>

          <p className="flex flex-wrap items-center gap-1.5">
            <ShortcutHint keys={["Esc"]} />
            to close
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ShortcutRow({ shortcut }: { shortcut: ShortcutDefinition }) {
  return (
    <li className="flex items-center justify-between gap-3 px-3 py-2">
      <span className="min-w-0 text-sm break-words text-foreground">
        {shortcut.description}
      </span>

      <ShortcutHint
        keys={shortcut.keys}
        sequence={shortcut.sequence}
        keyClassName="h-6 min-w-6 px-1.5 text-[0.6875rem]"
      />
    </li>
  )
}
