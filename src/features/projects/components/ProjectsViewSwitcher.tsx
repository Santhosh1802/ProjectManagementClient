import { LayoutGrid, List, Table2 } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { ProjectView } from "../types/project.types"

interface ProjectViewSwitcherProps {
  view: ProjectView
  onViewChange: (view: ProjectView) => void
}

export function ProjectViewSwitcher({
  view,
  onViewChange,
}: ProjectViewSwitcherProps) {
  return (
    <div className="flex items-center rounded-lg border bg-background p-1">
      <Button
        variant={view === "card" ? "secondary" : "ghost"}
        size="icon-sm"
        onClick={() => onViewChange("card")}
        aria-label="Card view"
      >
        <LayoutGrid className="size-4" />
      </Button>

      <Button
        variant={view === "list" ? "secondary" : "ghost"}
        size="icon-sm"
        onClick={() => onViewChange("list")}
        aria-label="List view"
      >
        <List className="size-4" />
      </Button>

      <Button
        variant={view === "table" ? "secondary" : "ghost"}
        size="icon-sm"
        onClick={() => onViewChange("table")}
        aria-label="Table view"
      >
        <Table2 className="size-4" />
      </Button>
    </div>
  )
}