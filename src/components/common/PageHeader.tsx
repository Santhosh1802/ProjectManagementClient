import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function PageHeader({
  title,
  description,
  actions,
  className,
  onRefresh,
  isRefreshing = false,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6", className)}>
      <div className="space-y-1 min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">{title}</h1>
        {description && <p className="text-muted-foreground truncate text-sm">{description}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onRefresh && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-7.5 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            title="Refresh data"
          >
            <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin text-primary")} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
        )}
        {actions}
      </div>
    </div>
  );
}
