import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import React from "react"
import { Controller, useForm } from "react-hook-form"
import { userSchema } from "../schemas/user.schema"
import type { z } from "zod"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Cloud } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PersonalInfo() {
  const { formState, reset, handleSubmit, control,setValue } = useForm<
    z.infer<typeof userSchema>
  >({})
  async function onSubmit(data: z.infer<typeof userSchema>) {
    console.log(data)
  }
  return (
    <Card className="mt-2">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your basic workspace credentials. Your email address receives
          system alerts and deployment audits.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="personal-info" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="flex flex-row justify-center gap-2">
              <Controller
                name="firstName"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="personal-info-first-name">
                      First Name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="personal-info-first-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Santhosh"
                      className="text-xs"
                      autoComplete="firstName"
                      type="text"
                      value={field.value}
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
                    <FieldLabel htmlFor="personal-info-last-name">
                      Last Name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="personal-info-last-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="K"
                      className="text-xs"
                      autoComplete="lastName"
                      type="text"
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
                  <FieldLabel htmlFor="personal-info-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="personal-info-email"
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
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="h-full w-full bg-muted p-4 bottom-0">
        <div className="flex-1 flex flex-row gap-2 items-center">
          <Cloud color="green"/>
          <p>All modifications synchronized with cloud state</p>
        </div>
        <Button variant="default">Save Profile</Button>
      </CardFooter>
    </Card>
  )
}
