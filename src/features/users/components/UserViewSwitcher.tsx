import { LayoutGrid, List, Table2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import type { UserView } from "../types/user.types"

interface UserViewSwitcherProps {
  value: UserView
  onChange: (view: UserView) => void
}

const views: {
  value: UserView
  label: string
  icon: typeof LayoutGrid
}[] = [
  {
    value: "card",
    label: "Card view",
    icon: LayoutGrid,
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

export default function UserViewSwitcher({
  value,
  onChange,
}: UserViewSwitcherProps) {
  return (
    <div className="flex h-7.5 items-center rounded-md border bg-background p-0.5">
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
                className="size-6.5"
                aria-label={view.label}
                aria-pressed={isActive}
                onClick={() => onChange(view.value)}
              >
                <Icon className="size-3.5" />
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
