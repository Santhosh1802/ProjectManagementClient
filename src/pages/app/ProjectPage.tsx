import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"

import type {
  ProjectFilters,
  ProjectView,
} from "@/features/projects/types/project.types"

import { ProjectToolbar } from "@/features/projects/components/ProjectToolbar"
import { ProjectCard } from "@/features/projects/components/ProjectCard"
import { ProjectList } from "@/features/projects/components/ProjectList"
import { ProjectTable } from "@/features/projects/components/ProjectTable"
import { ProjectCardSkeleton } from "@/features/projects/components/ProjectCardSkeleton"
import { ProjectListSkeleton } from "@/features/projects/components/ProjectListSkeleton"
import { ProjectTableSkeleton } from "@/features/projects/components/ProjectTableSkeleton"
import { ProjectEmptyState } from "@/features/projects/components/ProjectEmptyState"
import { ProjectScopeTabs } from "@/features/projects/components/ProjectScopeTabs"

import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"

import {
  searchProjects,
} from "@/features/projects/services/projects.services"

import {
  setProjects,
  setProjectLoading,
  setProjectError,
} from "@/features/projects/slice/projectSlice"

export default function ProjectPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [view, setView] = useState<ProjectView>("card")

  const [filters, setFilters] = useState<ProjectFilters>({
    scope: "ALL",
    search: "",
    status: "ALL",
    ownerId: "ALL",
    dueDate: "ALL",
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  const projects = useAppSelector(
    (state) => state.project.projects
  )

  const loading = useAppSelector(
    (state) => state.project.loading
  )

  const totalElements = useAppSelector(
    (state) => state.project.totalElements
  )

  const page = useAppSelector(
    (state) => state.project.page
  )

  const size = useAppSelector(
    (state) => state.project.size
  )

  const totalPages = useAppSelector(
    (state) => state.project.totalPages
  )

  const hasFilters =
    filters.search.trim() !== "" ||
    filters.status !== "ALL" ||
    filters.ownerId !== "ALL" ||
    filters.scope !== "ALL" ||
    filters.dueDate !== "ALL"

  useEffect(() => {
    let cancelled = false

    async function loadProjects() {
      try {
        dispatch(setProjectLoading(true))
        dispatch(setProjectError(null))

        const response = await searchProjects({
          page,
          size,

          keyword:
            filters.search.trim() || undefined,

          scope: filters.scope,

          status:
            filters.status !== "ALL"
              ? filters.status
              : undefined,

          ownerId:
            filters.ownerId !== "ALL"
              ? filters.ownerId
              : undefined,

          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        })

        if (cancelled) return
        dispatch(setProjects(response))
      } catch (error) {
        if (cancelled) return

        console.error(
          "Failed to load projects:",
          error
        )

        dispatch(
          setProjectError(
            "Unable to load projects. Please try again."
          )
        )
      } finally {
        if (!cancelled) {
          dispatch(setProjectLoading(false))
        }
      }
    }

    void loadProjects()

    return () => {
      cancelled = true
    }
  }, [
    dispatch,
    page,
    size,
    filters.search,
    filters.scope,
    filters.status,
    filters.ownerId,
    filters.sortBy,
    filters.sortOrder,
  ])

  const handleCreateProject = () => {
    navigate("/app/projects/create")
  }

  const handleFiltersChange = (
    nextFilters: ProjectFilters
  ) => {
    setFilters(nextFilters)

    /*
     * New search/filter = first page.
     *
     * We don't directly dispatch setProjectPage here
     * because that would create an unnecessary state
     * dependency inside this handler.
     */
  }
 

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader 
        title="Projects"
        description="Manage and track your projects."
        actions={
          <Button
            onClick={handleCreateProject}
            className="w-fit sm:w-auto"
          >
            <Plus className="size-4" />
            Create Project
          </Button>
        }
      />

      {/* Scope */}

      <ProjectScopeTabs
        scope={filters.scope}
        onScopeChange={(scope) => {
          setFilters((current) => ({
            ...current,
            scope,
            ownerId:
              scope === "OWNED"
                ? "ALL"
                : current.ownerId,
          }))
        }}
      />

      {/* Toolbar */}

      <ProjectToolbar
        filters={filters}
        view={view}
        onFiltersChange={handleFiltersChange}
        onViewChange={setView}
      />

      {/* Count */}

      {!loading && projects.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {projects.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {totalElements}
          </span>{" "}
          projects
        </div>
      )}

      {/* Loading */}

      {loading && (
        <>
          {view === "card" && (
            <ProjectCardSkeleton />
          )}

          {view === "list" && (
            <ProjectListSkeleton />
          )}

          {view === "table" && (
            <ProjectTableSkeleton />
          )}
        </>
      )}

      {/* Empty */}

      {!loading && projects.length === 0 && (
        <ProjectEmptyState
          hasFilters={hasFilters}
        />
      )}

      {/* Card */}

      {!loading &&
        projects.length > 0 &&
        view === "card" && (
          <ProjectCard
            projects={projects}
          />
        )}

      {/* List */}

      {!loading &&
        projects.length > 0 &&
        view === "list" && (
          <ProjectList
            projects={projects}
          />
        )}

      {/* Table */}

      {!loading &&
        projects.length > 0 &&
        view === "table" && (
          <ProjectTable
            projects={projects}
          />
        )}

      {/* Pagination */}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">

          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>

          <div className="flex gap-2">

            <Button
              variant="outline"
              disabled={page === 0}
              onClick={() =>
                dispatch({
                  type: "project/setProjectPage",
                  payload: page - 1,
                })
              }
            >
              Previous
            </Button>

            <Button
              variant="outline"
              disabled={page >= totalPages - 1}
              onClick={() =>
                dispatch({
                  type: "project/setProjectPage",
                  payload: page + 1,
                })
              }
            >
              Next
            </Button>

          </div>
        </div>
      )}

    </PageContainer>
  )
}