import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { formatDistanceToNow } from "date-fns"
import {
  CornerDownRight,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  X,
} from "lucide-react"

import {
  createCommentSchema,
  type CreateCommentFormData,
} from "../schemas/comment.schema"
import {
  useTaskCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "../hooks/useCommentsQuery"
import type { TaskComment } from "../types/comment.types"
import { useAppSelector } from "@/hooks/redux-hooks"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface TaskCommentsSectionProps {
  taskId: string
}

function getInitials(firstName?: string, lastName?: string) {
  if (!firstName && !lastName) return "?"
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase()
}

export const TaskCommentsSection: React.FC<TaskCommentsSectionProps> = ({ taskId }) => {
  const currentUser = useAppSelector((state) => state.auth.user)
  const userRole = currentUser?.user_role?.toUpperCase()

  const { data, isLoading, error } = useTaskCommentsQuery(taskId)
  const createMutation = useCreateCommentMutation(taskId)
  const updateMutation = useUpdateCommentMutation(taskId)
  const deleteMutation = useDeleteCommentMutation(taskId)

  // Reply state
  const [replyingToComment, setReplyingToComment] = useState<TaskComment | null>(null)
  const [replyContent, setReplyContent] = useState("")

  // Edit state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  // Delete dialog state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  // Expanded replies toggle
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({})

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }))
  }

  // Main comment form
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
      // Error handled by react-query
    }
  }

  const handleReplySubmit = async (parentId: string) => {
    if (!replyContent.trim()) return
    try {
      await createMutation.mutateAsync({
        taskId,
        parentCommentId: parentId,
        content: replyContent.trim(),
      })
      setReplyContent("")
      setReplyingToComment(null)
      // Auto-expand replies for this comment
      setExpandedReplies((prev) => ({ ...prev, [parentId]: true }))
    } catch {
      // Handled
    }
  }

  const handleEditSubmit = async (commentId: string) => {
    if (!editContent.trim()) return
    try {
      await updateMutation.mutateAsync({
        commentId,
        content: editContent.trim(),
      })
      setEditingCommentId(null)
      setEditContent("")
    } catch {
      // Handled
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return
    try {
      await deleteMutation.mutateAsync(deleteTargetId)
      setDeleteTargetId(null)
    } catch {
      // Handled
    }
  }

  const canEdit = (comment: TaskComment) => {
    if (comment.isDeleted) return false
    return currentUser?.email === comment.author.email
  }

  const canDelete = (comment: TaskComment) => {
    if (comment.isDeleted) return false
    if (currentUser?.email === comment.author.email) return true
    if (userRole === "ADMIN" || userRole === "MANAGER") return true
    return false
  }

  const comments: TaskComment[] = data?.content ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground text-base">
            Discussion ({data?.totalElements ?? 0})
          </h3>
        </div>
      </div>

      {/* Main Comment Input (Instagram-style composer bar) */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <input type="hidden" {...register("taskId")} value={taskId} />
        <div className="flex items-start gap-3">
          <Avatar size="default" className="mt-0.5 shrink-0 border border-border">
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
              {getInitials(currentUser?.firstName, currentUser?.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 relative">
            <textarea
              id="task-comment-input"
              aria-label="Add a comment"
              {...register("content")}
              placeholder="Add a comment..."
              rows={2}
              className="w-full rounded-xl border border-input bg-muted/30 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all resize-none disabled:opacity-50"
              disabled={isSubmitting || createMutation.isPending}
            />
            {errors.content && (
              <p className="mt-1 text-xs text-destructive">
                {errors.content.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || createMutation.isPending}
            className="rounded-full px-4 text-xs font-semibold gap-1.5 shadow-2xs"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Post
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Discussion List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
          Loading discussion...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive">
          Failed to load comments for this task.
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No comments yet. Start the discussion!
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => {
            const replies = comment.replies ?? []
            const hasReplies = replies.length > 0
            const isRepliesVisible = expandedReplies[comment.id] ?? false
            const isReplying = replyingToComment?.id === comment.id
            const isEditing = editingCommentId === comment.id

            return (
              <div key={comment.id} className="space-y-3 group/comment">
                {/* Top-Level Comment Row */}
                <div className="flex items-start gap-3">
                  <Avatar size="default" className="mt-0.5 shrink-0 border border-border">
                    <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                      {getInitials(comment.author.firstName, comment.author.lastName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-foreground">
                          {comment.author.firstName} {comment.author.lastName}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      {/* Edit/Delete Actions */}
                      {(canEdit(comment) || canDelete(comment)) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 text-muted-foreground hover:text-foreground opacity-80 group-hover/comment:opacity-100 transition-opacity"
                                aria-label="Comment options"
                              />
                            }
                          >
                            <MoreHorizontal className="size-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            {canEdit(comment) && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingCommentId(comment.id)
                                  setEditContent(comment.content)
                                }}
                                className="gap-2 text-xs"
                              >
                                <Pencil className="size-3.5" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canDelete(comment) && (
                              <DropdownMenuItem
                                onClick={() => setDeleteTargetId(comment.id)}
                                className="gap-2 text-xs text-destructive focus:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {/* Content or Edit Field */}
                    {isEditing ? (
                      <div className="mt-1.5 space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={2}
                          className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setEditingCommentId(null)
                              setEditContent("")
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleEditSubmit(comment.id)}
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p
                        className={`text-xs sm:text-sm mt-0.5 leading-relaxed whitespace-pre-wrap break-words ${
                          comment.isDeleted
                            ? "italic text-muted-foreground/70"
                            : "text-foreground/90"
                        }`}
                      >
                        {comment.content}
                      </p>
                    )}

                    {/* Reply Action */}
                    {!comment.isDeleted && !isEditing && (
                      <div className="flex items-center gap-3 mt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToComment(comment)
                            setReplyContent(`@${comment.author.firstName} `)
                          }}
                          className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Reply
                        </button>

                        {hasReplies && (
                          <button
                            type="button"
                            onClick={() => toggleReplies(comment.id)}
                            className="flex items-center gap-1.5 text-[11px] font-medium text-primary hover:underline"
                          >
                            <span className="w-4 border-b border-muted-foreground/40 inline-block" />
                            {isRepliesVisible
                              ? "Hide replies"
                              : `View replies (${replies.length})`}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Inline Reply Composer */}
                    {isReplying && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/40 border border-border/80 space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            Replying to{" "}
                            <strong className="text-foreground">
                              {comment.author.firstName} {comment.author.lastName}
                            </strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingToComment(null)
                              setReplyContent("")
                            }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>

                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          rows={2}
                          autoFocus
                          className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        />

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setReplyingToComment(null)
                              setReplyContent("")
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleReplySubmit(comment.id)}
                            disabled={createMutation.isPending}
                          >
                            {createMutation.isPending ? "Posting..." : "Reply"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies Thread */}
                    {hasReplies && isRepliesVisible && (
                      <div className="mt-3 space-y-3 pl-4 border-l-2 border-border/60">
                        {replies.map((reply) => {
                          const isReplyEditing = editingCommentId === reply.id
                          return (
                            <div key={reply.id} className="flex items-start gap-2.5 group/reply">
                              <Avatar size="sm" className="mt-0.5 shrink-0 border border-border">
                                <AvatarFallback className="text-[10px] font-semibold bg-muted text-muted-foreground">
                                  {getInitials(reply.author.firstName, reply.author.lastName)}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-semibold text-xs text-foreground">
                                      {reply.author.firstName} {reply.author.lastName}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {formatDistanceToNow(new Date(reply.createdAt), {
                                        addSuffix: true,
                                      })}
                                    </span>
                                  </div>

                                  {(canEdit(reply) || canDelete(reply)) && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger
                                        render={
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-5 text-muted-foreground hover:text-foreground opacity-80 group-hover/reply:opacity-100"
                                            aria-label="Reply options"
                                          />
                                        }
                                      >
                                        <MoreHorizontal className="size-3" />
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-28">
                                        {canEdit(reply) && (
                                          <DropdownMenuItem
                                            onClick={() => {
                                              setEditingCommentId(reply.id)
                                              setEditContent(reply.content)
                                            }}
                                            className="gap-2 text-xs"
                                          >
                                            <Pencil className="size-3" />
                                            Edit
                                          </DropdownMenuItem>
                                        )}
                                        {canDelete(reply) && (
                                          <DropdownMenuItem
                                            onClick={() => setDeleteTargetId(reply.id)}
                                            className="gap-2 text-xs text-destructive focus:text-destructive"
                                          >
                                            <Trash2 className="size-3" />
                                            Delete
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>

                                {isReplyEditing ? (
                                  <div className="mt-1 space-y-2">
                                    <textarea
                                      value={editContent}
                                      onChange={(e) => setEditContent(e.target.value)}
                                      rows={2}
                                      className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                                    />
                                    <div className="flex items-center justify-end gap-1.5">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-[11px]"
                                        onClick={() => {
                                          setEditingCommentId(null)
                                          setEditContent("")
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="h-6 text-[11px]"
                                        onClick={() => handleEditSubmit(reply.id)}
                                        disabled={updateMutation.isPending}
                                      >
                                        Save
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <p
                                    className={`text-xs mt-0.5 leading-relaxed whitespace-pre-wrap break-words ${
                                      reply.isDeleted
                                        ? "italic text-muted-foreground/70"
                                        : "text-foreground/90"
                                    }`}
                                  >
                                    {reply.content}
                                  </p>
                                )}

                                {!reply.isDeleted && !isReplyEditing && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReplyingToComment(comment)
                                      setReplyContent(`@${reply.author.firstName} `)
                                    }}
                                    className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground mt-1"
                                  >
                                    <CornerDownRight className="size-3" />
                                    Reply
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? If this comment has replies,
              it will be marked as deleted to preserve the discussion context.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
