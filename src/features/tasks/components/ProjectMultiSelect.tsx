import { useState, useMemo, useEffect, useRef } from "react"
import { Check, ChevronDown, FolderKanban, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

export interface ProjectOption {
  id: string
  name: string
}

interface ProjectMultiSelectProps {
  projects: ProjectOption[]
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
  loading?: boolean
}

export default function ProjectMultiSelect({
  projects = [],
  selectedIds = [],
  onChange,
  loading = false,
}: ProjectMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return projects
    return projects.filter((p) => p.name.toLowerCase().includes(q))
  }, [projects, search])

  const isAllSelected = !selectedIds || selectedIds.length === 0

  const handleSelectAll = () => {
    onChange([])
  }

  const handleToggleProject = (id: string) => {
    if (selectedIds.includes(id)) {
      const next = selectedIds.filter((pId) => pId !== id)
      onChange(next)
    } else {
      onChange([...selectedIds, id])
    }
  }

  const getButtonLabel = () => {
    if (isAllSelected) {
      return "All Projects"
    }
    if (selectedIds.length === 1) {
      const found = projects.find((p) => p.id === selectedIds[0])
      return found ? found.name : "1 project"
    }
    return `${selectedIds.length} projects`
  }

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id="project-multi-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-7.5 max-w-56 cursor-pointer items-center justify-between gap-1.5 rounded-md border bg-background px-2.5 text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <div className="flex min-w-0 items-center gap-1.5 truncate">
          <FolderKanban className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{getButtonLabel()}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {!isAllSelected && (
            <Badge
              variant="secondary"
              className="px-1.5 py-0 text-[10px] font-semibold"
            >
              {selectedIds.length}
            </Badge>
          )}
          <ChevronDown
            className={`size-3.5 opacity-50 transition-transform duration-150 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu / Mobile centered modal */}
      {open && (
        <div 
          className={cn(
            // Mobile: centered modal backdrop
            "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs",
            // Desktop: absolute dropdown
            "sm:absolute sm:inset-auto sm:right-auto sm:left-0 sm:mt-1.5 sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false)
            }
          }}
        >
          <div 
            className="w-full max-w-xs sm:w-72 rounded-xl border bg-popover p-2 text-popover-foreground shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full rounded-md border bg-transparent py-1 pl-8 pr-7 text-xs outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-56 overflow-y-auto space-y-0.5 text-xs">
              {/* "All Projects" Option */}
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium hover:bg-muted"
              >
                <div className="flex items-center gap-2">
                  <div className="flex size-5 items-center justify-center rounded bg-primary/10 text-primary">
                    <FolderKanban className="size-3" />
                  </div>
                  <span>All Projects</span>
                </div>
                {isAllSelected && <Check className="size-3.5 text-primary" />}
              </button>

              <div className="my-1 border-t" />

              {loading && projects.length === 0 ? (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  Loading projects...
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  No projects found.
                </div>
              ) : (
                filteredProjects.map((project) => {
                  const checked = selectedIds.includes(project.id)
                  return (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => handleToggleProject(project.id)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
                    >
                      <Checkbox
                        checked={checked}
                        className="size-3.5 pointer-events-none"
                      />
                      <span className="truncate flex-1">{project.name}</span>
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer with Reset action */}
            {!isAllSelected && (
              <div className="flex items-center justify-between border-t pt-2 text-[11px]">
                <span className="text-muted-foreground">
                  {selectedIds.length} selected
                </span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="font-medium text-primary hover:underline cursor-pointer"
                >
                  Reset to All
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
