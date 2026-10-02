import { z } from "zod";

export const registrationSchema = z
    .object({
      firstName: z
        .string()
        .min(2, "First name must be at least 2 characters.")
        .max(50, "First name must be at most of 50 characters."),
      lastName: z
        .string()
        .min(1, "Last name must be at least 1 character.")
        .max(50, "Last name must be at most of 50 characters."),
      email: z.email().nonempty("Email is required"),
      password: z
        .string()
        .min(8, "Password must be of at least 8 characters.")
        .max(100, "Password must be of at most 100 characters.")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          {
            message: `Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)`,
          }
        ),
      confirmPassword: z.string().min(1, "Please confirm your password"),
    })

    .refine((data) => data.password === data.confirmPassword, {
      message: "Password do not match",
      path: ["confirmPassword"],
    })