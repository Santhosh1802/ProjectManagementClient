import { useState } from "react"
import { submitFormOnModEnter } from "@/lib/keyboard"
import { useNavigate } from "react-router-dom"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck, UserPlus } from "lucide-react"

import { useAppSelector } from "@/hooks/redux-hooks"

import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import { Badge } from "@/components/ui/badge"
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
import ShortcutHint from "@/components/common/ShortcutHint"
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
    watch,
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

  const firstName = watch("firstName")
  const lastName = watch("lastName")
  const email = watch("email")
  const role = watch("role")

  const previewName = `${firstName || ""} ${lastName || ""}`.trim() || "New Member"
  const initials =
    `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase() || "NM"

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
    <PageContainer className="max-w-6xl space-y-6">
      <div className="mb-2">
        <Button
          type="button"
          variant="ghost"
          className="gap-2"
          onClick={() => navigate("/app/users")}
        >
          <ArrowLeft className="size-4" /> Users
        </Button>
      </div>

      <PageHeader
        title="Create User"
        description="Add a new user to the workspace and assign their access level."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="overflow-visible shadow-sm lg:col-span-8">
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
                <Alert className="mb-6 border-green-500/50 bg-green-500/10 text-green-600">
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
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 size-4" />
                    )}
                    Create User
                  </Button>
                </div>
              </FieldGroup>
            </CardContent>
          </form>
        </Card>

        {/* Live Account Preview & Role Capabilities */}
        <aside className="space-y-4 lg:col-span-4">
          <Card className="sticky top-6 border-border/80 bg-card/95 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Account Preview
              </CardTitle>
              <CardDescription className="text-xs">
                Live summary of the member being provisioned.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/30 p-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2 text-xs font-semibold text-primary-foreground">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{previewName}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {email || "email@workspace.com"}
                  </p>
                </div>
                <Badge variant="secondary">{role}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <ShieldCheck className="size-3.5 text-primary" />
                  <span>{role === "MANAGER" ? "Manager Permissions" : "User Permissions"}</span>
                </div>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3 text-primary" />
                    <span>Collaborate on assigned projects, whiteboards &amp; chat</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3 text-primary" />
                    <span>Create &amp; update tasks, comments, and attachments</span>
                  </li>
                  {role === "MANAGER" && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3 text-primary" />
                      <span>Create projects and manage project team members</span>
                    </li>
                  )}
                </ul>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Quick submit</span>
                <ShortcutHint keys={["mod", "Enter"]} />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageContainer>
  )
}
