import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios from "axios"
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
  Mail,
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
import { forgotPasswordSchema } from "@/features/auth/schemas/recovery.schema"
import { forgotPassword } from "@/features/auth/services/auth.service"

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [isSuccess, setIsSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { formState, control, handleSubmit } = useForm<
    z.infer<typeof forgotPasswordSchema>
  >({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    try {
      setServerError(null)
      await forgotPassword(data.email)
      setIsSuccess(true)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ERR_NETWORK") {
          setServerError("Unable to connect to the server. Please try again.")
          return
        }
        const errorData = error.response?.data
        setServerError(errorData?.message || "Something went wrong. Please try again.")
        return
      }
      setServerError("Something went wrong. Please try again.")
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
                  <CardTitle className="text-xl font-bold">Forgot Password</CardTitle>
                  <CardDescription>
                    Enter your email address and we'll send you a link to reset your password.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {serverError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Request Failed</AlertTitle>
                      <AlertDescription className="text-xs">
                        {serverError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {isSuccess ? (
                    <div className="flex flex-col items-center text-center py-4 space-y-3">
                      <div className="h-12 w-12 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Mail className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-base text-zinc-100">
                        Check your inbox
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        If an account exists with that email address, we've dispatched a password reset link. The link is single-use and valid for <strong>15 minutes</strong>.
                      </p>
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsSuccess(false)}
                          className="text-xs"
                        >
                          Try another email
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form id="forgot-password" onSubmit={handleSubmit(onSubmit)}>
                      <FieldGroup>
                        <Controller
                          name="email"
                          control={control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="forgot-email">Email Address</FieldLabel>
                              <Input
                                {...field}
                                id="forgot-email"
                                type="email"
                                placeholder="name@company.com"
                                autoComplete="email"
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
                  )}
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                  {!isSuccess && (
                    <Button
                      type="submit"
                      form="forgot-password"
                      disabled={formState.isSubmitting}
                      className="w-full"
                    >
                      {formState.isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Sending reset link...
                        </>
                      ) : (
                        <>
                          Send Reset Link
                          <ArrowRight className="h-4 w-4 ml-2" />
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

              <TermsAndPrivacyMessage message="account recovery" />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
