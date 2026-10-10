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
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

import type { Project } from "../types/project.types"
import StatusBadge from "@/components/common/StatusBadge"
import { Button } from "@/components/ui/button"

interface ProjectCardProps {
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
      icon: Clock3,
    }
  }

  if (diff === 0) {
    return {
      label: "Due today",
      className:
        "text-amber-600 dark:text-amber-400",
      icon: Clock3,
    }
  }

  if (diff <= 7) {
    return {
      label: `${diff}d left`,
      className:
        "text-amber-600 dark:text-amber-400",
      icon: Clock3,
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
    icon: CalendarDays,
  }
}

export function ProjectCard({
  projects,
}: ProjectCardProps) {
  const navigate = useNavigate()

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {projects.map((project) => {
        const dueDate = getDueDateInfo(project.dueDate)
        const DueIcon = dueDate.icon

        return (
          <Card
            key={project.id}
            className="group relative min-w-0 overflow-hidden border bg-card cursor-pointer transition-colors hover:bg-muted/40"
            onClick={() =>
              navigate(`/app/projects/${project.id}`)
            }
          >

            <CardHeader className="min-w-0 space-y-4 pb-4">
              {/* Project heading */}
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar className="size-10 rounded-xl">
                    <AvatarFallback className="rounded-xl bg-muted text-sm font-semibold border">
                      {project.name
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <h3
                      className="truncate text-sm font-semibold tracking-tight"
                      title={project.name}
                    >
                      {project.name}
                    </h3>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Project
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="shrink-0"
                >
                  View
                </Button>
              </div>

              {/* Status + owner */}
              <div className="flex min-w-0 items-center justify-between gap-2">
                <StatusBadge
                  status={project.projectStatus}
                />

                <div
                  className="flex min-w-0 max-w-[50%] items-center gap-2 rounded-md px-2 py-0.5 text-xs text-muted-foreground"
                  title={`${project.owner.firstName} ${project.owner.lastName}`}
                >
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
              </div>

              {/* Description */}
              <p
                className="line-clamp-2 min-h-10 overflow-hidden text-sm leading-5 text-muted-foreground"
                title={project.description || undefined}
              >
                {project.description ||
                  "No description provided for this project."}
              </p>
            </CardHeader>

            <CardContent className="min-w-0">
              <div className="flex min-w-0 items-center justify-between gap-3 border-t pt-3">
                {/* Due date */}
                <div
                  className={`flex min-w-0 items-center gap-2 ${dueDate.className}`}
                  title={dueDate.label}
                >
                  <DueIcon className="size-4 shrink-0" />

                  <span className="truncate text-xs">
                    {dueDate.label}
                  </span>
                </div>

                {/* Updated */}
                <span className="shrink-0 text-xs text-muted-foreground">
                  Updated{" "}
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
            </CardContent>

          </Card>
        )
      })}
    </div>
  )
}