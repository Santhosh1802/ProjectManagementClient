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
import ShortcutHint from "@/components/common/ShortcutHint"
import { Separator } from "@/components/ui/separator"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertCircleIcon,
  ArrowRight,
  CheckCircle2Icon,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useHotkeys } from "react-hotkeys-hook"
import { z } from "zod"
import type { LoginForm } from "../types/auth.types"
import axios from "axios"
import { LoginUser } from "../services/auth.service"
import { loginSchema } from "../schemas/login.schema"
import { useNavigate, useSearchParams } from "react-router-dom"
import { setAuthUser, type AuthUser } from "../slice/authSlice";
import { useAppDispatch } from "@/hooks/redux-hooks";
import OAuthButtons from "./OAuthButtons";

export default function LoginForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const dispatch = useAppDispatch();
  const oauthError = searchParams.get("error")

  const { formState, control, handleSubmit, reset } = useForm<
    z.infer<typeof loginSchema>
  >({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [mfaStepRequired, setMfaStepRequired] = useState<boolean>(false)
  const [mfaCode, setMfaCode] = useState<string>("")
  const [serverError, setServerError] = useState<{
    status?: number
    message: string
  } | null>(() => {
    if (oauthError) {
      if (oauthError === "unverified_provider_email") {
        return { message: "Your email is not verified on your OAuth provider account. Please verify it there first." }
      }
      if (oauthError === "account_deactivated") {
        return { message: "Your account has been deactivated. Please contact support." }
      }
      return { message: `OAuth sign-in was unsuccessful (${oauthError}). Please try again or use your password.` }
    }
    return null
  })
  function handleShowPasswordToggle() {
    if (showPassword) {
      setShowPassword(false)
    } else {
      setShowPassword(true)
    }
  }
  function goToRegisterPage() {
    navigate("/register")
  }

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    try {
      const request: LoginForm = {
        email: data.email,
        password: data.password,
        ...(mfaStepRequired && mfaCode.trim() ? { mfaCode: mfaCode.trim() } : {}),
      }

      const response = await LoginUser(request)

      if (response.status === 202 || response.data?.message === "MFA_REQUIRED") {
        setMfaStepRequired(true)
        setServerError(null)
        return
      }

      setIsSuccess(true)
      setServerError(null)
      const user = response.data?.data || null;
      
      const loggedInUser:AuthUser = {
        id:user.id,
        firstName:user.firstName,
        lastName:user.lastName,
        email:user.email,
        user_role:user.userRole,
        avatarUrl:user.avatarUrl ?? null,
        mfaEnabled:Boolean(user.mfaEnabled),
      }
      dispatch(setAuthUser(loggedInUser));
      reset()
      setMfaStepRequired(false)
      setMfaCode("")
      setTimeout(() => {
        navigate("/app/dashboard")
      }, 1500)
    } catch (error) {
      setIsSuccess(false)

      if (axios.isAxiosError(error)) {
        if (error.code === "ERR_NETWORK") {
          setServerError({ message: "Unable to connect to the server." })
          return
        }
        const errorData = error.response?.data

        setServerError({
          status: errorData?.status,
          message: errorData?.message ?? "Something went wrong.",
        })
        return
      }
      setServerError({
        message: "Something went wrong. Please try again.",
      })
    }
  }

  useHotkeys("Enter", () => {
    handleSubmit(onSubmit)()
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {serverError && !isSuccess ? (
          <Alert
            variant="destructive"
            className="mt-2 mb-2 w-full border-red-400"
          >
            <AlertCircleIcon />
            <AlertTitle>
              {serverError?.status === 409 ? "User Not Found" : "Login Failed"}
            </AlertTitle>
            <AlertDescription className="text-[10px] break-words">
              <span>{serverError?.message}</span>
              {serverError?.status === 409 && (
                <a
                  href="/register"
                  className="inline-block pl-1 underline"
                  onClick={(e) => {
                    e.preventDefault()
                    goToRegisterPage()
                  }}
                >
                  Sign up instead
                </a>
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert
            variant="success"
            className={isSuccess ? "mt-2 mb-2 w-full" : "hidden"}
          >
            <CheckCircle2Icon />
            <AlertTitle>Authentication successful</AlertTitle>
            <AlertDescription className="text-[10px] break-words">
              Authentication successful. Redirecting to workspace.
            </AlertDescription>
          </Alert>
        )}

        <form id="login" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="flex flex-row gap-2"></div>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="login-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="login-email"
                    aria-invalid={fieldState.invalid}
                    placeholder="santhosh@email.com"
                    className="text-xs"
                    autoComplete="username"
                    type="email"
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
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="login-password">Password</FieldLabel>
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-xs text-zinc-400 hover:text-primary h-auto font-normal underline"
                      onClick={() => navigate("/forgot-password")}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <div className="relative flex flex-row">
                    <Input
                      {...field}
                      id="login-password"
                      aria-invalid={fieldState.invalid}
                      placeholder="••••••••"
                      className="text-xs"
                      autoComplete="new-password"
                      type={showPassword ? "text" : "password"}
                    />
                    <Button
                      variant="ghost"
                      onClick={handleShowPasswordToggle}
                      className={"absolute right-2"}
                      type="button"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
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
            {mfaStepRequired && (
              <Field>
                <FieldLabel htmlFor="login-mfa-code">
                  Two-Factor Authentication Code (6 digits)
                </FieldLabel>
                <Input
                  id="login-mfa-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit code from Authenticator app"
                  className="font-mono tracking-widest text-xs"
                  autoFocus
                />
              </Field>
            )}
          </FieldGroup>
        </form>

        <div className="mt-4">
          <OAuthButtons />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Field>
          <Button
            type="submit"
            disabled={formState.isSubmitting}
            className="p-4"
            onClick={handleSubmit(onSubmit)}
          >
            {isSuccess ? "Authenticating" : "Sign in"}{" "}
            {formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ArrowRight />
            )}
          </Button>
        </Field>
        <div className="flex items-center gap-1.5 font-mono font-light text-zinc-500">
          <span>Press</span>
          <ShortcutHint keys={["Enter"]} />
          <span>to continue</span>
        </div>
        <Separator></Separator>
        <div className="text-zinc-500">
          Don't have an account?
          <Button
            type="button"
            variant="link"
            className="underline"
            onClick={goToRegisterPage}
          >
            Sign up
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
