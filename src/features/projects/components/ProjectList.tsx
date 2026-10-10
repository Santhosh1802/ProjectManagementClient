import {
  CalendarDays,
  Clock3,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  Avatar,
  AvatarFallback
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

import type { Project } from "../types/project.types"
import { ProjectStatusBadge } from "./ProjectStatusBadge"
import { Button } from "@/components/ui/button"

interface ProjectListProps {
  projects: Project[]
}

function getDueDateInfo(dueDate: string) {
  const today = new Date()
  const due = new Date(dueDate)

  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)

  const diff = Math.ceil(
    (due.getTime() - today.getTime()) /
    (1000 * 60 * 60 * 24),
  )

  if (diff < 0) {
    return {
      label: `${Math.abs(diff)}d overdue`,
      className: "text-destructive",
    }
  }

  if (diff === 0) {
    return {
      label: "Due today",
      className:
        "text-amber-600 dark:text-amber-400",
    }
  }

  if (diff <= 7) {
    return {
      label: `${diff}d left`,
      className:
        "text-amber-600 dark:text-amber-400",
    }
  }

  return {
    label: new Date(dueDate).toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    ),
    className: "text-muted-foreground",
  }
}

export function ProjectList({
  projects,
}: ProjectListProps) {
  const navigate = useNavigate()

  return (
    <div className="space-y-2">
      {projects.map((project) => {
        const dueDate = getDueDateInfo(project.dueDate)

        return (
          <Card
            key={project.id}
            className="group relative overflow-hidden border bg-card transition-colors hover:bg-muted/40"
          >

            <div
              role="button"
              tabIndex={0}
              className="cursor-pointer p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              onClick={() =>
                navigate(
                  `/app/projects/${project.id}`,
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault()

                  navigate(
                    `/app/projects/${project.id}`,
                  )
                }
              }}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                {/* Project */}
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  {/* Project icon */}
                  <Avatar className="size-10 rounded-xl">
                    <AvatarFallback className="rounded-xl bg-muted text-sm font-semibold border">
                      {project.name
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <h3 className="truncate text-sm font-semibold tracking-tight">
                        {project.name}
                      </h3>

                      {project.projectStatus ===
                        "COMPLETED" && (
                          <Badge
                            variant="secondary"
                            className="hidden shrink-0 rounded-md px-1.5 py-0 text-[10px] sm:inline-flex"
                          >
                            Complete
                          </Badge>
                        )}
                    </div>

                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {project.description ||
                        "No description provided"}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="shrink-0">
                  <ProjectStatusBadge
                    status={project.projectStatus}
                  />
                </div>

                {/* Owner */}
                <div className="flex min-w-32 items-center gap-2 text-sm text-muted-foreground">
                  <Avatar className="size-5 shrink-0">

                    <AvatarFallback className="text-[10px]">
                      {project.owner.firstName.charAt(0)}
                      {project.owner.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <span className="truncate">
                    {project.owner.firstName}{" "}
                    {project.owner.lastName}
                  </span>
                </div>

                {/* Due date */}
                <div
                  className={`flex min-w-28 items-center gap-2 text-sm ${dueDate.className}`}
                >
                  <CalendarDays className="size-4 shrink-0" />

                  <span className="truncate">
                    {dueDate.label}
                  </span>
                </div>

                {/* Updated */}
                <div className="hidden min-w-24 items-center gap-2 text-xs text-muted-foreground xl:flex">
                  <Clock3 className="size-3.5 shrink-0" />

                  <span>
                    {new Date(
                      project.updatedAt,
                    ).toLocaleDateString(
                      undefined,
                      {
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center justify-end">
                  <Button variant="secondary" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}