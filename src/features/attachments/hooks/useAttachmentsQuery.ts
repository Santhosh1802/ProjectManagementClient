import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  deleteTaskAttachment,
  getTaskAttachments,
  uploadTaskAttachment,
} from "../services/attachment.service"

export const ATTACHMENT_KEYS = {
  byTask: (taskId: string) => ["task-attachments", taskId] as const,
}

export function useTaskAttachmentsQuery(taskId: string) {
  return useQuery({
    queryKey: ATTACHMENT_KEYS.byTask(taskId),
    queryFn: () => getTaskAttachments(taskId),
    enabled: Boolean(taskId),
  })
}

export function useUploadAttachmentMutation(taskId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadTaskAttachment(taskId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ATTACHMENT_KEYS.byTask(taskId) })
    },
  })
}

export function useDeleteAttachmentMutation(taskId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (attachmentId: string) => deleteTaskAttachment(attachmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ATTACHMENT_KEYS.byTask(taskId) })
    },
  })
}
