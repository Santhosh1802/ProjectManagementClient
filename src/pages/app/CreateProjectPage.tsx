import { useEffect, useMemo, useState } from "react"
import { submitFormOnModEnter } from "@/lib/keyboard"

import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react"

import { useNavigate } from "react-router-dom"

import { Controller, useForm, useWatch } from "react-hook-form"

import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"

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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"

import { Textarea } from "@/components/ui/textarea"

import { Badge } from "@/components/ui/badge"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { Separator } from "@/components/ui/separator"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { DatePicker } from "@/components/ui/date-picker"

import { useAppSelector } from "@/hooks/redux-hooks"

import type { RootState } from "@/app/store"

import { createProject } from "@/features/projects/services/projects.services"

import { createProjectMember } from "@/features/projects/services/project.members.service"

import { searchUsers } from "@/features/users/services/users.service"

import type { CreateProjectRequest } from "@/features/projects/types/project.types"

import type { User } from "@/features/users/types/user.types"

import {
  createProjectSchema,
  type CreateProjectFormValues,
} from "@/features/projects/schemas/createProject.schema"

/* ============================================================

 Types

 ============================================================ */

type Step = 1 | 2

interface SelectedMember {
  user: User
}

interface StepItem {
  number: Step

  title: string

  description: string
}

/* ============================================================

 Constants

 ============================================================ */

const steps: StepItem[] = [
  {
    number: 1,

    title: "Project details",

    description: "Set up your project",
  },

  {
    number: 2,

    title: "Add members",

    description: "Invite your team",
  },
]

/* ============================================================

 Helpers

 ============================================================ */

function getUserInitials(user: User) {
  const first = user.firstName?.charAt(0) ?? ""

  const last = user.lastName?.charAt(0) ?? ""

  return `${first}${last}`.toUpperCase()
}

