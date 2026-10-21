import { z } from "zod"

export const createProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(5, "Project name must be between 5 and 50 characters.")
      .max(50, "Project name must be between 5 and 50 characters."),

    description: z
      .string()
      .trim()
      .min(10, "Project description must be between 10 and 200 characters.")
      .max(200, "Project description must be between 10 and 200 characters."),

    startDate: z
      .string()
      .min(1, "Start date is required.")
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Please select a valid start date.",
      ),

    dueDate: z
      .string()
      .min(1, "Due date is required.")
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Please select a valid due date.",
      ),
  })
  .superRefine((data, ctx) => {
    if (!data.startDate || !data.dueDate) {
      return
    }

    if (data.dueDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dueDate"],
        message: "Due date must be on or after the start date.",
      })
    }
  })

export type CreateProjectFormValues = z.infer<
  typeof createProjectSchema
>