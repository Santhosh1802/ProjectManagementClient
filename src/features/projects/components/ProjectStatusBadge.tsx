import { Badge } from "@/components/ui/badge"

import type { ProjectStatus } from "../types/project.types"

interface ProjectStatusBadgeProps {
  status: ProjectStatus
}

const statusConfig: Record<
  ProjectStatus,
  {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
  }
> = {
  PLANNING: {
    label: "Planning",
    variant: "secondary",
  },

  ACTIVE: {
    label: "Active",
    variant: "default",
  },

  COMPLETED: {
    label: "Completed",
    variant: "outline",
  },

  ARCHIVED: {
    label: "Archived",
    variant: "secondary",
  },
}

export function ProjectStatusBadge({
  status,
}: ProjectStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}