function getUserName(user: User) {
  return `${user.firstName} ${user.lastName}`.trim()
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

/* ============================================================

 Page

 ============================================================ */

export default function CreateProjectPage() {
  const navigate =
    useNavigate() /* ----------------------------------------------------------

  Auth

  ---------------------------------------------------------- */

  const currentUserId = useAppSelector(
    (state: RootState) => state.auth.user?.id
  ) /* ----------------------------------------------------------

  Step

  ---------------------------------------------------------- */

  const [step, setStep] = useState<Step>(1)

  const [projectId, setProjectId] = useState<string | null>(
    null
  ) /* ----------------------------------------------------------

  React Hook Form

  ---------------------------------------------------------- */

  const {
    control,

    handleSubmit,

    formState: { isSubmitting },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),

    mode: "onBlur",

    reValidateMode: "onChange",

    defaultValues: {
      name: "",

      description: "",

      startDate: "",

      dueDate: "",
    },
  }) /* ----------------------------------------------------------

  Watched fields

  ---------------------------------------------------------- */

  const startDate = useWatch({
    control,

    name: "startDate",
  })

  const projectName = useWatch({
    control,

    name: "name",
  })

  const description = useWatch({
    control,

    name: "description",
  }) /* ----------------------------------------------------------

  Member state

  ---------------------------------------------------------- */

  const [members, setMembers] = useState<SelectedMember[]>([])

  const [memberInput, setMemberInput] = useState("")

  const [searchUsersResult, setSearchUsersResult] = useState<User[]>([])

  const [searchLoading, setSearchLoading] = useState(false)

  const [memberSearchError, setMemberSearchError] = useState<string | null>(
    null
  ) /* ----------------------------------------------------------

  Project/API state

  ---------------------------------------------------------- */

  const [projectCreationError, setProjectCreationError] = useState<
    string | null
  >(null)

  const [memberCreationError, setMemberCreationError] = useState<string | null>(
    null
  )

  const [creatingMembers, setCreatingMembers] =
    useState(
      false
    ) /* ==========================================================

Available search results

  ========================================================== */

  const availableSearchResults = useMemo(() => {
    return searchUsersResult.filter(
      (user) =>
        user.id !== currentUserId &&
        !members.some((member) => member.user.id === user.id)
    )
  }, [
    searchUsersResult,
    currentUserId,
    members,
  ]) /* ==========================================================

  Search users

  ========================================================== */

  useEffect(() => {
    const keyword = memberInput.trim()

    if (!keyword) {
      return
    }

    let cancelled = false

    const timeout = window.setTimeout(async () => {
      try {
        setSearchLoading(true)

        setMemberSearchError(null)

        const response = await searchUsers({
          keyword,

          page: 0,

          size: 10,
        })

        if (cancelled) {
          return
        }

        setSearchUsersResult(response.content)
      } catch (error) {
        if (cancelled) {
          return
        }

        setSearchUsersResult([])

        setMemberSearchError(
          getApiErrorMessage(error, "Unable to search users.")
        )
      } finally {
        if (!cancelled) {
          setSearchLoading(false)
        }
      }
    }, 300)

    return () => {
      cancelled = true

      window.clearTimeout(timeout)
    }
  }, [
    memberInput,
  ]) /* ==========================================================

Create project

  ========================================================== */

  const handleContinue = async (data: CreateProjectFormValues) => {
    try {
      setProjectCreationError(null)

      const startDate = new Date(`${data.startDate}T00:00:00`).toISOString()

      const dueDate = new Date(`${data.dueDate}T23:59:59`).toISOString() /*

   * The backend determines the project owner

   * from the authenticated user.

   *

   * Do not send owner here.

   */

      const createProjectRequest: CreateProjectRequest = {
        name: data.name.trim(),

        description: data.description?.trim() || undefined,

        startDate,

        dueDate,
      }

      const project = await createProject(createProjectRequest)

      setProjectId(project.id)

      setStep(2)
    } catch (error) {
      setProjectCreationError(
        getApiErrorMessage(
          error,

          "Unable to create the project. Please try again."
        )
      )
    }
  } /* ==========================================================

  Select member

  ========================================================== */

  const handleSelectMember = (user: User) => {
    if (user.id === currentUserId) {
      return
    }

    if (members.some((member) => member.user.id === user.id)) {
      return
    }

    setMembers((current) => [
      ...current,

      {
        user,
      },
    ])

    setMemberInput("")

    setSearchUsersResult([])

    setMemberSearchError(null)
  } /* ==========================================================

Remove member

  ========================================================== */

  const handleRemoveMember = (userId: string) => {
    setMembers((current) =>
      current.filter((member) => member.user.id !== userId)
    )
  } /* ==========================================================

  Finish project creation

  ========================================================== */

  const handleCreate = async () => {
    if (!projectId) {
      setMemberCreationError(
        "The project was not created. Please go back and try again."
      )

      return
    }

    try {
      setCreatingMembers(true)

      setMemberCreationError(null) /*

   \* The backend accepts one project member

   \* per request.

   \*

   \* Selected members are created as MEMBER.

   */

      for (const member of members) {
        await createProjectMember({
          projectId,

          projectMemberId: member.user.id,

          projectRole: "MEMBER",
        })
      }

      navigate(`/app/projects/${projectId}`)
    } catch (error) {
      setMemberCreationError(
        getApiErrorMessage(
          error,

          "Unable to add project members. Please try again."
        )
      )
    } finally {
      setCreatingMembers(false)
    }
  } /* ==========================================================

  Back

  ========================================================== */

  const handleBack = () => {
    setMemberCreationError(null)

    setStep(1)
  }

  const handleMemberInputChange = (value: string) => {
    setMemberInput(value)

    if (!value.trim()) {
      setSearchUsersResult([])

      setSearchLoading(false)

      setMemberSearchError(null)
    }
  } /* ==========================================================

  Render

  ========================================================== */

  return (
    <PageContainer className="max-w-4xl">
      <div className="mb-6 sm:mb-8">
        <Button
          type="button"
          variant="ghost"
          className="mb-4  gap-2"
          onClick={() => navigate("/app/projects")}
        >
          <ArrowLeft className="size-4" /> Projects
        </Button>
        <PageHeader 
          title="Create project"
          description="Set up your project and build your team."
          className="mb-0"
        />
      </div>
        {/* ==================================================

      Stepper

      ================================================== */}{" "}
        <div className="mb-6 rounded-xl border bg-card p-3 shadow-sm sm:mb-8 sm:p-4">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-start sm:gap-0">
            {steps.map((item, index) => {
              const active = step === item.number
              const completed = step > item.number
              const isLast = index === steps.length - 1

              return (
                <div
                  key={item.number}
                  className="flex min-w-0 flex-1 items-center sm:items-start"
                >
                  <div
                    className={[
                      "flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 sm:gap-3 sm:rounded-none sm:px-0 sm:py-0",
                      active && "bg-primary/5 sm:bg-transparent",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div
                      className={[
                        "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all sm:size-9 sm:text-sm",
                        completed &&
                        "border-primary bg-primary text-primary-foreground",
                        active &&
                        "border-primary bg-background text-primary ring-4 ring-primary/10",
                        !active &&
                        !completed &&
                        "border-muted-foreground/30 bg-background text-muted-foreground",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {completed ? <Check className="size-4" /> : item.number}
                    </div>

                    <div className="min-w-0">
                      <p
                        className={[
                          "truncate text-xs font-semibold sm:text-sm",
                          active || completed
                            ? "text-foreground"
                            : "text-muted-foreground",
                        ].join(" ")}
                      >
                        {item.title}
                      </p>

                      <p className="hidden truncate text-xs text-muted-foreground sm:block">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {!isLast && (
                    <div
                      className={[
                        "mx-2 mt-4 hidden h-px flex-1 sm:mx-4 sm:block",
                        completed ? "bg-primary" : "bg-border",
                      ].join(" ")}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
        {/* ==================================================

      STEP 1

      ================================================== */}{" "}
        {step === 1 && (
          <Card className="overflow-visible shadow-sm">
            {" "}
            <CardHeader className="border-b bg-muted/20 px-4 py-4 sm:px-6 sm:py-5">
              <CardTitle>Project details</CardTitle>{" "}
              <CardDescription>
                Give your project a name and define its timeline.{" "}
              </CardDescription>{" "}
            </CardHeader>{" "}
            <form
              onSubmit={handleSubmit(handleContinue)}
              onKeyDown={submitFormOnModEnter}
            >
              {" "}
              <CardContent className="p-4 sm:p-6">
                {" "}
                <FieldGroup>
                  {" "}
                  {/* ========================================

           Project name

           ======================================== */}{" "}
                  <Controller
                    name="name"

                    control={control}

                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        {" "}
                        <FieldLabel htmlFor="project-name">
                          Project name{" "}
                        </FieldLabel>{" "}
                        <Input
                          {...field}

                          id="project-name"

                          placeholder="e.g. E-Commerce Platform"

                          autoComplete="off"

                          minLength={5}

                          maxLength={50}

                          aria-invalid={fieldState.invalid}
                        />
                        <div className="flex items-center justify-between gap-4">
                          <FieldDescription>
                            Choose a clear name between 5 and 50 characters.
                          </FieldDescription>

                          <span className="shrink-0 text-xs text-muted-foreground">
                            {projectName?.length ?? 0}/50
                          </span>
                        </div>
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  {/* ========================================

 Description

            ======================================== */}{" "}
                  <Controller
                    name="description"

                    control={control}

                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        {" "}
                        <FieldLabel htmlFor="project-description">
                          Description{" "}
                        </FieldLabel>{" "}
                        <Textarea
                          {...field}

                          id="project-description"

                          placeholder="Briefly describe what this project is about..."

                          rows={5}

                          minLength={10}

                          maxLength={200}

                          aria-invalid={fieldState.invalid}
                        />
                        <div className="flex items-center justify-between gap-4">
                          <FieldDescription>
                            Provide a summary between 10 and 200 characters.
                          </FieldDescription>

                          <span className="shrink-0 text-xs text-muted-foreground">
                            {description?.length ?? 0}/200
                          </span>
                        </div>{" "}
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}{" "}
                      </Field>
                    )}
                  />
                  <Separator />{" "}
                  {/* ========================================

           Timeline

           ======================================== */}{" "}
                  <div className="space-y-4">
                    {" "}
                    <div>
                      {" "}
                      <h3 className="text-sm font-medium">
                        Project timeline
                      </h3>{" "}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Define when the project starts and when it is expected
                        to finish.{" "}
                      </p>{" "}
                    </div>{" "}
                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                      {" "}
                      {/* ==================================

             Start date

             ================================== */}{" "}
                      <Controller
                        name="startDate"

                        control={control}

                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            {" "}
                            <FieldLabel htmlFor="start-date">
                              Start date{" "}
                            </FieldLabel>{" "}
                            <DatePicker
                              value={field.value}

                              onChange={field.onChange}

                              placeholder="Select start date"

                              disabled={isSubmitting}
                            />{" "}
                            <FieldDescription>
                              When work on this project begins.{" "}
                            </FieldDescription>{" "}
                            {fieldState.error && (
                              <FieldError errors={[fieldState.error]} />
                            )}{" "}
                          </Field>
                        )}
                      />{" "}
                      {/* ==================================

             Due date

             ================================== */}{" "}
                      <Controller
                        name="dueDate"

                        control={control}

                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            {" "}
                            <FieldLabel htmlFor="due-date">
                              Due date
                            </FieldLabel>{" "}
                            <DatePicker
                              value={field.value}

                              minDate={startDate || undefined}

                              onChange={field.onChange}

                              placeholder="Select due date"

                              disabled={isSubmitting}
                            />{" "}
                            <FieldDescription>
                              Must be on or after the start date.{" "}
                            </FieldDescription>{" "}
                            {fieldState.error && (
                              <FieldError errors={[fieldState.error]} />
                            )}{" "}
                          </Field>
                        )}
                      />{" "}
                    </div>{" "}
                  </div>{" "}
                  {/* ========================================

           API error

           ======================================== */}{" "}
                  {projectCreationError && (
                    <Alert variant="destructive">
                      <AlertCircle className="size-4" />{" "}
                      <AlertTitle>Unable to create project</AlertTitle>{" "}
                      <AlertDescription>
                        {projectCreationError}{" "}
                      </AlertDescription>{" "}
                    </Alert>
                  )}{" "}
                </FieldGroup>{" "}
              </CardContent>{" "}
              {/* ============================================

         Footer

         ============================================ */}{" "}
              <CardFooter className="flex-col-reverse gap-2 border-t bg-muted/20 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
                {" "}
                <Button
                  type="button"

                  variant="outline"

                  onClick={() => navigate("/app/projects")}

                  disabled={isSubmitting}
                >
                  Cancel{" "}
                </Button>{" "}
                <Button type="submit" disabled={isSubmitting}>
                  {" "}
                  {isSubmitting ? (
                    <>
                      {" "}
                      <Loader2 className="size-4 animate-spin" />
                      Creating...{" "}
                    </>
                  ) : (
                    <>
                      Continue <ChevronRight className="size-4" />{" "}
                    </>
                  )}{" "}
                </Button>{" "}
              </CardFooter>{" "}
            </form>{" "}
          </Card>
        )}{" "}
        {/* ==================================================

      STEP 2

      ================================================== */}{" "}
        {step === 2 && (
          <Card className="overflow-visible shadow-sm">
            {" "}
            <CardHeader className="border-b bg-muted/20 px-4 py-4 sm:px-6 sm:py-5">
              {" "}
              <div className="flex items-start gap-3">
                {" "}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="size-5 text-primary" />{" "}
                </div>{" "}
                <div className="space-y-1">
                  <CardTitle>Add project members</CardTitle>{" "}
                  <CardDescription>
                    Add people who should have access to this project.{" "}
                  </CardDescription>{" "}
                </div>{" "}
              </div>{" "}
            </CardHeader>{" "}
            <CardContent className="space-y-6 p-4 sm:space-y-8 sm:p-6">
              {" "}
              {/* ==========================================

         Member search

         ========================================== */}{" "}
              <div className="space-y-3">
                {" "}
                <div>
                  {" "}
                  <h3 className="text-sm font-medium">Add members</h3>{" "}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Search by name or email and select the people you want to
                    add.{" "}
                  </p>{" "}
                </div>{" "}
                <div className="relative">
                  {" "}
                  <div className="relative">
                    {" "}
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />{" "}
                    <Input
                      id="member-search"

                      value={memberInput}

                      onChange={(event) =>
                        handleMemberInputChange(event.target.value)
                      }

                      placeholder="Search by name or email..."

                      autoComplete="off"

                      className="h-11 pl-9 sm:h-10"

                      disabled={creatingMembers}
                    />{" "}
                  </div>{" "}
                  {/* ======================================

           Search dropdown

           ====================================== */}{" "}
                  {(memberInput.trim() || searchLoading) && (
                    <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-lg border bg-popover shadow-lg">
                      {" "}
                      {searchLoading ? (
                        <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                          {" "}
                          <Loader2 className="size-4 animate-spin" />
                          Searching users...{" "}
                        </div>
                      ) : memberSearchError ? (
                        <div className="flex items-start gap-2 px-4 py-3 text-sm text-destructive">
                          {" "}
                          <AlertCircle className="mt-0.5 size-4 shrink-0" />
                          <span>{memberSearchError}</span>{" "}
                        </div>
                      ) : availableSearchResults.length > 0 ? (
                        <div className="max-h-72 overflow-y-auto p-1">
                          {" "}
                          {availableSearchResults.map((user) => (
                            <button
                              key={user.id}

                              type="button"

                              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"

                              onClick={() => handleSelectMember(user)}
                            >
                              {" "}
                              <Avatar className="size-9">
                                {" "}
                                <AvatarFallback>
                                  {" "}
                                  {getUserInitials(user)}{" "}
                                </AvatarFallback>{" "}
                              </Avatar>{" "}
                              <div className="min-w-0 flex-1">
                                {" "}
                                <p className="truncate text-sm font-medium">
                                  {" "}
                                  {getUserName(user)}{" "}
                                </p>{" "}
                                <p className="truncate text-xs text-muted-foreground">
                                  {user.email}{" "}
                                </p>{" "}
                              </div>{" "}
                              <UserPlus className="size-4 shrink-0 text-muted-foreground" />{" "}
                            </button>
                          ))}{" "}
                        </div>
                      ) : (
                        <div className="px-4 py-6 text-center">
                          {" "}
                          <Users className="mx-auto mb-2 size-5 text-muted-foreground" />{" "}
                          <p className="text-sm font-medium">No users found</p>{" "}
                          <p className="mt-1 text-xs text-muted-foreground">
                            Try another name or email address.{" "}
                          </p>{" "}
                        </div>
                      )}{" "}
                    </div>
                  )}{" "}
                </div>{" "}
              </div>{" "}
              {/* ==========================================

         Selected members

         ========================================== */}{" "}
              <div className="space-y-3">
                {" "}
                <div className="flex items-center justify-between gap-4">
                  {" "}
                  <div>
                    {" "}
                    <h3 className="text-sm font-medium">
                      Selected members
                    </h3>{" "}
                    <p className="mt-1 text-xs text-muted-foreground">
                      People who will be added as project members.{" "}
                    </p>{" "}
                  </div>{" "}
                  <Badge variant={members.length > 0 ? "default" : "secondary"}>
                    {members.length}{" "}
                    {members.length === 1 ? "member" : "members"}{" "}
                  </Badge>{" "}
                </div>{" "}
                {members.length > 0 ? (
                  <div className="divide-y overflow-hidden rounded-xl border bg-card">
                    {" "}
                    {members.map(({ user }) => (
                      <div
                        key={user.id}

                        className="flex min-w-0 items-center justify-between gap-2 px-3 py-3 transition-colors hover:bg-muted/30 sm:gap-4 sm:px-4"
                      >
                        {" "}
                        <div className="flex min-w-0 items-center gap-3">
                          {" "}
                          <Avatar className="size-10">
                            {" "}
                            <AvatarFallback>
                              {" "}
                              {getUserInitials(user)}{" "}
                            </AvatarFallback>{" "}
                          </Avatar>{" "}
                          <div className="min-w-0">
                            {" "}
                            <p className="truncate text-sm font-medium">
                              {getUserName(user)}{" "}
                            </p>{" "}
                            <p className="truncate text-xs text-muted-foreground">
                              {user.email}{" "}
                            </p>{" "}
                          </div>{" "}
                        </div>{" "}
                        <Button
                          type="button"

                          variant="ghost"

                          size="sm"

                          className="shrink-0 text-muted-foreground hover:text-destructive"

                          onClick={() => handleRemoveMember(user.id)}

                          disabled={creatingMembers}
                        >
                          <X className="size-4" />{" "}
                          <span className="hidden sm:inline">Remove</span>{" "}
                        </Button>{" "}
                      </div>
                    ))}{" "}
                  </div>
                ) : (
                  <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center sm:min-h-52 sm:px-6">
                    {" "}
                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                      {" "}
                      <Users className="size-5 text-muted-foreground" />{" "}
                    </div>{" "}
                    <p className="text-sm font-medium">No members added yet</p>{" "}
                    <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                      You can skip this step and add members later from the
                      project details page.{" "}
                    </p>{" "}
                  </div>
                )}{" "}
              </div>{" "}
              {/* ==========================================

         Server error

         ========================================== */}{" "}
              {memberCreationError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Unable to finish setup</AlertTitle>{" "}
                  <AlertDescription>
                    {memberCreationError}
                  </AlertDescription>{" "}
                </Alert>
              )}{" "}
            </CardContent>{" "}
            {/* ============================================

        Footer

        ============================================ */}{" "}
            <CardFooter className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              {" "}
              <Button
                type="button"

                variant="ghost"

                className="gap-1"

                onClick={handleBack}

                disabled={creatingMembers}
              >
                <ChevronLeft className="size-4" />
                Back{" "}
              </Button>{" "}
              <div className="flex gap-2">
                {" "}
                <Button
                  type="button"

                  variant="outline"

                  onClick={() => navigate("/app/projects")}

                  disabled={creatingMembers}
                >
                  Cancel{" "}
                </Button>{" "}
                <Button
                  type="button"

                  onClick={handleCreate}

                  disabled={creatingMembers}
                >
                  {" "}
                  {creatingMembers ? (
                    <>
                      {" "}
                      <Loader2 className="size-4 animate-spin" />
                      Creating...{" "}
                    </>
                  ) : (
                    <>
                      Create project <Check className="size-4" />{" "}
                    </>
                  )}{" "}
                </Button>{" "}
              </div>{" "}
            </CardFooter>{" "}
          </Card>
        )}
    </PageContainer>
  )
}
