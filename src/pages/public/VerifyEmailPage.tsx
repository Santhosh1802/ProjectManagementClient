import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios from "axios"
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MailCheck,
  Send,
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
import { resendVerificationSchema } from "@/features/auth/schemas/recovery.schema"
import { verifyEmail, resendVerification } from "@/features/auth/services/auth.service"

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const rawToken = searchParams.get("token") || ""

  const [isVerifying, setIsVerifying] = useState(Boolean(rawToken.trim()))
  const [isVerified, setIsVerified] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)

  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)

  const { formState, control, handleSubmit } = useForm<
    z.infer<typeof resendVerificationSchema>
  >({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: "",
    },
  })

  useEffect(() => {
    if (!rawToken.trim()) {
      setIsVerifying(false)
      return
    }

    let isMounted = true
    const runVerification = async () => {
      try {
        await verifyEmail(rawToken.trim())
        if (isMounted) {
          setIsVerified(true)
          setVerificationError(null)
        }
      } catch (error) {
        if (isMounted) {
          if (axios.isAxiosError(error)) {
            const errorData = error.response?.data
            setVerificationError(
              errorData?.message || "Verification link is invalid or has expired."
            )
          } else {
            setVerificationError("Failed to verify email. Please try again.")
          }
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false)
        }
      }
    }

    runVerification()

    return () => {
      isMounted = false
    }
  }, [rawToken])

  const onResendSubmit = async (data: z.infer<typeof resendVerificationSchema>) => {
    try {
      setResendError(null)
      await resendVerification(data.email)
      setResendSuccess(true)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data
        setResendError(errorData?.message || "Unable to send verification email. Please try again.")
      } else {
        setResendError("An unexpected error occurred. Please try again.")
      }
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
                  <CardTitle className="text-xl font-bold">Email Verification</CardTitle>
                  <CardDescription>
                    Confirm your email address to secure your account and enable full platform capabilities.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {isVerifying ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-xs text-zinc-400">
                        Verifying your email token with the server...
                      </p>
                    </div>
                  ) : isVerified ? (
                    <div className="flex flex-col items-center text-center py-4 space-y-3">
                      <div className="h-12 w-12 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-base text-zinc-100">
                        Email Successfully Verified!
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Your account email is verified. You now have full access to DevFlow workspaces and team collaboration features.
                      </p>
                      <div className="pt-2">
                        <Button
                          size="sm"
                          onClick={() => navigate("/login")}
                          className="text-xs"
                        >
                          Continue to Sign In
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {verificationError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Verification Failed</AlertTitle>
                          <AlertDescription className="text-xs">
                            {verificationError}
                          </AlertDescription>
                        </Alert>
                      )}

                      {resendSuccess ? (
                        <div className="flex flex-col items-center text-center py-3 space-y-2">
                          <div className="h-10 w-10 rounded-full bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400">
                            <MailCheck className="h-5 w-5" />
                          </div>
                          <h4 className="font-medium text-sm text-zinc-100">
                            Verification Email Sent
                          </h4>
                          <p className="text-xs text-zinc-400">
                            If an unverified account with that email exists, a fresh verification link has been dispatched.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="mb-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                              Resend Verification Link
                            </h4>
                            <p className="text-xs text-zinc-500 mt-1">
                              Enter your email below to receive a new single-use verification link.
                            </p>
                          </div>

                          {resendError && (
                            <Alert variant="destructive" className="mb-3">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Resend Failed</AlertTitle>
                              <AlertDescription className="text-xs">
                                {resendError}
                              </AlertDescription>
                            </Alert>
                          )}

                          <form id="resend-verification" onSubmit={handleSubmit(onResendSubmit)}>
                            <FieldGroup>
                              <Controller
                                name="email"
                                control={control}
                                render={({ field, fieldState }) => (
                                  <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="resend-email">Account Email</FieldLabel>
                                    <Input
                                      {...field}
                                      id="resend-email"
                                      type="email"
                                      placeholder="name@company.com"
                                      className="text-xs"
                                      aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                      <FieldError
                                        className="text-[10px]"
                                        errors={[fieldState.error]}
                                      />
                                    )}
                                  </Field>
                                )}
                              />
                            </FieldGroup>
                          </form>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                  {!isVerifying && !isVerified && !resendSuccess && (
                    <Button
                      type="submit"
                      form="resend-verification"
                      disabled={formState.isSubmitting}
                      className="w-full"
                    >
                      {formState.isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Sending Link...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Verification Link
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

              <TermsAndPrivacyMessage message="email verification" />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
