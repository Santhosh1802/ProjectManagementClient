export interface TaskAttachment {
  id: string
  taskId: string
  uploadedById: string | null
  uploadedByName: string
  uploadedByEmail: string
  fileName: string
  contentType: string
  fileSize: number
  createdAt: string
}
