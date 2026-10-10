import { Users, UserCheck, UserMinus } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { UserStatus } from "../types/user.types"

interface UserScopeTabsProps {
  value: UserStatus
  onChange: (value: UserStatus) => void
  counts?: {
    all: number
    active: number
    inactive: number
  }
}

const scopeItems = [
  {
    value: "all" as const,
    label: "All users",
    icon: Users,
    countKey: "all" as const,
  },
  {
    value: "active" as const,
    label: "Active",
    icon: UserCheck,
    countKey: "active" as const,
  },
  {
    value: "inactive" as const,
    label: "Inactive",
    icon: UserMinus,
    countKey: "inactive" as const,
  },
]

export default function UserScopeTabs({
  value,
  onChange,
  counts,
}: UserScopeTabsProps) {
  return (
    <div className="flex w-full overflow-x-auto border-b">
      <div className="flex min-w-max items-center gap-1">
        {scopeItems.map((item) => {
          const Icon = item.icon
          const active = value === item.value

          return (
            <Button
              key={item.value}
              variant="ghost"
              onClick={() => {
                if (!active) {
                  onChange(item.value)
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
              <Icon className="size-4 mr-2" />

              {item.label}
              
              {counts && (
                <span className="ml-2 text-xs">
                  ({counts[item.countKey]})
                </span>
              )}

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