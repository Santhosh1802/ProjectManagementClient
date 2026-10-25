import { useEffect, useState } from "react"
import { Plus, X } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Kbd } from "@/components/ui/kbd"
import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"

import type {
  ProjectFilters,
  ProjectView,
} from "@/features/projects/types/project.types"
import type { SavedView } from "@/features/savedviews/types/savedView.types"

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

  const [searchParams, setSearchParams] = useSearchParams()
  const [activeSavedViewId, setActiveSavedViewId] = useState<string | null>(null)

  const [filters, setFilters] = useState<ProjectFilters>(() => {
    const qScope = (searchParams.get("scope") || "ALL") as ProjectFilters["scope"]
    const qSearch = searchParams.get("search") || ""
    const qStatus = (searchParams.get("status") || "ALL") as ProjectFilters["status"]
    const qOwnerId = searchParams.get("ownerId") || "ALL"
    const qDueDate = (searchParams.get("dueDate") || "ALL") as ProjectFilters["dueDate"]
    const qSortBy = (searchParams.get("sortBy") || "createdAt") as ProjectFilters["sortBy"]
    const qSortOrder = (searchParams.get("sortOrder") || "desc") as ProjectFilters["sortOrder"]

    return {
      scope: qScope,
      search: qSearch,
      status: qStatus,
      ownerId: qOwnerId,
      dueDate: qDueDate,
      sortBy: qSortBy,
      sortOrder: qSortOrder,
    }
  })

  // Synchronize active filters with URL query parameters
  useEffect(() => {
    const nextParams = new URLSearchParams()
    if (filters.search) nextParams.set("search", filters.search)
    if (filters.scope !== "ALL") nextParams.set("scope", filters.scope)
    if (filters.status !== "ALL") nextParams.set("status", filters.status)
    if (filters.ownerId !== "ALL") nextParams.set("ownerId", filters.ownerId)
    if (filters.dueDate !== "ALL") nextParams.set("dueDate", filters.dueDate)
    if (filters.sortBy !== "createdAt") nextParams.set("sortBy", filters.sortBy)
    if (filters.sortOrder !== "desc") nextParams.set("sortOrder", filters.sortOrder)

    setSearchParams(nextParams, { replace: true })
  }, [filters, setSearchParams])

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

  const [view, setView] = useState<ProjectView>("card")

  const handleCreateProject = () => {
    navigate("/app/projects/create")
  }

  const handleFiltersChange = (
    nextFilters: ProjectFilters
  ) => {
    setFilters(nextFilters)
    setActiveSavedViewId(null)
    if (page !== 0) {
      dispatch(setProjectPage(0))
    }
  }

  const handleApplySavedView = (savedView: SavedView) => {
    try {
      const parsed = JSON.parse(savedView.filtersJson)
      const nextFilters: ProjectFilters = {
        scope: parsed.scope || "ALL",
        search: parsed.search || "",
        status: parsed.status || "ALL",
        ownerId: parsed.ownerId || "ALL",
        dueDate: parsed.dueDate || "ALL",
        sortBy: (savedView.sortBy as ProjectFilters["sortBy"]) || "createdAt",
        sortOrder: (savedView.sortOrder as ProjectFilters["sortOrder"]) || "desc",
      }
      setFilters(nextFilters)
      setActiveSavedViewId(savedView.id)
      if (page !== 0) {
        dispatch(setProjectPage(0))
      }
    } catch (e) {
      console.error("Failed to parse project saved view:", e)
    }
  }

  const handleClearActiveSavedView = () => {
    setActiveSavedViewId(null)
    setFilters({
      scope: "ALL",
      search: "",
      status: "ALL",
      ownerId: "ALL",
      dueDate: "ALL",
      sortBy: "createdAt",
      sortOrder: "desc",
    })
    if (page !== 0) {
      dispatch(setProjectPage(0))
    }
  }

  const handleResetAllFilters = () => {
    handleClearActiveSavedView()
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
            className="w-fit sm:w-auto gap-2"
          >
            <Plus className="size-4" />
            <span>Create Project</span>
            <span className="hidden sm:inline-flex items-center gap-0.5 ml-1 opacity-75">
              <Kbd className="h-4 min-w-4 px-1 text-[9px] bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 font-mono">C</Kbd>
              <Kbd className="h-4 min-w-4 px-1 text-[9px] bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 font-mono">P</Kbd>
            </span>
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
        activeViewId={activeSavedViewId}
        onApplySavedView={handleApplySavedView}
        onClearActiveSavedView={handleClearActiveSavedView}
      />

      {/* Active Filter Chips */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-muted-foreground mr-1">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="gap-1 text-xs py-0.5">
              <span>Keyword: "{filters.search}"</span>
              <button
                type="button"
                onClick={() => handleFiltersChange({ ...filters, search: "" })}
                className="hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
          {filters.scope !== "ALL" && (
            <Badge variant="secondary" className="gap-1 text-xs py-0.5">
              <span>Scope: {filters.scope}</span>
              <button
                type="button"
                onClick={() => handleFiltersChange({ ...filters, scope: "ALL" })}
                className="hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
          {filters.status !== "ALL" && (
            <Badge variant="secondary" className="gap-1 text-xs py-0.5">
              <span>Status: {filters.status}</span>
              <button
                type="button"
                onClick={() => handleFiltersChange({ ...filters, status: "ALL" })}
                className="hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
          {filters.dueDate !== "ALL" && (
            <Badge variant="secondary" className="gap-1 text-xs py-0.5">
              <span>Due: {filters.dueDate.replace("_", " ")}</span>
              <button
                type="button"
                onClick={() => handleFiltersChange({ ...filters, dueDate: "ALL" })}
                className="hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
          <button
            type="button"
            onClick={handleResetAllFilters}
            className="text-xs text-primary hover:underline ml-1 font-medium"
          >
            Reset all
          </button>
        </div>
      )}

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