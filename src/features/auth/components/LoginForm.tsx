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
import { Kbd } from "@/components/ui/kbd"
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
import { useNavigate } from "react-router-dom"
import { setUser, type User } from "../slice/authSlice";
import { useAppDispatch } from "@/hooks/redux-hooks";


export default function LoginForm() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch();
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
  const [serverError, setServerError] = useState<{
    status?: number
    message: string
  } | null>(null)
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
      }

      const response = await LoginUser(request)
      setIsSuccess(true)
      setServerError(null)
      const user = response.data?.data || null;
      const loggedInUser:User = {
        id:user.id,
        firstName:user.firstName,
        lastName:user.lastName,
        email:user.email,
        user_role:user.user_role,
      }
      dispatch(setUser(loggedInUser));
      reset()
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
    <Card className="max-w-sm min-w-sm">
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
            className={"mt-2 mb-2 max-w-sm min-w-xs border-red-400"}
          >
            <AlertCircleIcon />
            <AlertTitle>
              {serverError?.status === 409 ? "User Not Found" : "Login Failed"}
            </AlertTitle>
            <AlertDescription className="flex flex-row items-center text-[10px]">
              {serverError?.message}
              <a
                href=""
                className={serverError?.status === 409 ? "pl-1" : "hidden"}
              >
                Sign up instead
              </a>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert
            variant="success"
            className={isSuccess ? "mt-2 mb-2 max-w-sm min-w-xs" : "hidden"}
          >
            <CheckCircle2Icon />
            <AlertTitle>Authentication successful</AlertTitle>
            <AlertDescription className="flex flex-row items-center text-[10px]">
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
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>
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
          </FieldGroup>
        </form>
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
        <div className="font-mono font-light text-zinc-500">
          Press <Kbd>Enter ⏎</Kbd> to continue
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
