import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  
  let variant: "default" | "secondary" | "destructive" | "outline";
  
  if (["completed", "done", "active", "success"].includes(normalizedStatus)) {
    variant = "default"; 
  } else if (["in_progress", "pending", "in progress", "todo"].includes(normalizedStatus)) {
    variant = "secondary";
  } else if (["cancelled", "failed", "error", "inactive"].includes(normalizedStatus)) {
    variant = "destructive";
  } else {
    variant = "outline";
  }

  return (
    <Badge variant={variant} className={cn("capitalize whitespace-nowrap", className)}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
