import EmptyState from "@/components/common/EmptyState"
import { Search, FolderKanban } from "lucide-react"

interface ProjectEmptyStateProps {
  hasFilters: boolean
}

export function ProjectEmptyState({ hasFilters }: ProjectEmptyStateProps) {
  return (
    <EmptyState
      icon={hasFilters ? Search : FolderKanban}
      title={hasFilters ? "No projects found" : "No projects yet"}
      description={hasFilters ? "Try changing your search or filters." : "Create your first project to get started."}
    />
  )
}