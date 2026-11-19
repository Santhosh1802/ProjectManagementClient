import { useState, useEffect, useRef } from "react"
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
import { Badge } from "@/components/ui/badge"

import {
  Camera,
  CheckCircle2,
  CircleX,
  Cloud,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  Upload,
  User as UserIcon,
} from "lucide-react"

import { userSchema } from "../schemas/user.schema"
import type { User } from "../types/user.types"
import { updateUser, updateUserPassword } from "../services/users.service"
import { disableMfa, enableMfa, setupMfa } from "@/features/auth/services/auth.service"
import type { MfaSetupResponse } from "@/features/auth/types/auth.types"
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"
import { setUser } from "../slice/user.slice"
import { setAuthUser } from "@/features/auth/slice/authSlice"
import { toast } from "@/components/ui/toast"
import ShortcutHint from "@/components/common/ShortcutHint"
import { submitFormOnModEnter, toAriaKeyShortcuts } from "@/lib/keyboard"

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
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null)

  /* Centralized Profile Picture state */
  const [avatarUrlInput, setAvatarUrlInput] = useState<string>(user.avatarUrl ?? "")
  const [isSavingAvatar, setIsSavingAvatar] = useState(false)

  /* MFA state */
  const [mfaSetupData, setMfaSetupData] = useState<MfaSetupResponse | null>(null)
  const [mfaVerificationCode, setMfaVerificationCode] = useState("")
  const [mfaDisablePassword, setMfaDisablePassword] = useState("")
  const [showDisableMfaForm, setShowDisableMfaForm] = useState(false)
  const [isMfaBusy, setIsMfaBusy] = useState(false)

  /* Password visibility states */
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  /* Status message for password update */
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(null)
  const [passwordErrorMessage, setPasswordErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setAvatarUrlInput(user.avatarUrl ?? "")
  }, [user.avatarUrl])

  function syncUserToRedux(updated: User) {
    dispatch(setUser(updated))
    dispatch(
      setAuthUser({
        id: updated.id,
        firstName: updated.firstName ?? "",
        lastName: updated.lastName ?? "",
        email: updated.email,
        user_role: updated.userRole,
        avatarUrl: updated.avatarUrl ?? null,
        mfaEnabled: Boolean(updated.mfaEnabled),
      })
    )
  }

  /* -------------------------------------------------- */
  /* Centralized Profile Picture Handlers (DB backed) */
  /* -------------------------------------------------- */
  async function handleSaveAvatar(nextAvatarUrl: string) {
    setIsSavingAvatar(true)
    try {
      const updated = await updateUser({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName ?? "",
        email: user.email,
        avatarUrl: nextAvatarUrl.trim(),
      })
      syncUserToRedux(updated)
      setAvatarUrlInput(updated.avatarUrl ?? "")
      toast.add({
        type: "success",
        title: "Profile picture updated",
        description: "Your centralized profile picture has been saved to your account.",
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to save profile picture."
      toast.add({
        type: "error",
        title: "Avatar update failed",
        description: msg,
      })
    } finally {
      setIsSavingAvatar(false)
    }
  }

  function handleAvatarFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrlInput(reader.result)
        void handleSaveAvatar(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

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
        avatarUrl: avatarUrlInput.trim(),
      })

      syncUserToRedux(updated)
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

  /* -------------------------------------------------- */
  /* 3. Multi-Factor Authentication (MFA) Handlers */
  /* -------------------------------------------------- */
  async function handleStartMfaSetup() {
    setIsMfaBusy(true)
    try {
      const data = await setupMfa()
      setMfaSetupData(data)
      setMfaVerificationCode("")
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unable to start MFA setup."
      toast.add({
        type: "error",
        title: "MFA Setup Error",
        description: msg,
      })
    } finally {
      setIsMfaBusy(false)
    }
  }

  async function handleConfirmEnableMfa() {
    if (mfaVerificationCode.trim().length !== 6) return
    setIsMfaBusy(true)
    try {
      const updated = await enableMfa(mfaVerificationCode.trim())
      syncUserToRedux(updated)
      setMfaSetupData(null)
      setMfaVerificationCode("")
      toast.add({
        type: "success",
        title: "Two-Factor Authentication Enabled",
        description: "Your account is now protected with 6-digit authenticator verification.",
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Invalid 6-digit code. Please try again."
      toast.add({
        type: "error",
        title: "Verification Failed",
        description: msg,
      })
    } finally {
      setIsMfaBusy(false)
    }
  }

  async function handleConfirmDisableMfa() {
    if (!mfaDisablePassword.trim()) return
    setIsMfaBusy(true)
    try {
      const updated = await disableMfa(mfaDisablePassword)
      syncUserToRedux(updated)
      setShowDisableMfaForm(false)
      setMfaDisablePassword("")
      toast.add({
        type: "success",
        title: "Two-Factor Authentication Disabled",
        description: "MFA has been turned off for your account.",
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Incorrect password. Could not disable MFA."
      toast.add({
        type: "error",
        title: "Disable MFA Failed",
        description: msg,
      })
    } finally {
      setIsMfaBusy(false)
    }
  }

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U"

  return (
    <Card className="w-full overflow-hidden rounded-xl border border-border shadow-xs">
      <CardHeader className="border-b border-border bg-muted/20 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserIcon className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Account Profile &amp; Security</CardTitle>
            <CardDescription className="mt-1 text-xs">
              Manage your centralized profile photo, personal details, password, and Two-Factor Authentication (MFA).
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="divide-y divide-border p-0">
        {/* ========================================================= */}
        {/* SECTION 0: Centralized Profile Picture (Stored in DB) */}
        {/* ========================================================= */}
        <div className="space-y-4 p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Camera className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Profile Picture</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Stored centrally in the database and displayed across your workspace, header, and Team Chat.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-muted/20 p-4 sm:flex-row sm:items-center">
            <div className="flex size-18 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary/40 bg-primary/10 text-lg font-semibold text-primary">
              {avatarUrlInput ? (
                <img
                  src={avatarUrlInput}
                  alt={user.firstName}
                  className="size-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={avatarFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-label="Upload centralized profile picture"
                  onChange={handleAvatarFileSelect}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isSavingAvatar}
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="h-8 gap-1.5 text-xs"
                >
                  {isSavingAvatar ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Upload className="size-3.5" />
                  )}
                  Upload Photo
                </Button>

                {avatarUrlInput && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={isSavingAvatar}
                    onClick={() => {
                      setAvatarUrlInput("")
                      void handleSaveAvatar("")
                    }}
                    className="h-8 gap-1 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    Remove Photo
                  </Button>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                  placeholder="Or paste an image URL (https://...)"
                  aria-label="Profile image URL"
                  className="h-8 flex-1 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={isSavingAvatar || avatarUrlInput === (user.avatarUrl ?? "")}
                  onClick={() => void handleSaveAvatar(avatarUrlInput)}
                  className="h-8 shrink-0 text-xs"
                >
                  Save Photo URL
                </Button>
              </div>
            </div>
          </div>
        </div>

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

          <form
            id="profile-info-form"
            onSubmit={handleProfileSubmit(onSaveProfile)}
            onKeyDown={submitFormOnModEnter}
            aria-keyshortcuts={toAriaKeyShortcuts(["mod", "Enter"])}
          >
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
              <span>Save Profile</span>
              <ShortcutHint
                keys={["mod", "Enter"]}
                compact
                decorative
                variant="onPrimary"
                className="hidden sm:inline-flex ml-1"
              />
            </Button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: Two-Factor Authentication (MFA) */}
        {/* ========================================================= */}
        <div className="space-y-4 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Two-Factor Authentication (MFA)
                </h3>
                {user.mfaEnabled ? (
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-600/90 text-[10px]">
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    Disabled
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Add a second layer of security using an Authenticator app (Google Authenticator, Authy, 1Password).
              </p>
            </div>

            {!user.mfaEnabled && !mfaSetupData && (
              <Button
                type="button"
                size="sm"
                onClick={() => void handleStartMfaSetup()}
                disabled={isMfaBusy}
                className="h-8 gap-1.5 text-xs"
              >
                {isMfaBusy ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="size-3.5" />
                )}
                Enable MFA
              </Button>
            )}

            {user.mfaEnabled && !showDisableMfaForm && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowDisableMfaForm(true)}
                className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
              >
                <ShieldAlert className="size-3.5" />
                Disable MFA
              </Button>
            )}
          </div>

          {/* MFA Setup Wizard */}
          {mfaSetupData && !user.mfaEnabled && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex size-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-2 shadow-2xs">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      mfaSetupData.otpAuthUri
                    )}`}
                    alt="MFA QR Code"
                    className="size-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <QrCode className="size-4 text-primary" />
                    Step 1: Scan QR Code or Enter Setup Key
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Scan the QR code in your authenticator app, or manually enter this Base32 secret key:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="rounded-md border border-border bg-background px-2.5 py-1 font-mono text-xs font-semibold tracking-wider text-foreground">
                      {mfaSetupData.secret}
                    </code>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="outline"
                      onClick={() => {
                        void navigator.clipboard?.writeText(mfaSetupData.secret)
                        toast.add({
                          type: "success",
                          title: "Secret copied",
                          description: "MFA secret key copied to clipboard.",
                        })
                      }}
                      title="Copy secret key"
                      aria-label="Copy MFA secret key"
                    >
                      <Copy className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 pt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1 flex-1 max-w-xs">
                  <FieldLabel htmlFor="mfa-verify-code" className="text-xs font-semibold">
                    Step 2: Enter 6-digit code from your app
                  </FieldLabel>
                  <Input
                    id="mfa-verify-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={mfaVerificationCode}
                    onChange={(e) => setMfaVerificationCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="h-8 font-mono tracking-widest text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setMfaSetupData(null)}
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={isMfaBusy || mfaVerificationCode.trim().length !== 6}
                    onClick={() => void handleConfirmEnableMfa()}
                    className="h-8 gap-1.5 text-xs"
                  >
                    {isMfaBusy && <Loader2 className="size-3.5 animate-spin" />}
                    Verify &amp; Enable MFA
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Disable MFA Confirmation */}
          {user.mfaEnabled && showDisableMfaForm && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
              <p className="text-xs font-medium text-foreground">
                Confirm your current account password to disable Two-Factor Authentication:
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  type="password"
                  value={mfaDisablePassword}
                  onChange={(e) => setMfaDisablePassword(e.target.value)}
                  placeholder="Enter current password"
                  aria-label="Password to disable MFA"
                  className="h-8 max-w-xs text-xs"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowDisableMfaForm(false)
                      setMfaDisablePassword("")
                    }}
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={isMfaBusy || !mfaDisablePassword.trim()}
                    onClick={() => void handleConfirmDisableMfa()}
                    className="h-8 gap-1.5 text-xs"
                  >
                    {isMfaBusy && <Loader2 className="size-3.5 animate-spin" />}
                    Confirm Disable MFA
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* SECTION 3: Password Security */}
        {/* ========================================================= */}
        <div className="space-y-5 p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Password &amp; Security</h3>
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

          <form
            id="password-change-form"
            onSubmit={handlePasswordSubmit(onUpdatePassword)}
            onKeyDown={submitFormOnModEnter}
            aria-keyshortcuts={toAriaKeyShortcuts(["mod", "Enter"])}
          >
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
                  <span>Update Password</span>
                  <ShortcutHint
                    keys={["mod", "Enter"]}
                    compact
                    decorative
                    variant="onPrimary"
                    className="hidden sm:inline-flex ml-1"
                  />
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
