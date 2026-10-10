import { useEffect, useState } from "react"
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  Pencil,
  Users,
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"

import { getProjectById } from "@/features/projects/services/projects.services"

import { getProjectMembers } from "@/features/projects/services/project.members.service"

import { getTasksByProject } from "@/features/tasks/services/task.services"

import {
  setSelectedProject,
  setProjectLoading,
  setProjectError,
} from "@/features/projects/slice/projectSlice"

import {
  setProjectMembers,
  setProjectMemberLoading,
  setProjectMemberError,
  setProjectMemberPage,
} from "@/features/projects/slice/projectMemberSlice"

import {
  setTasks,
  setTaskLoading,
  setTaskError,
  setTaskPage,
} from "@/features/tasks/slice/task.slice"

import type {
  Project,
  ProjectMember,
} from "@/features/projects/types/project.types"

import type { Task } from "@/features/tasks/types/task.types"

import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"
import EditProjectModal from "@/features/projects/components/EditProjectModel"
import TaskCard from "@/features/tasks/components/TaskCard"

import { getProjectPermissions } from "@/features/projects/utils/projectPermission"
import PageContainer from "@/components/common/PageContainer"
import ErrorState from "@/components/common/ErrorState"
import StatusBadge from "@/components/common/StatusBadge"

/* ============================================================
   Helpers
   ============================================================ */

function formatDate(value: string | null | undefined) {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date)
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function getStatusLabel(status: Project["projectStatus"]) {
  switch (status) {
    case "PLANNING":
      return "Planning"

    case "ACTIVE":
      return "Active"

    case "COMPLETED":
      return "Completed"

    case "ARCHIVED":
      return "Archived"

    default:
      return status
  }
}

// getStatusClassName removed to use StatusBadge

function getInitials(firstName: string, lastName: string) {
  const first = firstName?.charAt(0) ?? ""
  const last = lastName?.charAt(0) ?? ""

  return `${first}${last}`.toUpperCase()
}

// Unused functions removed to fix lint

/* ============================================================
   Pagination
   ============================================================ */

interface PaginationProps {
  page: number
  totalPages: number
  first: boolean
  last: boolean
  onPrevious: () => void
  onNext: () => void
}

