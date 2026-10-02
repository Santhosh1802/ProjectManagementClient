import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Cloud,
  Loader2,
} from "lucide-react";

import {
  Controller,
  useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import { userSchema } from "../schemas/user.schema";

import type { User } from "../types/user.types";

import { useEffect } from "react";

interface PersonalInfoProps {
  user: User;
}

type PersonalInfoForm = z.infer<
  typeof userSchema
>;

export default function PersonalInfo({
  user,
}: PersonalInfoProps) {
  const {
    control,
    reset,
    handleSubmit,
    formState: {
      isDirty,
      isSubmitting,
    },
  } = useForm<PersonalInfoForm>({
    resolver: zodResolver(userSchema),

    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  /*
   * Populate the form whenever Redux user changes.
   */
  useEffect(() => {
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  }, [user, reset]);

  async function onSubmit(
    data: PersonalInfoForm
  ) {
    console.log("Updating profile:", data);

    // TODO:
    // await updateUser(...)
    // dispatch(setUser(updatedUser))
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>
          Personal Information
        </CardTitle>

        <CardDescription>
          Update your basic workspace credentials.
          Your email address receives system alerts
          and deployment notifications.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          id="personal-info"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FieldGroup>
            {/* First + Last name */}

            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              "
            >
              <Controller
                name="firstName"
                control={control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <Field
                    data-invalid={
                      fieldState.invalid
                    }
                  >
                    <FieldLabel htmlFor="personal-info-first-name">
                      First Name
                    </FieldLabel>

                    <Input
                      {...field}
                      id="personal-info-first-name"
                      aria-invalid={
                        fieldState.invalid
                      }
                      placeholder="Santhosh"
                      autoComplete="given-name"
                    />

                    {fieldState.invalid && (
                      <FieldError
                        errors={[
                          fieldState.error,
                        ]}
                      />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="lastName"
                control={control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <Field
                    data-invalid={
                      fieldState.invalid
                    }
                  >
                    <FieldLabel htmlFor="personal-info-last-name">
                      Last Name
                    </FieldLabel>

                    <Input
                      {...field}
                      id="personal-info-last-name"
                      aria-invalid={
                        fieldState.invalid
                      }
                      placeholder="K"
                      autoComplete="family-name"
                    />

                    {fieldState.invalid && (
                      <FieldError
                        errors={[
                          fieldState.error,
                        ]}
                      />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Email */}

            <Controller
              name="email"
              control={control}
              render={({
                field,
                fieldState,
              }) => (
                <Field
                  data-invalid={
                    fieldState.invalid
                  }
                >
                  <FieldLabel htmlFor="personal-info-email">
                    Email
                  </FieldLabel>

                  <Input
                    {...field}
                    id="personal-info-email"
                    aria-invalid={
                      fieldState.invalid
                    }
                    placeholder="santhosh@email.com"
                    autoComplete="email"
                    type="email"
                  />

                  {fieldState.invalid && (
                    <FieldError
                      errors={[
                        fieldState.error,
                      ]}
                    />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      {/* Footer */}

      <CardFooter
        className="
          flex
          flex-col
          gap-3
          border-t
          bg-muted/40
          p-4

          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="flex items-center gap-2">
          <Cloud className="size-4 text-green-600" />

          <p className="text-xs text-muted-foreground">
            {isDirty
              ? "You have unsaved changes"
              : "All changes are synchronized"}
          </p>
        </div>

        <Button
          type="submit"
          form="personal-info"
          disabled={
            !isDirty || isSubmitting
          }
        >
          {isSubmitting && (
            <Loader2 className="size-4 animate-spin" />
          )}

          Save Profile
        </Button>
      </CardFooter>
    </Card>
  );
}