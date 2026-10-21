import {
  Command,
  Search,
  Keyboard,
  FolderPlus,
  CheckSquare,
  Sparkles,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useKeyboardShortcutsUI } from "@/context/KeyboardShortcutsContext"
import { useAppSelector } from "@/hooks/redux-hooks"

/**
 * MobileQuickActionFAB
 * A floating action button (FAB) anchored in the bottom-right for mobile viewports (hidden on desktop).
 * Provides one-tap access to Quick Search, Keyboard Shortcuts dialog, and fast creation workflows,
 * giving touch-only users immediate parity with desktop shortcut power-users.
 */
export default function MobileQuickActionFAB() {
  const navigate = useNavigate()
  const { openSearch, openShortcuts } = useKeyboardShortcutsUI()
  const user = useAppSelector((state) => state.auth.user)
  const userRole = user?.user_role?.toUpperCase()

  const canCreateProject = userRole === "ADMIN" || userRole === "PROJECT_MANAGER"

  return (
    <div className="fixed bottom-5 right-5 z-40 md:hidden print:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="icon"
              className="size-13 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-background/60 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Quick Actions & Shortcuts"
            >
              <div className="relative flex items-center justify-center">
                <Command className="size-5 transition-transform duration-300" />
                <span className="absolute -top-1 -right-1 flex size-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground/60 opacity-75" />
                  <span className="relative inline-flex rounded-full size-2.5 bg-primary-foreground" />
                </span>
              </div>
            </Button>
          }
        />

        <DropdownMenuContent
          align="end"
          side="top"
          sideOffset={14}
          className="w-56 rounded-2xl p-1.5 shadow-2xl border border-border/80 backdrop-blur-md bg-popover/95"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Sparkles className="size-3.5 text-primary" />
            Quick Actions
          </div>

          <DropdownMenuSeparator className="my-1 bg-border/60" />

          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={openSearch}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer hover:bg-accent/80 transition-colors"
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Search className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">Search</span>
                <span className="text-[11px] text-muted-foreground">Jump to task, project, page</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={openShortcuts}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl cursor-pointer hover:bg-accent/80 transition-colors"
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Keyboard className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">Shortcuts Guide</span>
                <span className="text-[11px] text-muted-foreground">View all system keybinds</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1 bg-border/60" />

          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => navigate("/app/tasks/create")}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl cursor-pointer hover:bg-accent/80 transition-colors"
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckSquare className="size-4" />
              </div>
              <span>New Task</span>
            </DropdownMenuItem>

            {canCreateProject && (
              <DropdownMenuItem
                onClick={() => navigate("/app/projects/create")}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-xl cursor-pointer hover:bg-accent/80 transition-colors"
              >
                <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <FolderPlus className="size-4" />
                </div>
                <span>New Project</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
