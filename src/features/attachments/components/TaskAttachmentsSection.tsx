import { useRef } from "react"
import { Download, FileText, Loader2, Paperclip, Trash2, Upload } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DataPagination, { useClientPagination } from "@/components/common/DataPagination"
import {
  useDeleteAttachmentMutation,
  useTaskAttachmentsQuery,
  useUploadAttachmentMutation,
} from "../hooks/useAttachmentsQuery"
import { getAttachmentDownloadUrl } from "../services/attachment.service"

interface TaskAttachmentsSectionProps {
  taskId: string
  canUpload?: boolean
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function TaskAttachmentsSection({
  taskId,
  canUpload = true,
}: TaskAttachmentsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { data: attachments = [], isLoading } = useTaskAttachmentsQuery(taskId)
  const uploadMutation = useUploadAttachmentMutation(taskId)
  const deleteMutation = useDeleteAttachmentMutation(taskId)

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalElements,
    totalPages,
    paginatedItems: paginatedAttachments,
  } = useClientPagination(attachments, 5)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadMutation.mutate(file)
    e.target.value = ""
  }

  return (
    <Card className="border-border/70">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Paperclip className="size-4 text-primary" />
            Attachments ({attachments.length})
          </CardTitle>
          <CardDescription>
            Share specs, screenshots, or documents up to 10 MB.
          </CardDescription>
        </div>

        {canUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Upload attachment"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={uploadMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadMutation.isPending ? (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              ) : (
                <Upload className="mr-1.5 size-3.5" />
              )}
              Upload File
            </Button>
          </>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        {uploadMutation.isError && (
          <p className="text-xs text-destructive">
            Failed to upload file. Ensure it is under 10 MB.
          </p>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-3">Loading attachments...</p>
        ) : attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3">No files attached to this task yet.</p>
        ) : (
          <div className="space-y-3 min-w-0">
            <div className="divide-y rounded-md border">
              {paginatedAttachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between gap-3 p-2.5 text-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{att.fileName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {formatBytes(att.fileSize)} · {att.uploadedByName} ·{" "}
                        {formatDistanceToNow(new Date(att.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      nativeButton={false}
                      aria-label={`Download ${att.fileName}`}
                      render={
                        <a
                          href={getAttachmentDownloadUrl(att.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      <Download className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${att.fileName}`}
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(att.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <DataPagination
              compact
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              pageSizeOptions={[5, 10, 20]}
              itemLabel="attachments"
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
