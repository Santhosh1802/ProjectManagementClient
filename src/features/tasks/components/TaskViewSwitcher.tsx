import { Grid2X2, List, Table2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import type { TaskView } from "@/features/tasks/types/task.types"

interface TaskViewSwitcherProps {
  value: TaskView
  onChange: (view: TaskView) => void
}

const views: {
  value: TaskView
  label: string
  icon: typeof Grid2X2
}[] = [
  {
    value: "card",
    label: "Card view",
    icon: Grid2X2,
  },
  {
    value: "list",
    label: "List view",
    icon: List,
  },
  {
    value: "table",
    label: "Table view",
    icon: Table2,
  },
]

export default function TaskViewSwitcher({
  value,
  onChange,
}: TaskViewSwitcherProps) {
  return (
    <div className="flex items-center rounded-md border bg-background p-1">
      {views.map((view) => {
        const Icon = view.icon
        const isActive = value === view.value

        return (
          <Tooltip key={view.value}>
            <TooltipTrigger render={
              <Button
                type="button"
                variant={isActive ? "secondary" : "ghost"}
                size="icon"
                className="size-8"
                aria-label={view.label}
                aria-pressed={isActive}
                onClick={() => onChange(view.value)}
              >
                <Icon className="size-4" />
              </Button>
            } />

            <TooltipContent>
              {view.label}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}