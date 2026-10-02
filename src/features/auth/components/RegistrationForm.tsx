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
  CheckCircle,
  CheckCircle2Icon,
  CircleX,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react"
import { useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { useHotkeys } from "react-hotkeys-hook"
import { z } from "zod"
import type { RegistrationForm } from "../types/auth.types"
import axios from "axios"
import { registrationSchema } from "../schemas/registration.schema"
import { registerUser } from "../services/auth.service"
import { handleClick } from "../utils/confettiSideCannon";
import { useNavigate } from "react-router-dom"

export default function RegistrationForm() {
  const navigate = useNavigate()
  const { formState, control, handleSubmit, reset } = useForm<
    z.infer<typeof registrationSchema>
  >({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })
  const password = useWatch({
    control,
    name: "password",
  })
  const passwordRequirements = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  }
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
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

  function handleShowConfirmPasswordToggle() {
    if (showConfirmPassword) {
      setShowConfirmPassword(false)
    } else {
      setShowConfirmPassword(true)
    }
  }
  function goToLoginPage() {
        navigate("/login");
    }

  async function onSubmit(data: z.infer<typeof registrationSchema>) {
    try {
      const request: RegistrationForm = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      }

      await registerUser(request)
      setIsSuccess(true)
      handleClick();
      reset()
      setTimeout(() => {
        navigate("/login")
      }, 1500)
      //TODO configure login page navigation links
    } catch (error) {
      console.log("Error:", error)
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Enter your details below to create your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {serverError && !isSuccess ? (
          <Alert
            variant="destructive"
            className={"mt-2 mb-2 min-w-sm border-red-400"}
          >
            <AlertCircleIcon />
            <AlertTitle>
              {serverError?.status === 409
                ? "Email Already Exist"
                : "Registration Failed"}
            </AlertTitle>
            <AlertDescription className="flex flex-row items-center text-[10px]">
              {serverError?.message}
              <a
                href=""
                className={serverError?.status === 409 ? "pl-1" : "hidden"}
              >
                Sign in instead
              </a>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert
            variant="success"
            className={isSuccess ? "mt-2 mb-2 min-w-sm" : "hidden"}
          >
            <CheckCircle2Icon />
            <AlertTitle>Account Created</AlertTitle>
            <AlertDescription className="flex flex-row items-center text-[10px]">
              Your workspace has been provisioned. Redirecting you to login
              page..
            </AlertDescription>
          </Alert>
        )}

        <form id="register" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="flex flex-row gap-2">
              <Controller
                name="firstName"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="register-firstName">
                      First name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="register-firstName"
                      aria-invalid={fieldState.invalid}
                      placeholder="First Name"
                      className="text-xs"
                      autoComplete="given-name"
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
                name="lastName"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="register-lastName">
                      Last name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="register-lastName"
                      aria-invalid={fieldState.invalid}
                      placeholder="Last Name"
                      className="text-xs"
                      autoComplete="family-name"
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
            </div>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="register-email"
                    aria-invalid={fieldState.invalid}
                    placeholder="santhosh@email.com"
                    className="text-xs"
                    autoComplete="email"
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
                  <FieldLabel htmlFor="register-password">Password</FieldLabel>
                  <div className="relative flex flex-row">
                    <Input
                      {...field}
                      id="register-password"
                      aria-invalid={fieldState.invalid}
                      placeholder="••••••••"
                      className="text-xs pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50 autofill:bg-background autofill:text-foreground"
                      autoComplete="new-password"
                      type={showPassword ? "text" : "password"}
                    />
                    <Button
                      variant="ghost"
                      onClick={handleShowPasswordToggle}
                      className={"absolute right-0"}
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
            <Card className="bg-muted">
              <CardContent>
                <p className="pb-2 font-mono text-xs font-medium text-muted-foreground">
                  PASSWORD REQUIREMENTS
                </p>
                <div className="flex min-w-sm flex-col gap-1">
                  <div className="flex flex-row items-center gap-2">
                    {passwordRequirements.minLength ? (
                      <CheckCircle2Icon className="size-4 text-green-500" />
                    ) : (
                      <CircleX className="size-4 text-red-500" />
                    )}

                    <p className="text-[10px] font-light">
                      Minimum 8 characters
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    {passwordRequirements.uppercase ? (
                      <CheckCircle2Icon className="size-4 text-green-500" />
                    ) : (
                      <CircleX className="size-4 text-red-500" />
                    )}
                    <p className="text-[10px] font-light">
                      At least one uppercase letter
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    {passwordRequirements.number ? (
                      <CheckCircle2Icon className="size-4 text-green-500" />
                    ) : (
                      <CircleX className="size-4 text-red-500" />
                    )}
                    <p className="text-[10px] font-light">
                      At least one number
                    </p>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    {passwordRequirements.special ? (
                      <CheckCircle2Icon className="size-4 text-green-500" />
                    ) : (
                      <CircleX className="size-4 text-red-500" />
                    )}
                    <p className="text-[10px] font-light">
                      At least one special symbol
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="register-confirm-password">
                    Confirm password
                  </FieldLabel>
                  <div className="relative flex flex-row">
                    <Input
                      {...field}
                      id="register-confirm-password"
                      aria-invalid={fieldState.invalid}
                      placeholder="••••••••"
                      className="text-xs pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50 autofill:bg-background autofill:text-foreground"
                      autoComplete="new-password"
                      type={showConfirmPassword ? "text" : "password"}
                    />
                    <Button
                      variant="ghost"
                      onClick={handleShowConfirmPasswordToggle}
                      className="absolute right-0"
                      type="button"
                    >
                      {showConfirmPassword ? <EyeOff className="text-primary" /> : <Eye className="text-primary focus:text-primary" />}
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
            {isSuccess ? "Redirecting to Login Page" : "Create account"}{" "}
            {formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <CheckCircle />
            )}
          </Button>
        </Field>
        <div className="font-mono font-light text-zinc-500">
          Press <Kbd>Enter ⏎</Kbd> to register
        </div>
        <Separator></Separator>
        <div className="text-zinc-500">
          Already have an account?
          <Button type="button" variant="link" className="underline" onClick={goToLoginPage}>
            Sign in
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
