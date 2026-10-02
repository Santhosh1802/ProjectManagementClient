
import { useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
  CheckCircle2,
  CircleX,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
} from "lucide-react";
import { useAppSelector } from "@/hooks/redux-hooks";
import type { RootState } from "@/app/store";
import { updateUserPassword } from "../services/users.service";

const passwordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .regex(
        /[A-Z]/,
        "Password must contain at least one uppercase letter"
      )
      .regex(
        /\d/,
        "Password must contain at least one number"
      )
      .regex(
        /[@$!%*?&]/,
        "Password must contain at least one special symbol"
      ),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  )
  .refine(
    (data) => data.oldPassword !== data.newPassword,
    {
      message:
        "New password must be different from your current password",
      path: ["newPassword"],
    }
  );

type PasswordForm = z.infer<typeof passwordSchema>;

export default function PasswordChanger() {
    const userId = useAppSelector((state:RootState)=>state.auth.user?.id);
  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),

    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = useWatch({
    control,
    name: "newPassword",
  });

  const passwordRequirements = {
    minLength: newPassword?.length >= 8,
    uppercase: /[A-Z]/.test(newPassword ?? ""),
    number: /\d/.test(newPassword ?? ""),
    special: /[@$!%*?&]/.test(newPassword ?? ""),
  };

  async function onSubmit(data: PasswordForm) {
    try {
      console.log("Updating password:", data);

    
       
       await updateUserPassword({
          id: userId || "",
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
       })
       

      reset();

    } catch (error) {
      console.error("Failed to update password:", error);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div
            className="
              flex
              size-10
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-primary/10
              text-primary
            "
          >
            <KeyRound className="size-5" />
          </div>

          <div>
            <CardTitle>
              Change Password
            </CardTitle>

            <CardDescription className="mt-1">
              Update your account password. Make sure
              your new password is strong and unique.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form
          id="password-change"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FieldGroup>

            {/* Current Password */}

            <Controller
              name="oldPassword"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor="current-password">
                    Current Password
                  </FieldLabel>

                  <div className="relative">
                    <Input
                      {...field}
                      id="current-password"
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="••••••••"
                      autoComplete="current-password"
                      aria-invalid={
                        fieldState.invalid
                      }
                      className="pr-10"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="
                        absolute
                        right-2
                      "
                      onClick={() =>
                        setShowCurrentPassword(
                          (value) => !value
                        )
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
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

            {/* New Password */}

            <Controller
              name="newPassword"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor="new-password">
                    New Password
                  </FieldLabel>

                  <div className="relative">
                    <Input
                      {...field}
                      id="new-password"
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="••••••••"
                      autoComplete="new-password"
                      aria-invalid={
                        fieldState.invalid
                      }
                      className="pr-10"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="
                        absolute
                        right-2
                      "
                      onClick={() =>
                        setShowNewPassword(
                          (value) => !value
                        )
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
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

            {/* Password Requirements */}

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p
                  className="
                    mb-3
                    font-mono
                    text-xs
                    font-medium
                    text-muted-foreground
                  "
                >
                  PASSWORD REQUIREMENTS
                </p>

                <div className="grid gap-2 sm:grid-cols-2">

                  <PasswordRequirement
                    valid={
                      passwordRequirements.minLength
                    }
                    text="Minimum 8 characters"
                  />

                  <PasswordRequirement
                    valid={
                      passwordRequirements.uppercase
                    }
                    text="At least one uppercase letter"
                  />

                  <PasswordRequirement
                    valid={
                      passwordRequirements.number
                    }
                    text="At least one number"
                  />

                  <PasswordRequirement
                    valid={
                      passwordRequirements.special
                    }
                    text="At least one special symbol"
                  />

                </div>
              </CardContent>
            </Card>

            {/* Confirm Password */}

            <Controller
              name="confirmPassword"
              control={control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor="confirm-password">
                    Confirm New Password
                  </FieldLabel>

                  <div className="relative">
                    <Input
                      {...field}
                      id="confirm-password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="••••••••"
                      autoComplete="new-password"
                      aria-invalid={
                        fieldState.invalid
                      }
                      className="pr-10"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="
                        absolute
                        right-2
                      "
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value
                        )
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
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
        <p className="text-xs text-muted-foreground">
          You'll need to use your new password the next
          time you sign in.
        </p>

        <Button
          type="submit"
          form="password-change"
          disabled={formState.isSubmitting}
        >
          {formState.isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              Update Password
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}


/* -------------------------------------------------- */
/* Password Requirement */
/* -------------------------------------------------- */

interface PasswordRequirementProps {
  valid: boolean;
  text: string;
}

function PasswordRequirement({
  valid,
  text,
}: PasswordRequirementProps) {
  return (
    <div className="flex items-center gap-2">
      {valid ? (
        <CheckCircle2
          className="
            size-4
            shrink-0
            text-green-500
          "
        />
      ) : (
        <CircleX
          className="
            size-4
            shrink-0
            text-red-500
          "
        />
      )}

      <p className="text-xs text-muted-foreground">
        {text}
      </p>
    </div>
  );
}
