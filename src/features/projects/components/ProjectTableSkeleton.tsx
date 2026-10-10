import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"

export function ProjectTableSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableBody>
            {Array.from({ length: 8 }).map((_, row) => (
              <TableRow key={row}>
                {/* Project */}
                <TableCell className="min-w-[280px] py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-lg" />

                    <div className="space-y-2">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-52" />
                    </div>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-md" />
                </TableCell>

                {/* Owner */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-4 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </TableCell>

                {/* Start */}
                <TableCell>
                  <Skeleton className="h-3 w-24" />
                </TableCell>

                {/* Due */}
                <TableCell>
                  <Skeleton className="h-3 w-24" />
                </TableCell>

                {/* Updated */}
                <TableCell>
                  <Skeleton className="h-3 w-24" />
                </TableCell>

                {/* Arrow */}
                <TableCell>
                  <Skeleton className="size-4 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}