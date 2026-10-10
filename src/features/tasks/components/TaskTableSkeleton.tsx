import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TaskTableSkeletonProps {
  rows?: number
}

export default function TaskTableSkeleton({
  rows = 8,
}: TaskTableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-70">
              Task
            </TableHead>

            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Created By</TableHead>

            <TableHead className="w-15">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index}>
              {/* Task */}
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-55" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Skeleton className="h-6 w-24 rounded-full" />
              </TableCell>

              {/* Priority */}
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>

              {/* Assigned To */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="size-8 rounded-full" />

                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              </TableCell>

              {/* Due Date */}
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>

              {/* Created By */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="size-8 rounded-full" />

                  <Skeleton className="h-4 w-28" />
                </div>
              </TableCell>

              {/* Actions */}
              <TableCell>
                <Skeleton className="size-8 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}