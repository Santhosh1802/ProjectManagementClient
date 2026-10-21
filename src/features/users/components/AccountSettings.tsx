import { useState, useEffect } from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  CheckCircle2,
  CircleX,
  Cloud,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react"

import { userSchema } from "../schemas/user.schema"
import type { User } from "../types/user.types"
import { updateUser, updateUserPassword } from "../services/users.service"
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"
import { setUser } from "../slice/user.slice"
import { setAuthUser } from "@/features/auth/slice/authSlice"
import { toast } from "@/components/ui/toast"

/* -------------------------------------------------- */
/* Password Validation Schema */
/* -------------------------------------------------- */
const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(/[@$!%*?&]/, "Password must contain at least one special symbol"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  })

type PersonalInfoForm = z.infer<typeof userSchema>
type PasswordForm = z.infer<typeof passwordSchema>

interface AccountSettingsProps {
  user: User
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector((state) => state.auth.user)
  const userId = currentUser?.id ?? user.id

  /* Password visibility states */
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  /* Status message for password update */
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(null)
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<string | null>(null)

  /* -------------------------------------------------- */
  /* 1. Personal Information Form */
  /* -------------------------------------------------- */
  const {
    control: profileControl,
    reset: resetProfile,
    handleSubmit: handleProfileSubmit,
    formState: { isDirty: isProfileDirty, isSubmitting: isProfileSubmitting },
  } = useForm<PersonalInfoForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "USER",
    },
  })

  useEffect(() => {
    resetProfile({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email,
      role: user.userRole,
    })
  }, [user, resetProfile])

  async function onSaveProfile(data: PersonalInfoForm) {
    try {
      const updated = await updateUser({
        id: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      })

      dispatch(setUser(updated))
      if (currentUser) {
        dispatch(
          setAuthUser({
            ...currentUser,
            firstName: updated.firstName ?? "",
            lastName: updated.lastName ?? "",
            email: updated.email,
            user_role: updated.userRole,
          })
        )
      }
      resetProfile(data)
      toast.add({
        type: "success",
        title: "Profile saved",
        description: "Your personal information was updated successfully.",
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to update profile."
      toast.add({
        type: "error",
        title: "Update failed",
        description: msg,
      })
    }
  }

  /* -------------------------------------------------- */
  /* 2. Password Change Form */
  /* -------------------------------------------------- */
  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: passwordFormState,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const newPasswordValue = useWatch({
    control: passwordControl,
    name: "newPassword",
  })

  const passwordRequirements = {
    minLength: (newPasswordValue?.length ?? 0) >= 8,
    uppercase: /[A-Z]/.test(newPasswordValue ?? ""),
    number: /\d/.test(newPasswordValue ?? ""),
    special: /[@$!%*?&]/.test(newPasswordValue ?? ""),
  }

  async function onUpdatePassword(data: PasswordForm) {
    setPasswordSuccessMessage(null)
    setPasswordErrorMessage(null)
    try {
      await updateUserPassword({
        id: userId || "",
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      })
      resetPassword()
      setPasswordSuccessMessage("Password updated successfully.")
      toast.add({
        type: "success",
        title: "Password changed",
        description: "Your password has been changed successfully.",
      })
      setTimeout(() => setPasswordSuccessMessage(null), 4000)
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to update password. Please check your current password."
      setPasswordErrorMessage(msg)
      toast.add({
        type: "error",
        title: "Password change failed",
        description: msg,
      })
    }
  }

  return (
    <Card className="w-full overflow-hidden rounded-xl border border-border shadow-xs">
      <CardHeader className="border-b border-border bg-muted/20 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserIcon className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Account Profile & Security</CardTitle>
            <CardDescription className="mt-1 text-xs">
              Manage your personal details, email address, and security credentials in one place.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="divide-y divide-border p-0">
        {/* ========================================================= */}
        {/* SECTION 1: Personal Details */}
        {/* ========================================================= */}
        <div className="space-y-5 p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
              <p className="text-xs text-muted-foreground">
                Update your name and view your primary account email.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Cloud className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isProfileDirty ? "Unsaved changes" : "Synchronized"}</span>
            </div>
          </div>

          <form id="profile-info-form" onSubmit={handleProfileSubmit(onSaveProfile)}>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* First Name */}
                <Controller
                  name="firstName"
                  control={profileControl}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="account-first-name">First Name</FieldLabel>
                      <Input
                        {...field}
                        id="account-first-name"
                        aria-invalid={fieldState.invalid}
                        placeholder="First name"
                        autoComplete="given-name"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Last Name */}
                <Controller
                  name="lastName"
                  control={profileControl}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="account-last-name">Last Name</FieldLabel>
                      <Input
                        {...field}
                        id="account-last-name"
                        aria-invalid={fieldState.invalid}
                        placeholder="Last name"
                        autoComplete="family-name"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Email */}
                <Controller
                  name="email"
                  control={profileControl}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="account-email">Email Address</FieldLabel>
                      <Input
                        {...field}
                        id="account-email"
                        aria-invalid={fieldState.invalid}
                        placeholder="user@example.com"
                        autoComplete="email"
                        type="email"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Role (Read only) */}
                <Controller
                  name="role"
                  control={profileControl}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="account-role">Account Role</FieldLabel>
                      <Input
                        {...field}
                        id="account-role"
                        disabled
                        className="bg-muted/50 cursor-not-allowed"
                        autoComplete="off"
                        type="text"
                      />
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          </form>

          {/* Profile Save Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!isProfileDirty || isProfileSubmitting}
              onClick={() => {
                resetProfile({
                  firstName: user.firstName ?? "",
                  lastName: user.lastName ?? "",
                  email: user.email,
                  role: user.userRole,
                })
              }}
              className="h-8 text-xs"
            >
              Discard Changes
            </Button>
            <Button
              type="submit"
              form="profile-info-form"
              size="sm"
              disabled={!isProfileDirty || isProfileSubmitting}
              className="h-8 gap-1.5 text-xs"
            >
              {isProfileSubmitting && <Loader2 className="size-3.5 animate-spin" />}
              Save Profile
            </Button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: Password Security */}
        {/* ========================================================= */}
        <div className="space-y-5 p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Password & Security</h3>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Ensure your account is using a long, random password to stay secure.
              </p>
            </div>
            {passwordSuccessMessage && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                {passwordSuccessMessage}
              </span>
            )}
            {passwordErrorMessage && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                <CircleX className="size-3.5" />
                {passwordErrorMessage}
              </span>
            )}
          </div>

          <form id="password-change-form" onSubmit={handlePasswordSubmit(onUpdatePassword)}>
            {/* Accessibility hidden username */}
            <input
              type="text"
              name="username"
              autoComplete="username"
              defaultValue={user?.email || ""}
              className="hidden"
              aria-hidden="true"
            />

            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Current Password */}
                <Controller
                  name="oldPassword"
                  control={passwordControl}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="account-current-password">Current Password</FieldLabel>
                      <div className="relative">
                        <Input
                          {...field}
                          id="account-current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          aria-invalid={fieldState.invalid}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 size-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowCurrentPassword((v) => !v)}
                        >
                          {showCurrentPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </Button>
                      </div>
                      {fieldState.invalid && (
                        <FieldError className="text-[10px]" errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* New Password */}
                <Controller
                  name="newPassword"
                  control={passwordControl}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="account-new-password">New Password</FieldLabel>
                      <div className="relative">
                        <Input
                          {...field}
                          id="account-new-password"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          aria-invalid={fieldState.invalid}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 size-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowNewPassword((v) => !v)}
                        >
                          {showNewPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </Button>
                      </div>
                      {fieldState.invalid && (
                        <FieldError className="text-[10px]" errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Confirm Password */}
                <Controller
                  name="confirmPassword"
                  control={passwordControl}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="account-confirm-password">Confirm New Password</FieldLabel>
                      <div className="relative">
                        <Input
                          {...field}
                          id="account-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          aria-invalid={fieldState.invalid}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 size-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                        >
                          {showConfirmPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </Button>
                      </div>
                      {fieldState.invalid && (
                        <FieldError className="text-[10px]" errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              {/* Password Requirements Compact Checklist */}
              <div className="rounded-lg border border-border/70 bg-muted/30 p-3.5">
                <p className="mb-2 text-xs font-medium text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-primary" />
                  Password Requirements:
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <RequirementChip valid={passwordRequirements.minLength} text="8+ characters" />
                  <RequirementChip valid={passwordRequirements.uppercase} text="Uppercase letter" />
                  <RequirementChip valid={passwordRequirements.number} text="One number" />
                  <RequirementChip valid={passwordRequirements.special} text="Special symbol" />
                </div>
              </div>
            </FieldGroup>
          </form>

          {/* Password Action */}
          <div className="flex items-center justify-end pt-1">
            <Button
              type="submit"
              form="password-change-form"
              size="sm"
              disabled={passwordFormState.isSubmitting}
              className="h-8 gap-1.5 text-xs"
            >
              {passwordFormState.isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" />
                  Update Password
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border bg-muted/20 px-6 py-3">
        <p className="text-xs text-muted-foreground">
          Changes made here take effect immediately across all active workspace sessions.
        </p>
      </CardFooter>
    </Card>
  )
}

function RequirementChip({ valid, text }: { valid: boolean; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px]">
      {valid ? (
        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <CircleX className="size-3.5 shrink-0 text-muted-foreground/60" />
      )}
      <span className={valid ? "font-medium text-foreground" : "text-muted-foreground"}>
        {text}
      </span>
    </div>
  )
}
