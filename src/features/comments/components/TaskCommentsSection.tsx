import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, Send, Loader2 } from "lucide-react"

import {
  createCommentSchema,
  type CreateCommentFormData,
} from "../schemas/comment.schema"
import {
  useTaskCommentsQuery,
  useCreateCommentMutation,
} from "../hooks/useCommentsQuery"
import type { TaskComment } from "../types/comment.types"

interface TaskCommentsSectionProps {
  taskId: string
}

export const TaskCommentsSection: React.FC<TaskCommentsSectionProps> = ({
  taskId,
}) => {
  const { data, isLoading, error } = useTaskCommentsQuery(taskId)
  const createMutation = useCreateCommentMutation(taskId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCommentFormData>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      taskId,
      content: "",
    },
  })

  const onSubmit = async (values: CreateCommentFormData) => {
    try {
      await createMutation.mutateAsync({
        taskId: values.taskId,
        content: values.content,
      })
      reset({ taskId, content: "" })
    } catch {
      // Error handled by mutation/toast
    }
  }

  const comments: TaskComment[] = data?.content ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground text-base">
          Discussion ({data?.totalElements ?? 0})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input type="hidden" {...register("taskId")} value={taskId} />
        <div>
          <textarea
            {...register("content")}
            placeholder="Write a comment..."
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            disabled={isSubmitting || createMutation.isPending}
          />
          {errors.content && (
            <p className="mt-1 text-xs text-destructive">
              {errors.content.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Post Comment
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading comments...
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          Failed to load comments for this task.
        </div>
      ) : comments.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          No comments yet. Be the first to start the discussion!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2 mb-2">
                <span className="font-medium text-sm text-foreground">
                  {comment.author.firstName} {comment.author.lastName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
