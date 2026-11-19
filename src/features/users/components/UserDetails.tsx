import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

import {
  Check,
  Circle,
  Lock,
  ShieldCheck,
} from "lucide-react";

import { formatDateTime } from "@/lib/dateConverter";

import type { User } from "../types/user.types";

interface UserDetailsProps {
  user: User;
}

export default function UserDetails({
  user,
}: UserDetailsProps) {
  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`
      .toUpperCase();

  return (
    <div
      className="
        flex
        w-full
        flex-col
        gap-6
        rounded-xl
        border
        bg-card
        p-5
        shadow-sm
      "
    >
      <div
        className="
          flex
          flex-col
          gap-6
          lg:flex-row
          lg:items-start
          lg:justify-between
        "
      >
        {/* User */}
        <div className="flex min-w-0 items-center gap-4">
          <Avatar className="size-16 shrink-0 border-2 border-primary/25">
            {user.avatarUrl && (
              <AvatarImage
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName ?? ""}`.trim()}
              />
            )}
            <AvatarFallback
              className="
                bg-primary/10
                text-lg
                font-semibold
                text-primary
              "
            >
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-col gap-2">
            {/* Name + Role */}
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">
                {user.firstName} {user.lastName}
              </h2>

              <Badge variant="secondary">
                {user.userRole}
              </Badge>
            </div>

            {/* Email */}
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>

            {/* Status */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={
                  user.isActive
                    ? "default"
                    : "destructive"
                }
                className="gap-1"
              >
                <Circle className="size-2 fill-current" />

                {user.isActive
                  ? "Active Account"
                  : "Inactive Account"}
              </Badge>

              <Badge
                variant={
                  user.emailVerified
                    ? "default"
                    : "destructive"
                }
                className="gap-1"
              >
                <Check className="size-3" />

                {user.emailVerified
                  ? "Verified"
                  : "Unverified"}
              </Badge>

              {user.mfaEnabled ? (
                <Badge
                  variant="default"
                  className="gap-1 bg-emerald-600 text-white hover:bg-emerald-600/90"
                >
                  <ShieldCheck className="size-3" />
                  MFA Enabled
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="gap-1"
                >
                  <Lock className="size-3" />
                  MFA Not Enabled
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Account Metadata */}
        <div
          className="
            flex
            flex-row
            gap-6
            border-t
            pt-4
            lg:border-t-0
            lg:pt-0
            lg:text-right
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-wider
                text-muted-foreground
              "
            >
              Created
            </p>

            <p className="text-xs font-medium">
              {formatDateTime(user.createdAt)}
            </p>
          </div>

          <div>
            <p
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-wider
                text-muted-foreground
              "
            >
              Last Login
            </p>

            <p className="text-xs font-medium">
              {formatDateTime(user.lastLoginAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
