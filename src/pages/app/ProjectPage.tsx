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
import { useProjectsQuery } from "@/features/projects/hooks/useProjectsQuery"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import {
  setProjects,
  setProjectLoading,
  setProjectError,
  setProjectPage,
  setProjectPageSize,
} from "@/features/projects/slice/projectSlice"

function getPaginationItems(
  totalPages: number,
  currentPage: number
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index)
  }

  const pages = new Set<number>([
    0,
    totalPages - 1,
    currentPage,
    currentPage - 1,
    currentPage + 1,
  ])

  const visiblePages = [...pages]
    .filter((p) => p >= 0 && p < totalPages)
    .sort((a, b) => a - b)

  const result: (number | "ellipsis")[] = []

  visiblePages.forEach((p, index) => {
    if (index > 0 && p - visiblePages[index - 1] > 1) {
      result.push("ellipsis")
    }
    result.push(p)
  })

  return result
}

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

  const searchRequest = {
    page,
    size,
    keyword: filters.search.trim() || undefined,
    scope: filters.scope,
    status: filters.status !== "ALL" ? filters.status : undefined,
    ownerId: filters.ownerId !== "ALL" ? filters.ownerId : undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  }

  const {
    data: projectsResponse,
    isLoading: queryLoading,
    isFetching: queryFetching,
    error: queryError,
    refetch,
  } = useProjectsQuery(searchRequest)

  useEffect(() => {
    dispatch(setProjectLoading(queryLoading))
  }, [dispatch, queryLoading])

  useEffect(() => {
    if (projectsResponse) {
      dispatch(setProjects(projectsResponse))
    }
  }, [dispatch, projectsResponse])

  useEffect(() => {
    if (queryError) {
      console.error("Failed to load projects:", queryError)
      dispatch(setProjectError("Unable to load projects. Please try again."))
    } else {
      dispatch(setProjectError(null))
    }
  }, [dispatch, queryError])

  const handleCreateProject = () => {
    navigate("/app/projects/create")
  }

  const handleFiltersChange = (
    nextFilters: ProjectFilters
  ) => {
    setFilters(nextFilters)
    if (page !== 0) {
      dispatch(setProjectPage(0))
    }
  }

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader 
        title="Projects"
        description="Manage and track your projects."
        onRefresh={() => void refetch()}
        isRefreshing={queryFetching}
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
          if (page !== 0) {
            dispatch(setProjectPage(0))
          }
        }}
      />

      {/* Toolbar */}

      <ProjectToolbar
        filters={filters}
        view={view}
        onFiltersChange={handleFiltersChange}
        onViewChange={setView}
        pageSize={size}
        onPageSizeChange={(newSize) => {
          dispatch(setProjectPageSize(newSize))
          dispatch(setProjectPage(0))
        }}
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
      {!loading && totalElements > 0 && (
        <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * size + 1}–{Math.min((page + 1) * size, totalElements)} of{" "}
            {totalElements.toLocaleString("en-IN")} projects
          </p>

          <Pagination className="mx-0 w-auto justify-start sm:justify-end">
            <PaginationContent className="flex-wrap">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={page === 0}
                  tabIndex={page === 0 ? -1 : undefined}
                  className={
                    page === 0
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                  onClick={(event) => {
                    event.preventDefault()
                    if (page > 0) {
                      dispatch(setProjectPage(page - 1))
                    }
                  }}
                />
              </PaginationItem>

              {getPaginationItems(totalPages, page).map((item, index) => (
                <PaginationItem key={`${item}-${index}`}>
                  {item === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      isActive={page === item}
                      aria-label={`Go to page ${item + 1}`}
                      aria-current={page === item ? "page" : undefined}
                      onClick={(event) => {
                        event.preventDefault()
                        if (page !== item) {
                          dispatch(setProjectPage(item))
                        }
                      }}
                    >
                      {item + 1}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={page >= totalPages - 1}
                  tabIndex={page >= totalPages - 1 ? -1 : undefined}
                  className={
                    page >= totalPages - 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                  onClick={(event) => {
                    event.preventDefault()
                    if (page < totalPages - 1) {
                      dispatch(setProjectPage(page + 1))
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

    </PageContainer>
  )
}