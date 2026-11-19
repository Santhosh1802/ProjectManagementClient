import { useMemo, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Download,
  ExternalLink,
  FileText,
  HardDrive,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  Search,
  Trash2,
  Upload,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import DataPagination, { useClientPagination } from "@/components/common/DataPagination"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import {
  deleteProjectFile,
  formatBytes,
  getProjectStorage,
  resolveBackendFileUrl,
  uploadProjectFile,
} from "../services/projectStorage.service"

interface ProjectStorageSectionProps {
  projectId: string
  canManage?: boolean
}

export function ProjectStorageSection({
  projectId,
  canManage = true,
}: ProjectStorageSectionProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const storageQuery = useQuery({
    queryKey: ["project-storage", projectId],
    queryFn: () => getProjectStorage(projectId),
    enabled: Boolean(projectId),
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadProjectFile(projectId, file),
    onSuccess: (uploaded) => {
      void queryClient.invalidateQueries({
        queryKey: ["project-storage", projectId],
      })
      toast.add({
        type: "success",
        title: "File uploaded",
        description: `${uploaded.fileName} (${formatBytes(uploaded.fileSize)}) saved to project storage.`,
      })
    },
    onError: (err) => {
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to upload file. Check project storage quota."
      toast.add({
        type: "error",
        title: "Upload failed",
        description: msg,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => deleteProjectFile(fileId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["project-storage", projectId],
      })
      toast.add({
        type: "success",
        title: "File removed",
        description: "File deleted from project storage.",
      })
    },
  })

  const summary = storageQuery.data
  const usedBytes = summary?.usedBytes ?? 0
  const maxBytes = summary?.maxBytes ?? 50 * 1024 * 1024
  const files = useMemo(() => summary?.files ?? [], [summary?.files])
  const usagePercent = Math.min(
    100,
    maxBytes > 0 ? Math.round((usedBytes / maxBytes) * 100) : 0
  )

  const [fileSearch, setFileSearch] = useState("")
  const [sourceFilter, setSourceFilter] = useState<"ALL" | "PROJECT" | "CHAT">("ALL")

  const filteredFiles = useMemo(() => {
    const q = fileSearch.trim().toLowerCase()
    return files.filter((f) => {
      const matchesSource = sourceFilter === "ALL" || f.sourceType === sourceFilter
      const matchesSearch =
        !q ||
        f.fileName.toLowerCase().includes(q) ||
        (f.uploadedByName ?? "").toLowerCase().includes(q)
      return matchesSource && matchesSearch
    })
  }, [files, fileSearch, sourceFilter])

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalElements,
    totalPages,
    paginatedItems: paginatedFiles,
  } = useClientPagination(filteredFiles, 6)

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <HardDrive className="size-4 text-primary" />
            <h2 className="font-semibold">Project Files &amp; Storage</h2>
            <Badge variant="outline" className="font-mono text-[10px]">
              {formatBytes(usedBytes)} / {formatBytes(maxBytes)} ({usagePercent}%)
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Centralized storage for project documents, images, and files shared in the project chat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            aria-label="Upload project file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                uploadMutation.mutate(file)
                e.target.value = ""
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            disabled={uploadMutation.isPending || usedBytes >= maxBytes}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Upload className="mr-1.5 size-4" />
            )}
            Upload File
          </Button>
        </div>
      </div>

      {/* Quota Progress Bar */}
      <div className="border-b bg-muted/20 px-5 py-2.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>Storage Quota Usage</span>
          <span className="font-mono font-medium text-foreground">
            {formatBytes(usedBytes)} of {formatBytes(maxBytes)} used
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              usagePercent >= 90
                ? "bg-destructive"
                : usagePercent >= 75
                  ? "bg-amber-500"
                  : "bg-primary"
            )}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      {/* Files Grid / List */}
      <div className="p-5 space-y-4">
        {files.length > 0 && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={fileSearch}
                onChange={(e) => {
                  setFileSearch(e.target.value)
                  setPage(0)
                }}
                placeholder="Search project files..."
                aria-label="Search project files"
                aria-keyshortcuts="/"
                data-page-search=""
                className="h-8 pr-8 pl-8 text-xs"
              />
              {!fileSearch && (
                <Kbd
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-2 hidden h-4 min-w-4 -translate-y-1/2 px-1 text-[9px] sm:inline-flex"
                >
                  /
                </Kbd>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {(["ALL", "PROJECT", "CHAT"] as const).map((src) => (
                <Button
                  key={src}
                  type="button"
                  size="xs"
                  variant={sourceFilter === src ? "secondary" : "ghost"}
                  onClick={() => {
                    setSourceFilter(src)
                    setPage(0)
                  }}
                  className="text-[11px]"
                >
                  {src === "ALL"
                    ? `All (${files.length})`
                    : src === "PROJECT"
                      ? "Direct"
                      : "From Chat"}
                </Button>
              ))}
            </div>
          </div>
        )}

        {storageQuery.isLoading ? (
          <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading project files...
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-5 py-8 text-center">
            <FileText className="mb-2 size-7 text-muted-foreground/60" />
            <p className="text-sm font-medium">
              {files.length === 0 ? "No project files uploaded yet" : "No matching files found"}
            </p>
            <p className="mt-1 max-w-md text-xs text-muted-foreground">
              {files.length === 0
                ? "Upload documents or images here, or share them directly in this project's Team Chat group."
                : "Try adjusting your search or source filter."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedFiles.map((f) => {
              const isImage = f.contentType?.startsWith("image/")
              const fileUrl = resolveBackendFileUrl(f.downloadUrl)
              return (
                <div
                  key={f.id}
                  className="flex flex-col justify-between gap-2.5 rounded-xl border border-border/80 bg-card p-3 shadow-2xs"
                >
                  <div className="flex items-start gap-2.5">
                    {isImage ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted"
                      >
                        <img
                          src={fileUrl}
                          alt={f.fileName}
                          className="size-full object-cover"
                        />
                      </a>
                    ) : (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="size-5" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-xs font-semibold text-foreground hover:text-primary hover:underline"
                        title={f.fileName}
                      >
                        {f.fileName}
                      </a>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span>{formatBytes(f.fileSize)}</span>
                        <span>·</span>
                        <span>{f.uploadedByName}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        <Badge
                          variant={f.sourceType === "CHAT" ? "secondary" : "outline"}
                          className="gap-1 text-[9px] px-1.5 py-0"
                        >
                          {f.sourceType === "CHAT" ? (
                            <>
                              <MessageCircle className="size-2.5" />
                              From Chat
                            </>
                          ) : (
                            <>
                              {isImage ? (
                                <ImageIcon className="size-2.5" />
                              ) : (
                                <FileText className="size-2.5" />
                              )}
                              Project File
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 border-t border-border/50 pt-2">
                    <Button
                      size="xs"
                      variant="outline"
                      nativeButton={false}
                      render={
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={f.fileName}
                        />
                      }
                    >
                      {isImage ? (
                        <>
                          <ExternalLink className="mr-1 size-3" />
                          View
                        </>
                      ) : (
                        <>
                          <Download className="mr-1 size-3" />
                          Download
                        </>
                      )}
                    </Button>
                    {canManage && (
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(f.id)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        title="Delete file"
                        aria-label={`Delete ${f.fileName}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
            </div>

            <DataPagination
              compact
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              pageSizeOptions={[6, 12, 24]}
              itemLabel="files"
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </div>
    </div>
  )
}