function Pagination({
  page,
  totalPages,
  first,
  last,
  onPrevious,
  onNext,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="mt-5 flex items-center justify-between border-t pt-4">
      <p className="text-xs text-muted-foreground">
        Page {page + 1} of {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={first}
          onClick={onPrevious}
        >
          Previous
        </Button>

        <Button variant="outline" size="sm" disabled={last} onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  )
}

/* ============================================================
   Page
   ============================================================ */

export default function ProjectDetailsPage() {
  const navigate = useNavigate()
  const { projectId } = useParams()
  const currentUser = useAppSelector((state) => state.auth.user)
  const [editProjectOpen, setEditProjectOpen] = useState(false)

  const dispatch = useAppDispatch()

  /* ----------------------------------------------------------
     Project Redux state
     ---------------------------------------------------------- */

  const {
    selectedProject: project,
    loading: projectLoading,
    error: projectError,
  } = useAppSelector((state) => state.project)

  /* ----------------------------------------------------------
     Project members Redux state
     ---------------------------------------------------------- */

  const {
    members,
    page: memberPage,
    size: memberPageSize,
    totalElements: totalMembers,
    totalPages: memberTotalPages,
    first: memberFirst,
    last: memberLast,
    loading: membersLoading,
    error: membersError,
  } = useAppSelector((state) => state.projectMember)

  /* ----------------------------------------------------------
     Tasks Redux state
     ---------------------------------------------------------- */

  const {
    tasks,
    page: taskPage,
    size: taskPageSize,
    totalElements: totalTasks,
    totalPages: taskTotalPages,
    first: taskFirst,
    last: taskLast,
    loading: tasksLoading,
    error: tasksError,
  } = useAppSelector((state) => state.task)
  const currentProjectMember = members.find(
    (member) => member.user.id === currentUser?.id
  )

  const permissions = getProjectPermissions({
    userId: currentUser?.id || "",
    userRole: currentUser?.user_role || "",
    projectOwnerId: project?.owner.id || "",
    projectRole: currentProjectMember?.projectRole,
  })
  /* ==========================================================
     Load project
     ========================================================== */

  useEffect(() => {
    if (!projectId) {
      dispatch(setProjectError("Project ID is missing."))

      return
    }

    let cancelled = false

    async function loadProject() {
      dispatch(setProjectLoading(true))
      dispatch(setProjectError(null))

      try {
        const projectData = await getProjectById({
          id: projectId || "",
        })

        if (cancelled) return

        dispatch(setSelectedProject(projectData))
      } catch (error) {
        if (cancelled) return

        dispatch(
          setProjectError(
            error instanceof Error ? error.message : "Failed to load project."
          )
        )
      } finally {
        if (!cancelled) {
          dispatch(setProjectLoading(false))
        }
      }
    }

    loadProject()

    return () => {
      cancelled = true
    }
  }, [dispatch, projectId])

  /* ==========================================================
     Load project members
     ========================================================== */

  useEffect(() => {
    if (!projectId) {
      return
    }

    let cancelled = false

    async function loadMembers() {
      dispatch(setProjectMemberLoading(true))
      dispatch(setProjectMemberError(null))

      try {
        const memberData = await getProjectMembers({
          projectId: projectId || "",
          page: memberPage,
          size: memberPageSize,
        })

        if (cancelled) return

        dispatch(setProjectMembers(memberData))
      } catch (error) {
        if (cancelled) return

        dispatch(
          setProjectMemberError(
            error instanceof Error
              ? error.message
              : "Failed to load project members."
          )
        )
      } finally {
        if (!cancelled) {
          dispatch(setProjectMemberLoading(false))
        }
      }
    }

    loadMembers()

    return () => {
      cancelled = true
    }
  }, [dispatch, projectId, memberPage, memberPageSize])

  /* ==========================================================
     Load project tasks
     ========================================================== */

  useEffect(() => {
    if (!projectId) {
      return
    }

    let cancelled = false

    async function loadTasks() {
      dispatch(setTaskLoading(true))
      dispatch(setTaskError(null))

      try {
        const taskData = await getTasksByProject({
          projectId: projectId || "",
          page: taskPage,
          size: taskPageSize,
        })

        if (cancelled) return

        dispatch(setTasks(taskData))
      } catch (error) {
        if (cancelled) return

        dispatch(
          setTaskError(
            error instanceof Error
              ? error.message
              : "Failed to load project tasks."
          )
        )
      } finally {
        if (!cancelled) {
          dispatch(setTaskLoading(false))
        }
      }
    }

    loadTasks()

    return () => {
      cancelled = true
    }
  }, [dispatch, projectId, taskPage, taskPageSize])

  /* ==========================================================
     Loading
     ========================================================== */

  if (projectLoading) {
    return (
      <PageContainer>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/app/projects")}
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />

            <div className="h-7 w-64 animate-pulse rounded bg-muted" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-48 animate-pulse rounded-xl border bg-muted/40 lg:col-span-2" />

          <div className="h-48 animate-pulse rounded-xl border bg-muted/40" />
        </div>

        <div className="h-64 animate-pulse rounded-xl border bg-muted/40" />

        <div className="h-64 animate-pulse rounded-xl border bg-muted/40" />
      </PageContainer>
    )
  }

  /* ==========================================================
     Error
     ========================================================== */

  if (projectError || !project) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <ErrorState
          title="Unable to load project"
          description={projectError ?? "The project could not be found."}
          retryAction={() => {
            if (!projectId) {
              navigate("/app/projects")
              return
            }
            dispatch(setProjectError(null))
            dispatch(setProjectLoading(true))
          }}
        />
      </div>
    )
  }

  /* ==========================================================
     Render
     ========================================================== */

  return (
    <PageContainer>
      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/app/projects")}
            aria-label="Back to projects"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Project</p>

              <StatusBadge status={project.projectStatus} />
            </div>

            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {project.name}
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {project.description || "No project description provided."}
            </p>
          </div>
        </div>

        {permissions?.canEditProject && (
          <Button onClick={() => setEditProjectOpen(true)}>
            <Pencil className="size-4" />
            Edit Project
          </Button>
        )}
      </div>

      {/* ======================================================
          PROJECT OVERVIEW
          ====================================================== */}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main overview */}

        <div className="rounded-xl border bg-card lg:col-span-2">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold">Overview</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Project timeline and current status.
            </p>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2">
            {/* Status */}

            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle2 className="size-4 text-primary" />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Status</p>

                <p className="mt-1 text-sm font-medium">
                  {getStatusLabel(project.projectStatus)}
                </p>
              </div>
            </div>

            {/* Start date */}

            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <CalendarDays className="size-4 text-primary" />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Start date</p>

                <p className="mt-1 text-sm font-medium">
                  {formatDate(project.startDate)}
                </p>
              </div>
            </div>

            {/* Due date */}

            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Clock3 className="size-4 text-primary" />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Due date</p>

                <p className="mt-1 text-sm font-medium">
                  {formatDate(project.dueDate)}
                </p>
              </div>
            </div>

            {/* Members */}

            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Users className="size-4 text-primary" />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Members</p>

                <p className="mt-1 text-sm font-medium">
                  {membersLoading ? "Loading..." : totalMembers}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Owner */}

        <div className="rounded-xl border bg-card">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold">Project owner</h2>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {getInitials(project.owner.firstName, project.owner.lastName)}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {project.owner.firstName} {project.owner.lastName}
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  {project.owner.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          MEMBERS
          ====================================================== */}

      <div className="rounded-xl border bg-card">
        <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Members</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              People working on this project.
            </p>
          </div>

          {permissions.canManageMembers && (
            <Button
              variant="outline"
              onClick={() =>
                navigate(`/app/projects/${project.id}/members`)
              }
            >
              <Users className="size-4" />
              Manage members
            </Button>
          )}
        </div>

        <div className="p-5">
          {membersError ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-5 text-center">
              <p className="text-sm font-medium text-destructive">
                Failed to load members
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {membersError}
              </p>

              <Button
                className="mt-4"
                variant="outline"
                size="sm"
                onClick={() => dispatch(setProjectMemberPage(memberPage))}
              >
                Retry
              </Button>
            </div>
          ) : membersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-14 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
                <Users className="size-4 text-muted-foreground" />
              </div>

              <p className="text-sm font-medium">No members yet</p>

              <p className="mt-1 text-xs text-muted-foreground">
                Add members to start collaborating.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((member: ProjectMember) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {getInitials(member.user.firstName, member.user.lastName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {member.user.firstName} {member.user.lastName}
                        </p>
                      </div>

                      <p className="truncate text-xs text-muted-foreground">
                        {member.user.email}
                      </p>

                      <span className="mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                        {member.projectRole}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                page={memberPage}
                totalPages={memberTotalPages}
                first={memberFirst}
                last={memberLast}
                onPrevious={() =>
                  dispatch(setProjectMemberPage(Math.max(0, memberPage - 1)))
                }
                onNext={() =>
                  dispatch(
                    setProjectMemberPage(
                      Math.min(memberTotalPages - 1, memberPage + 1)
                    )
                  )
                }
              />
            </>
          )}
        </div>
      </div>

      {/* ======================================================
          TASKS
          ====================================================== */}

      <div className="rounded-xl border bg-card">
        <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">Tasks</h2>

              {!tasksLoading && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  {totalTasks}
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Track work and keep the project moving.
            </p>
          </div>

          <Button onClick={() => navigate(`/app/projects/${project.id}/tasks`)}>
            View all tasks
          </Button>
        </div>

        <div className="p-5">
          {tasksError ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-5 text-center">
              <p className="text-sm font-medium text-destructive">
                Failed to load tasks
              </p>

              <p className="mt-1 text-xs text-muted-foreground">{tasksError}</p>

              <Button
                className="mt-4"
                variant="outline"
                size="sm"
                onClick={() => dispatch(setTaskPage(taskPage))}
              >
                Retry
              </Button>
            </div>
          ) : tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed px-5 py-8 text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
                <CircleUserRound className="size-4 text-muted-foreground" />
              </div>

              <p className="text-sm font-medium">No tasks yet</p>

              <p className="mt-1 max-w-md text-xs text-muted-foreground">
                Create tasks for this project to start tracking work.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {tasks.map((task: Task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onView={(t) => {
                      window.location.href = `/app/tasks/${t.id}`
                    }}
                  />
                ))}
              </div>

              <Pagination
                page={taskPage}
                totalPages={taskTotalPages}
                first={taskFirst}
                last={taskLast}
                onPrevious={() =>
                  dispatch(setTaskPage(Math.max(0, taskPage - 1)))
                }
                onNext={() =>
                  dispatch(
                    setTaskPage(Math.min(taskTotalPages - 1, taskPage + 1))
                  )
                }
              />
            </>
          )}
        </div>
      </div>

      {/* ======================================================
          PROJECT INFORMATION
          ====================================================== */}

      <div className="rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Project information</h2>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Project ID</p>

            <p className="mt-1 font-mono text-xs break-all">{project.id}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Created</p>

            <p className="mt-1 text-sm">{formatDateTime(project.createdAt)}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Last updated</p>

            <p className="mt-1 text-sm">{formatDateTime(project.updatedAt)}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Project status</p>

            <p className="mt-1 text-sm">
              {getStatusLabel(project.projectStatus)}
            </p>
          </div>
        </div>
      </div>
      {permissions?.canEditProject && (
        <EditProjectModal
          key={`${project.id}-${editProjectOpen}`}
          project={project}
          open={editProjectOpen}
          onOpenChange={setEditProjectOpen}
          onUpdated={(updatedProject) => {
            dispatch(setSelectedProject(updatedProject))
          }}
        />
      )}
    </PageContainer>
  )
}
