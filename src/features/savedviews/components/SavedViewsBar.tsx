import { useState } from "react"
import {
  Bookmark,
  ChevronDown,
  Plus,
  Trash2,
  Check,
  Star,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import type { SavedView, ViewTarget } from "../types/savedView.types"
import {
  useSavedViewsQuery,
  useCreateSavedViewMutation,
  useDeleteSavedViewMutation,
} from "../hooks/useSavedViewsQuery"

interface SavedViewsBarProps {
  target: ViewTarget
  currentFiltersJson: string
  currentSortBy?: string
  currentSortOrder?: "asc" | "desc"
  activeViewId?: string | null
  onApplyView: (view: SavedView) => void
  onClearActiveView: () => void
  projectId?: string
}

export default function SavedViewsBar({
  target,
  currentFiltersJson,
  currentSortBy,
  currentSortOrder,
  activeViewId,
  onApplyView,
  onClearActiveView,
  projectId,
}: SavedViewsBarProps) {
  const { data: views = [], isLoading } = useSavedViewsQuery(target)
  const createMutation = useCreateSavedViewMutation()
  const deleteMutation = useDeleteSavedViewMutation()

  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [newViewName, setNewViewName] = useState("")
  const [isDefault, setIsDefault] = useState(false)
  const [isShared, setIsShared] = useState(false)

  const activeView = views.find((v) => v.id === activeViewId)

  const handleOpenSaveDialog = () => {
    setNewViewName("")
    setIsDefault(false)
    setIsShared(false)
    setSaveDialogOpen(true)
  }

  const handleConfirmSave = async () => {
    if (!newViewName.trim()) return

    await createMutation.mutateAsync({
      name: newViewName.trim(),
      viewTarget: target,
      filtersJson: currentFiltersJson,
      sortBy: currentSortBy,
      sortOrder: currentSortOrder,
      isDefault,
      isShared,
      projectId: isShared ? projectId : undefined,
    })

    setSaveDialogOpen(false)
  }

  const handleDeleteView = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this saved view?")) {
      if (activeViewId === id) {
        onClearActiveView()
      }
      await deleteMutation.mutateAsync(id)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium"
            />
          }
        >
          <Bookmark className="size-3.5 text-muted-foreground" />
          <span>{activeView ? activeView.name : "Saved Views"}</span>
          <ChevronDown className="size-3 text-muted-foreground opacity-60" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-64 p-1">
          <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {target === "TASKS" ? "Task Views" : "Project Views"}
          </div>

          <DropdownMenuItem
            onClick={onClearActiveView}
            className="flex items-center justify-between text-xs py-1.5 cursor-pointer"
          >
            <span>All (Default)</span>
            {!activeViewId && <Check className="size-3.5 text-primary" />}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {isLoading ? (
            <div className="px-2 py-3 text-xs text-muted-foreground text-center">
              Loading views...
            </div>
          ) : views.length === 0 ? (
            <div className="px-2 py-3 text-xs text-muted-foreground text-center">
              No saved views yet.
            </div>
          ) : (
            views.map((v) => (
              <DropdownMenuItem
                key={v.id}
                onClick={() => onApplyView(v)}
                className="flex items-center justify-between text-xs py-1.5 cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 truncate min-w-0">
                  {v.isDefault && <Star className="size-3 text-amber-500 fill-amber-500 shrink-0" />}
                  {v.isShared && <Users className="size-3 text-blue-500 shrink-0" />}
                  <span className="truncate">{v.name}</span>
                  {v.isDefault && (
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                      Default
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {activeViewId === v.id && <Check className="size-3.5 text-primary" />}
                  {v.isOwnedByCurrentUser && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                      onClick={(e) => handleDeleteView(e, v.id)}
                      title="Delete view"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleOpenSaveDialog}
            className="flex items-center gap-2 text-xs py-1.5 text-primary cursor-pointer font-medium"
          >
            <Plus className="size-3.5" />
            <span>Save Current View</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save View Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Current View</DialogTitle>
            <DialogDescription>
              Save your current search, filters, and sort options to quickly access them later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="view-name" className="text-xs font-semibold">
                View Name
              </Label>
              <Input
                id="view-name"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                placeholder="e.g. My Urgent Bugs, High Priority Backlog"
                className="h-8 text-xs"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="view-default"
                  checked={isDefault}
                  onCheckedChange={(checked) => setIsDefault(Boolean(checked))}
                />
                <Label
                  htmlFor="view-default"
                  className="text-xs font-normal cursor-pointer"
                >
                  Set as my default view
                </Label>
              </div>

              {projectId && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="view-shared"
                    checked={isShared}
                    onCheckedChange={(checked) => setIsShared(Boolean(checked))}
                  />
                  <Label
                    htmlFor="view-shared"
                    className="text-xs font-normal cursor-pointer"
                  >
                    Share this view with project members
                  </Label>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSaveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmSave}
              disabled={!newViewName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? "Saving..." : "Save View"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
