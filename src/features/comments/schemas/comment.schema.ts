import { z } from "zod"

export const createCommentSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(4000, "Comment cannot exceed 4000 characters"),
})

export type CreateCommentFormData = z.infer<typeof createCommentSchema>
