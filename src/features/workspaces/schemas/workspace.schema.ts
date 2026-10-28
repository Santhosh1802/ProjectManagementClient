import { z } from "zod"

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(150, "Organization name must not exceed 150 characters"),
})

export type CreateOrganizationForm = z.infer<typeof createOrganizationSchema>

export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, "Workspace name must be at least 2 characters")
    .max(150, "Workspace name must not exceed 150 characters"),
})

export type UpdateWorkspaceForm = z.infer<typeof updateWorkspaceSchema>

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email address"),
  role: z.enum(["ADMIN", "MEMBER"], {
    error: "Role must be either ADMIN or MEMBER",
  }),
})

export type InviteMemberForm = z.infer<typeof inviteMemberSchema>

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
})

export type AcceptInvitationForm = z.infer<typeof acceptInvitationSchema>

export const updateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"], {
    error: "Role must be either ADMIN or MEMBER",
  }),
})

export type UpdateMemberRoleForm = z.infer<typeof updateMemberRoleSchema>
