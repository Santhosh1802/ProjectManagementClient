import { SearchX, UserPlus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import EmptyState from "@/components/common/EmptyState"

interface UserEmptyStateProps {
  hasFilters: boolean;
  onReset?: () => void;
  onCreate?: () => void;
}

export default function UserEmptyState({
  hasFilters,
  onReset,
  onCreate,
}: UserEmptyStateProps) {
  const Icon = hasFilters ? SearchX : Users;

  return (
    <EmptyState
      title={hasFilters ? "No matching users" : "No users yet"}
      description={
        hasFilters
          ? "Try changing your search or filters to find the users you're looking for."
          : "Create your first user to start managing access to DevFlow."
      }
      icon={Icon}
      action={
        hasFilters && onReset ? (
          <Button variant="outline" onClick={onReset}>
            Clear filters
          </Button>
        ) : !hasFilters && onCreate ? (
          <Button onClick={onCreate}>
            <UserPlus className="mr-2 size-4" />
            Create user
          </Button>
        ) : undefined
      }
    />
  )
}