import { z } from "zod"

export const loginSchema = z.object({
  email: z.email().nonempty("Email is required"),
  password: z
    .string()
    .min(1, "Password is required"),
})
