import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getCommentsByTask, createComment } from "../services/comment.service"
import type { CreateCommentRequest } from "../types/comment.types"
import { commentKeys } from "@/lib/queryKeys"

export function useTaskCommentsQuery(taskId: string | undefined, page = 0, size = 20) {
  return useQuery({
    queryKey: [...commentKeys.byTask(taskId ?? ""), page, size],
    queryFn: () => getCommentsByTask(taskId!, page, size),
    enabled: Boolean(taskId),
  })
}

export function useCreateCommentMutation(taskId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateCommentRequest) => createComment(request),
    onSuccess: () => {
      if (taskId) {
        void queryClient.invalidateQueries({
          queryKey: commentKeys.byTask(taskId),
        })
      }
    },
  })
}
