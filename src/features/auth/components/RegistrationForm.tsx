import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  FieldGroup,
  FieldLabel,
  Field,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertCircleIcon,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CheckCircle2Icon,
  CircleX,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import type { RegistrationForm as RegistrationPayload } from "../types/auth.types"
import axios from "axios"
import { registrationSchema } from "../schemas/registration.schema"
import {
  registerUser,
  resendVerification,
  verifyEmailWithOtp,
} from "../services/auth.service"
import { handleClick } from "../utils/confettiSideCannon"
import { useNavigate } from "react-router-dom"
import OAuthButtons from "./OAuthButtons"

type SignupStep = 1 | 2 | 3

const STEP_TITLES: Record<SignupStep, { title: string; subtitle: string }> = {
  1: {
    title: "Create your account",
    subtitle: "Step 1 of 3 — Tell us who you are",
  },
  2: {
    title: "Secure your account",
    subtitle: "Step 2 of 3 — Set a strong password",
  },
  3: {
    title: "Verify your email",
    subtitle: "Step 3 of 3 — Enter the 6-digit OTP sent to your inbox",
  },
}

export default function RegistrationForm() {
  const navigate = useNavigate()
  const { formState, control, handleSubmit, trigger, reset } = useForm<
    z.infer<typeof registrationSchema>
  >({
    resolver: zodResolver(registrationSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const password = useWatch({ control, name: "password" }) ?? ""
  const passwordRequirements = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  }

  const [step, setStep] = useState<SignupStep>(1)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSubmitting, setOtpSubmitting] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [serverError, setServerError] = useState<{
    status?: number
    message: string
  } | null>(null)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  async function handleNextStep() {
    setServerError(null)
    const valid = await trigger(["firstName", "lastName", "email"])
    if (valid) {
      setStep(2)
    }
  }

  async function onSubmitAccount(data: z.infer<typeof registrationSchema>) {
    setServerError(null)
    try {
      const request: RegistrationPayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      }

      await registerUser(request)
      setRegisteredEmail(data.email.trim())
      setResendCooldown(30)
      reset()
      setStep(3)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ERR_NETWORK") {
          setServerError({ message: "Unable to connect to the server." })
          return
        }
        const errorData = error.response?.data
        setServerError({
          status: errorData?.status,
          message: errorData?.message || "Something went wrong. Please try again.",
        })
      } else {
        setServerError({ message: "An unexpected error occurred." })
      }
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    setResendMessage(null)

    const cleanedOtp = otp.replace(/\D/g, "")
    if (cleanedOtp.length !== 6) {
      setServerError({ message: "Please enter the 6-digit verification code." })
      return
    }

    setOtpSubmitting(true)
    try {
      await verifyEmailWithOtp(registeredEmail, cleanedOtp)
      setIsVerified(true)
      handleClick()
      setTimeout(() => {
        navigate("/login")
      }, 1500)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data
        setServerError({
          status: errorData?.status,
          message: errorData?.message || "Invalid or expired OTP code.",
        })
      } else {
        setServerError({ message: "Failed to verify code." })
      }
    } finally {
      setOtpSubmitting(false)
    }
  }

  async function handleResendOtp() {
    if (!registeredEmail || resendCooldown > 0) return
    setServerError(null)
    setResendMessage(null)
    try {
      await resendVerification(registeredEmail)
      setResendCooldown(30)
      setResendMessage("A new 6-digit verification code has been sent.")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setServerError({
          message: error.response?.data?.message || "Failed to resend code.",
        })
      }
    }
  }

  return (
    <Card className="w-full max-w-md border-border/80 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5 w-full">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-muted-foreground shrink-0">
            {step}/3
          </span>
        </div>

        <div>
          <CardTitle className="text-xl">{STEP_TITLES[step].title}</CardTitle>
          <CardDescription>{STEP_TITLES[step].subtitle}</CardDescription>
        </div>

        {serverError && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Registration failed</AlertTitle>
            <AlertDescription>{serverError.message}</AlertDescription>
          </Alert>
        )}

        {isVerified && (
          <Alert className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2Icon />
            <AlertTitle>Email verified!</AlertTitle>
            <AlertDescription>
              Your account is ready. Redirecting to login...
            </AlertDescription>
          </Alert>
        )}

        {resendMessage && (
          <Alert>
            <MailCheck />
            <AlertTitle>Code sent</AlertTitle>
            <AlertDescription>{resendMessage}</AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent>
        {step === 1 && (
          <div className="space-y-4">
            <FieldGroup>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="first-name">First name</FieldLabel>
                      <Input
                        {...field}
                        id="first-name"
                        placeholder="John"
                        autoComplete="given-name"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="last-name">Last name</FieldLabel>
                      <Input
                        {...field}
                        id="last-name"
                        placeholder="Doe"
                        autoComplete="family-name"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Work email</FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>

            <Button type="button" className="w-full" onClick={handleNextStep}>
              Continue
              <ArrowRight className="ml-2 size-4" />
            </Button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <OAuthButtons />
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmitAccount)} className="space-y-4">
            <FieldGroup>
              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}

                    <div className="grid grid-cols-2 gap-1.5 pt-2 text-xs">
                      {[
                        { ok: passwordRequirements.minLength, label: "8+ characters" },
                        { ok: passwordRequirements.uppercase, label: "Uppercase letter" },
                        { ok: passwordRequirements.number, label: "One number" },
                        { ok: passwordRequirements.special, label: "Special (@$!%*?&)" },
                      ].map((req) => (
                        <div
                          key={req.label}
                          className={`flex items-center gap-1.5 ${
                            req.ok ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                          }`}
                        >
                          {req.ok ? (
                            <CheckCircle className="size-3.5 shrink-0" />
                          ) : (
                            <CircleX className="size-3.5 shrink-0" />
                          )}
                          <span>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setServerError(null)
                  setStep(1)
                }}
                disabled={formState.isSubmitting}
              >
                <ArrowLeft className="mr-1.5 size-4" />
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={formState.isSubmitting}>
                {formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
              We sent a 6-digit verification code to{" "}
              <span className="font-medium text-foreground">{registeredEmail}</span>.
            </div>

            <Field>
              <FieldLabel htmlFor="otp-code">6-Digit Verification Code</FieldLabel>
              <Input
                id="otp-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="text-center font-mono text-2xl tracking-[0.5em] h-12"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                disabled={otpSubmitting || isVerified}
              />
            </Field>

            <Button
              type="submit"
              className="w-full"
              disabled={otpSubmitting || isVerified || otp.length !== 6}
            >
              {otpSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-xs"
                disabled={resendCooldown > 0}
                onClick={handleResendOtp}
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend OTP code"}
              </Button>
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-xs"
                onClick={() => navigate("/login")}
              >
                Verify later → Login
              </Button>
            </div>
          </form>
        )}
      </CardContent>

      {step !== 3 && (
        <>
          <Separator />
          <CardFooter className="flex items-center justify-center pt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button
              variant="link"
              className="px-1.5 font-semibold"
              onClick={() => navigate("/login")}
            >
              Sign in
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
