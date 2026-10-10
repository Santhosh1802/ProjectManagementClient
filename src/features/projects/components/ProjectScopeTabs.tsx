import {
  FolderKanban,
  FolderOpen,
  Share2,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import type {
  ProjectScope,
} from "../types/project.types"

interface ProjectScopeTabsProps {
  scope: ProjectScope
  onScopeChange: (scope: ProjectScope) => void
}

const scopeItems = [
  {
    value: "ALL" as const,
    label: "All",
    icon: FolderKanban,
  },
  {
    value: "OWNED" as const,
    label: "Owned by me",
    icon: FolderOpen,
  },
  {
    value: "SHARED" as const,
    label: "Shared with me",
    icon: Share2,
  },
]

export function ProjectScopeTabs({
  scope,
  onScopeChange,
}: ProjectScopeTabsProps) {
  return (
    <div className="flex w-full overflow-x-auto border-b">
      <div className="flex min-w-max items-center gap-1">
        {scopeItems.map((item) => {
          const Icon = item.icon
          const active = scope === item.value

          return (
            <Button
              key={item.value}
              variant="ghost"
              onClick={() => {
                if (!active) {
                  onScopeChange(item.value)
                }
              }}
              className={[
                "relative rounded-none px-3 py-2.5",
                "text-sm font-medium",
                "hover:bg-transparent",
                active
                  ? "text-foreground"
                  : "text-muted-foreground",
              ].join(" ")}
            >
              <Icon className="size-4" />

              {item.label}

              {active && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" />
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}