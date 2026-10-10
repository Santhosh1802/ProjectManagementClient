import { useState } from "react"
import { submitFormOnModEnter } from "@/lib/keyboard"
import { useNavigate } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2, UserPlus } from "lucide-react"

import { useAppSelector } from "@/hooks/redux-hooks"

import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

import {
  createUserSchema,
  type CreateUserFormValues,
} from "@/features/users/schemas/user.schema"
import { createUser } from "@/features/users/services/users.service"

export default function CreateUserPage() {
  const navigate = useNavigate()
  const currentUser = useAppSelector((state) => state.auth.user)
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "USER",
    },
  })

  const onSubmit = async (data: CreateUserFormValues) => {
    try {
      setApiError(null)
      setSuccess(false)
      
      await createUser({
        firstName: data.firstName.trim(),
        lastName: data.lastName?.trim() || "",
        email: data.email.trim(),
        password: data.password,
        role: data.role as "ADMIN" | "MANAGER" | "USER",
      })

      setSuccess(true)
      reset()
    } catch (error) {
      if (error instanceof Error && error.message) {
        setApiError(error.message)
      } else {
        setApiError("An unexpected error occurred while creating the user.")
      }
    }
  }

  return (
    <PageContainer className="max-w-3xl space-y-6">
      <div className="mb-2">
        <Button
          type="button"
          variant="ghost"
          className="-ml-3 gap-2"
          onClick={() => navigate("/app/users")}
        >
          <ArrowLeft className="size-4" /> Users
        </Button>
      </div>

      <PageHeader 
        title="Create User"
        description="Add a new user to the workspace."
      />

      <Card className="overflow-visible shadow-sm">
        <CardHeader className="border-b bg-muted/20 px-4 py-4 sm:px-6 sm:py-5">
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            Provide the user's personal information, credentials, and access role.
          </CardDescription>
        </CardHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={submitFormOnModEnter}
          >
            <CardContent className="p-4 sm:p-6">
              {apiError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-6 border-green-500/50 text-green-600 bg-green-500/10">
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    The user was created successfully.
                  </AlertDescription>
                </Alert>
              )}

              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="firstName">First name</FieldLabel>
                        <Input
                          {...field}
                          id="firstName"
                          placeholder="John"
                          autoComplete="off"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                        <Input
                          {...field}
                          id="lastName"
                          placeholder="Doe"
                          autoComplete="off"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
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
                      <FieldLabel htmlFor="email">Email address</FieldLabel>
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        autoComplete="off"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="password">Temporary Password</FieldLabel>
                      <Input
                        {...field}
                        id="password"
                        type="password"
                        placeholder="Enter at least 8 characters"
                        autoComplete="new-password"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Separator className="my-2" />

                <Controller
                  name="role"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="role">Role</FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger id="role" className="w-full">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          {currentUser?.user_role === "ADMIN" && (
                            <SelectItem value="MANAGER">Manager</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        {currentUser?.user_role === "ADMIN" 
                          ? "Determine what access level the user will have."
                          : "Managers can only create standard User accounts."}
                      </FieldDescription>
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/app/users")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="size-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="size-4 mr-2" />
                    )}
                    Create User
                  </Button>
                </div>
              </FieldGroup>
            </CardContent>
          </form>
      </Card>
    </PageContainer>
  )
}
