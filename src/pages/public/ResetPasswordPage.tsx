import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios from "axios"
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  CircleX,
  KeyRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import ProductWording from "@/features/auth/components/ProductWording"
import TermsAndPrivacyMessage from "@/features/auth/components/TermsAndPrivacyMessage"
import { resetPasswordSchema } from "@/features/auth/schemas/recovery.schema"
import { resetPassword } from "@/features/auth/services/auth.service"

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const rawToken = searchParams.get("token") || ""

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { formState, control, handleSubmit } = useForm<
    z.infer<typeof resetPasswordSchema>
  >({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  const newPassword = useWatch({
    control,
    name: "newPassword",
  }) || ""

  const passwordRequirements = {
    minLength: newPassword.length >= 8,
    maxLength: newPassword.length <= 100 && newPassword.length > 0,
    hasLower: /[a-z]/.test(newPassword),
    hasUpper: /[A-Z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecial: /[@$!%*?&]/.test(newPassword),
  }

  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    if (!rawToken.trim()) {
      setServerError("Reset token is missing from the URL. Please request a new link.")
      return
    }

    try {
      setServerError(null)
      await resetPassword(rawToken.trim(), data.newPassword)
      setIsSuccess(true)
      setTimeout(() => {
        navigate("/login")
      }, 2500)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ERR_NETWORK") {
          setServerError("Unable to connect to the server. Please check your connection.")
          return
        }
        const errorData = error.response?.data
        setServerError(errorData?.message || "Invalid or expired reset token. Please request a new link.")
        return
      }
      setServerError("An unexpected error occurred. Please try again.")
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center px-6 py-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <section className="hidden lg:block">
            <ProductWording />
          </section>

          <section className="flex justify-center">
            <div className="w-full max-w-sm">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Choose New Password</CardTitle>
                  <CardDescription>
                    Create a strong, unique password to secure your account.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {!rawToken.trim() ? (
                    <div className="flex flex-col items-center text-center py-4 space-y-3">
                      <div className="h-12 w-12 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-base text-zinc-100">
                        Invalid or Missing Token
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        This password reset link is invalid, incomplete, or has expired. Please initiate a new password reset request.
                      </p>
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/forgot-password")}
                          className="text-xs"
                        >
                          Request New Reset Link
                        </Button>
                      </div>
                    </div>
                  ) : isSuccess ? (
                    <div className="flex flex-col items-center text-center py-4 space-y-3">
                      <div className="h-12 w-12 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-base text-zinc-100">
                        Password Reset Complete
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Your password has been securely updated. Redirecting you to sign in...
                      </p>
                      <div className="pt-2">
                        <Button
                          size="sm"
                          onClick={() => navigate("/login")}
                          className="text-xs"
                        >
                          Sign In Now
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {serverError && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Reset Failed</AlertTitle>
                          <AlertDescription className="text-xs">
                            {serverError}
                          </AlertDescription>
                        </Alert>
                      )}

                      <form id="reset-password" onSubmit={handleSubmit(onSubmit)}>
                        <FieldGroup>
                          <Controller
                            name="newPassword"
                            control={control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                                <div className="relative flex flex-row">
                                  <Input
                                    {...field}
                                    id="new-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    className="text-xs"
                                    aria-invalid={fieldState.invalid}
                                  />
                                  <Button
                                    variant="ghost"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2"
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                                {fieldState.invalid && (
                                  <FieldError
                                    className="text-[10px]"
                                    errors={[fieldState.error]}
                                  />
                                )}
                              </Field>
                            )}
                          />

                          <Controller
                            name="confirmPassword"
                            control={control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="confirm-password">Confirm New Password</FieldLabel>
                                <div className="relative flex flex-row">
                                  <Input
                                    {...field}
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    className="text-xs"
                                    aria-invalid={fieldState.invalid}
                                  />
                                  <Button
                                    variant="ghost"
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-2"
                                  >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                                {fieldState.invalid && (
                                  <FieldError
                                    className="text-[10px]"
                                    errors={[fieldState.error]}
                                  />
                                )}
                              </Field>
                            )}
                          />

                          <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-xs space-y-1.5 text-zinc-400">
                            <span className="font-medium text-zinc-300 block mb-1">
                              Password Requirements:
                            </span>
                            <div className="flex items-center gap-2">
                              {passwordRequirements.minLength ? (
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <CircleX className="h-3.5 w-3.5 text-zinc-600" />
                              )}
                              <span>At least 8 characters</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {passwordRequirements.hasUpper && passwordRequirements.hasLower ? (
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <CircleX className="h-3.5 w-3.5 text-zinc-600" />
                              )}
                              <span>Uppercase & lowercase letters</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {passwordRequirements.hasNumber && passwordRequirements.hasSpecial ? (
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <CircleX className="h-3.5 w-3.5 text-zinc-600" />
                              )}
                              <span>Number & special character (@$!%*?&)</span>
                            </div>
                          </div>
                        </FieldGroup>
                      </form>
                    </>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                  {rawToken.trim() && !isSuccess && (
                    <Button
                      type="submit"
                      form="reset-password"
                      disabled={formState.isSubmitting}
                      className="w-full"
                    >
                      {formState.isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Updating Password...
                        </>
                      ) : (
                        <>
                          <KeyRound className="h-4 w-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate("/login")}
                    className="w-full text-xs text-zinc-400 hover:text-zinc-100"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    Back to Sign In
                  </Button>
                </CardFooter>
              </Card>

              <TermsAndPrivacyMessage message="password update" />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
