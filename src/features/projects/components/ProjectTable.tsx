import {
  CalendarDays,
  Clock3,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  Avatar,
  AvatarFallback
} from "@/components/ui/avatar"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { Project } from "../types/project.types"
import StatusBadge from "@/components/common/StatusBadge"
import { Button } from "@/components/ui/button"

interface ProjectTableProps {
  projects: Project[]
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  )
}

function getDueDateClassName(dueDate: string) {
  const today = new Date()
  const due = new Date(dueDate)

  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)

  if (due < today) {
    return "text-destructive"
  }

  if (due.getTime() === today.getTime()) {
    return "text-amber-600 dark:text-amber-400"
  }

  return "text-muted-foreground"
}

export function ProjectTable({
  projects,
}: ProjectTableProps) {
  const navigate = useNavigate()

  return (
    <div className="w-full overflow-hidden rounded-xl border bg-card">
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="min-w-[280px]">
                Project
              </TableHead>

              <TableHead>Status</TableHead>

              <TableHead>Owner</TableHead>

              <TableHead>
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-3.5" />
                  Start date
                </div>
              </TableHead>

              <TableHead>
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-3.5" />
                  Due date
                </div>
              </TableHead>

              <TableHead>
                <div className="flex items-center gap-2">
                  <Clock3 className="size-3.5" />
                  Updated
                </div>
              </TableHead>

              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {projects.map((project) => (
              <TableRow
                key={project.id}
                className="group cursor-pointer transition-colors"
                onClick={() =>
                  navigate(
                    `/app/projects/${project.id}`,
                  )
                }
              >
                {/* Project */}
                <TableCell className="py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-9 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-muted text-sm font-semibold">
                        {project.name
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {project.name}
                      </div>

                      <div className="mt-0.5 max-w-[320px] truncate text-xs text-muted-foreground">
                        {project.description ||
                          "No description provided"}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <StatusBadge
                    status={project.projectStatus}
                  />
                </TableCell>

                {/* Owner */}
                <TableCell>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Avatar className="size-6">

                      <AvatarFallback className="text-xs">
                        {project.owner.firstName.charAt(0)}
                        {project.owner.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <span className="font-medium text-sm">
                      {project.owner.firstName}{" "}
                      {project.owner.lastName}
                    </span>
                  </div>
                </TableCell>

                {/* Start date */}
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDate(project.startDate)}
                </TableCell>

                {/* Due date */}
                <TableCell
                  className={`whitespace-nowrap ${getDueDateClassName(
                    project.dueDate,
                  )}`}
                >
                  {formatDate(project.dueDate)}
                </TableCell>

                {/* Updated */}
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDate(project.updatedAt)}
                </TableCell>

                {/* Action */}
                <TableCell>
                  <div className="flex shrink-0 items-center justify-end">
                    <Button variant="secondary" size="sm">
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}