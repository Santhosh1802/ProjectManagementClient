import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="flex items-start gap-3 p-4">
          <Skeleton className="size-11 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-4 w-36 max-w-full" />
            <Skeleton className="h-3 w-52 max-w-full" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <Skeleton className="size-9 shrink-0 rounded-md" />
        </Card>
      ))}
    </div>
  );
}