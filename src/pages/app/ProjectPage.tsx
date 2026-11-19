import { useEffect, useMemo, useState } from "react"
import { Download, Plus, X } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/toast"
import { downloadCsv } from "@/lib/csvExport"
import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import DataPagination from "@/components/common/DataPagination"
import ShortcutHint from "@/components/common/ShortcutHint"

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
  setProjects,
  setProjectLoading,
  setProjectError,
  setProjectPage,
  setProjectPageSize,
} from "@/features/projects/slice/projectSlice"

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

  const displayedProjects = useMemo(() => {
    if (filters.dueDate === "ALL") return projects
    const now = Date.now()
    const oneDayMs = 24 * 60 * 60 * 1000
    const sevenDaysMs = 7 * oneDayMs
    const thirtyDaysMs = 30 * oneDayMs
    return projects.filter((p) => {
      if (!p.dueDate) return false
      const dueTime = new Date(p.dueDate).getTime()
      if (filters.dueDate === "OVERDUE") {
        return (
          dueTime < now &&
          p.projectStatus !== "COMPLETED" &&
          p.projectStatus !== "ARCHIVED"
        )
      }
      if (filters.dueDate === "DUE_TODAY") {
        const dueDateStr = new Date(p.dueDate).toDateString()
        const todayStr = new Date().toDateString()
        return dueDateStr === todayStr
      }
      if (filters.dueDate === "DUE_THIS_WEEK") {
        return dueTime >= now && dueTime <= now + sevenDaysMs
      }
      if (filters.dueDate === "DUE_THIS_MONTH") {
        return dueTime >= now && dueTime <= now + thirtyDaysMs
      }
      return true
    })
  }, [projects, filters.dueDate])

  const handleExportCsv = () => {
    downloadCsv("projects-export.csv", displayedProjects, [
      { header: "Name", accessor: (p) => p.name },
      { header: "Status", accessor: (p) => p.projectStatus },
      {
        header: "Owner",
        accessor: (p) =>
          p.owner
            ? `${p.owner.firstName ?? ""} ${p.owner.lastName ?? ""}`.trim()
            : "",
      },
      { header: "Owner Email", accessor: (p) => p.owner?.email ?? "" },
      { header: "Start Date", accessor: (p) => p.startDate },
      { header: "Due Date", accessor: (p) => p.dueDate },
      { header: "Description", accessor: (p) => p.description ?? "" },
      { header: "Created At", accessor: (p) => p.createdAt },
    ])
    toast.add({
      type: "success",
      title: "CSV exported",
      description: `Exported ${displayedProjects.length} project${displayedProjects.length === 1 ? "" : "s"}.`,
    })
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
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={displayedProjects.length === 0}
              className="h-8 gap-1.5 text-xs"
            >
              <Download className="size-3.5" />
              <span>Export CSV</span>
            </Button>
            <Button
              onClick={handleCreateProject}
              className="w-fit sm:w-auto gap-2"
            >
              <Plus className="size-4" />
              <span>Create Project</span>
              <ShortcutHint
                keys={["c", "p"]}
                sequence
                compact
                decorative
                variant="onPrimary"
                className="hidden sm:inline-flex ml-1"
              />
            </Button>
          </div>
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
        <div className="flex flex-wrap items-center gap-1.5 pt-1 min-w-0">
          <span className="text-xs text-muted-foreground mr-1">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="gap-1 text-xs py-0.5 max-w-full">
              <span className="max-w-[200px] truncate">Keyword: "{filters.search}"</span>
              <button
                type="button"
                onClick={() => handleFiltersChange({ ...filters, search: "" })}
                className="hover:text-destructive shrink-0"
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

      {!loading && displayedProjects.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {displayedProjects.length}
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

      {!loading && displayedProjects.length === 0 && (
        <ProjectEmptyState
          hasFilters={hasFilters}
        />
      )}

      {/* Card */}

      {!loading &&
        displayedProjects.length > 0 &&
        view === "card" && (
          <ProjectCard
            projects={displayedProjects}
          />
        )}

      {/* List */}

      {!loading &&
        displayedProjects.length > 0 &&
        view === "list" && (
          <ProjectList
            projects={displayedProjects}
          />
        )}

      {/* Table */}

      {!loading &&
        displayedProjects.length > 0 &&
        view === "table" && (
          <ProjectTable
            projects={displayedProjects}
          />
        )}

      {/* Pagination */}
      {!loading && totalElements > 0 && (
        <DataPagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={size}
          itemLabel="projects"
          onPageChange={(nextPage) => dispatch(setProjectPage(nextPage))}
          onPageSizeChange={(newSize) => {
            dispatch(setProjectPageSize(newSize))
            dispatch(setProjectPage(0))
          }}
        />
      )}

    </PageContainer>
  )
}