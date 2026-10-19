import StatusBadge from "@/components/common/StatusBadge"
import type { ProjectStatus } from "../types/project.types"

interface ProjectStatusBadgeProps {
  status: ProjectStatus
  className?: string
  showDot?: boolean
}

export function ProjectStatusBadge({
  status,
  className,
  showDot = true,
}: ProjectStatusBadgeProps) {
  return (
    <StatusBadge
      status={status}
      showDot={showDot}
      className={className}
    />
  )
}

export default ProjectStatusBadge