import { useMemo, useState } from "react"
import {
  ArrowLeft,
  Clock,
  Eye,
  FileText,
  Layers,
  Lock,
  Search,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DataPagination, { useClientPagination } from "@/components/common/DataPagination"
import type { Whiteboard } from "../types/whiteboard.types"

interface WhiteboardsDirectoryViewProps {
  boards: Whiteboard[]
  activeBoardId?: string
  onSelectBoard: (boardId: string) => void
  onBackToStudio: () => void
}

type VisibilityFilter = "all" | "workspace" | "project"
type SortBy = "updated" | "created" | "title"

function countElements(canvasJson: string): number {
  try {
    const parsed = JSON.parse(canvasJson) as unknown
    if (Array.isArray(parsed)) {
      return parsed.filter((e) => !(e as { isDeleted?: boolean })?.isDeleted).length
    }
    if (typeof parsed === "object" && parsed !== null && "elements" in parsed) {
      const els = (parsed as { elements?: unknown[] }).elements
      return Array.isArray(els)
        ? els.filter((e) => !(e as { isDeleted?: boolean })?.isDeleted).length
        : 0
    }
    return 0
  } catch {
    return 0
  }
}

export function WhiteboardsDirectoryView({
  boards,
  activeBoardId,
  onSelectBoard,
  onBackToStudio,
}: WhiteboardsDirectoryViewProps) {
  const [search, setSearch] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all")
  const [sortBy, setSortBy] = useState<SortBy>("updated")

  const filteredBoards = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = boards.filter((b) => {
      if (visibilityFilter === "workspace" && b.projectId) return false
      if (visibilityFilter === "project" && !b.projectId) return false
      if (!q) return true
      return (
        b.title.toLowerCase().includes(q) ||
        (b.projectName ?? "").toLowerCase().includes(q) ||
        b.createdByName.toLowerCase().includes(q) ||
        b.updatedByName.toLowerCase().includes(q)
      )
    })

    return [...list].sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title)
      if (sortBy === "created") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [boards, search, visibilityFilter, sortBy])

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalElements,
    totalPages,
    paginatedItems: paginatedBoards,
  } = useClientPagination(filteredBoards, 8)

  return (
    <div className="space-y-4">
      {/* Directory Header & Controls */}
      <Card className="border-border/80">
        <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">
              Available Whiteboards ({boards.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Browse all workspace and project-only meeting boards with timestamps and previews.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" variant="outline" onClick={onBackToStudio}>
              <ArrowLeft className="mr-1.5 size-3.5" />
              Back to Studio
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute top-2 left-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, project, or author..."
              aria-label="Search available whiteboards"
              aria-keyshortcuts="/"
              data-page-search=""
              className="h-8 pr-8 pl-8 text-xs"
            />
            {!search && (
              <Kbd
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-2 hidden h-4 min-w-4 -translate-y-1/2 px-1 text-[9px] sm:inline-flex"
              >
                /
              </Kbd>
            )}
          </div>

          <div className="flex items-center gap-1">
            {(
              [
                { id: "all", label: "All" },
                { id: "workspace", label: "Workspace" },
                { id: "project", label: "Project Only" },
              ] as { id: VisibilityFilter; label: string }[]
            ).map((f) => (
              <Button
                key={f.id}
                type="button"
                size="xs"
                variant={visibilityFilter === f.id ? "default" : "outline"}
                onClick={() => setVisibilityFilter(f.id)}
              >
                {f.label}
              </Button>
            ))}
          </div>

          <Select
            value={sortBy}
            onValueChange={(val) => setSortBy((val ?? "updated") as SortBy)}
          >
            <SelectTrigger aria-label="Sort whiteboards" className="h-8 w-44 text-xs">
              <SelectValue>
                {sortBy === "created"
                  ? "Newest Created"
                  : sortBy === "title"
                    ? "Title A–Z"
                    : "Recently Updated"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Recently Updated</SelectItem>
              <SelectItem value="created">Newest Created</SelectItem>
              <SelectItem value="title">Title A–Z</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Boards Grid */}
      {filteredBoards.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No whiteboards match your current search or filter.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedBoards.map((b) => {
            const isCurrent = b.id === activeBoardId
            const shapeCount = countElements(b.canvasJson)
            const notesPreview = b.meetingNotes?.replace(/[#*`>-]/g, " ").trim()

            return (
              <Card
                key={b.id}
                className={`flex flex-col justify-between transition-all hover:border-primary/60 ${
                  isCurrent ? "border-primary ring-1 ring-primary/30" : "border-border/80"
                }`}
              >
                <CardHeader className="space-y-2 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle
                      title={b.title}
                      className="min-w-0 flex-1 truncate text-sm font-semibold"
                    >
                      {b.title}
                    </CardTitle>
                    <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
                      v{b.version}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant={b.projectName ? "secondary" : "outline"}
                      className="max-w-full gap-1 text-[10px]"
                    >
                      {b.projectName ? (
                        <>
                          <Lock className="size-2.5 shrink-0" />
                          <span className="truncate">Project Only · {b.projectName}</span>
                        </>
                      ) : (
                        <>
                          <Eye className="size-2.5 shrink-0" />
                          <span>Workspace</span>
                        </>
                      )}
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-[10px] text-muted-foreground">
                      <Layers className="size-2.5" />
                      {shapeCount} {shapeCount === 1 ? "item" : "items"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2.5 pb-3 text-xs">
                  <p className="line-clamp-2 min-h-[2rem] text-muted-foreground">
                    <FileText className="mr-1 inline size-3 align-text-bottom text-primary/70" />
                    {notesPreview || "No meeting notes yet."}
                  </p>
                  <div className="space-y-1 rounded-lg bg-muted/40 p-2 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1 truncate">
                      <Clock className="size-3 shrink-0" />
                      <span className="truncate">
                        Updated {format(new Date(b.updatedAt), "MMM d, yyyy · h:mm a")} (
                        {formatDistanceToNow(new Date(b.updatedAt), { addSuffix: true })})
                      </span>
                    </div>
                    <div className="truncate pl-4 text-[10px]">
                      By {b.updatedByName} · Created{" "}
                      {format(new Date(b.createdAt), "MMM d, yyyy · h:mm a")} by {b.createdByName}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <Button
                    type="button"
                    size="sm"
                    variant={isCurrent ? "secondary" : "default"}
                    className="w-full"
                    onClick={() => onSelectBoard(b.id)}
                  >
                    {isCurrent ? "Continue in Studio" : "Open Whiteboard"}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
          </div>

          <DataPagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            pageSizeOptions={[8, 12, 24]}
            itemLabel="whiteboards"
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}
    </div>
  )
}
