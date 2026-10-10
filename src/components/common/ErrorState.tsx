import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  retryAction?: () => void;
  className?: string;
}

export default function ErrorState({ 
  title = "Something went wrong", 
  description = "An error occurred while loading this content.", 
  retryAction, 
  className 
}: ErrorStateProps) {
  return (
    <div className={cn("flex min-h-[200px] flex-col items-center justify-center rounded-md border border-destructive/20 bg-destructive/5 p-8 text-center animate-in fade-in-50", className)}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-destructive">{title}</h3>
      <p className="mb-4 mt-2 text-sm text-muted-foreground">{description}</p>
      {retryAction && (
        <Button variant="outline" onClick={retryAction} className="mt-4">
          Try Again
        </Button>
      )}
    </div>
  );
}
