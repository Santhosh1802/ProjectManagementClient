import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

import {
  Check,
  Circle,
  Lock,
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
    `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`
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

        lg:flex-row
        lg:items-center
        lg:justify-between
      "
    >
      {/* User information */}

      <div className="flex items-center gap-4">
        <Avatar className="size-16 shrink-0">
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
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">
              {user.firstName} {user.lastName}
            </h2>

            <Badge variant="secondary">
              {user.userRole}
            </Badge>
          </div>

          <p className="truncate text-sm text-muted-foreground">
            {user.email}
          </p>

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

            <Badge
              variant="outline"
              className="gap-1"
            >
              <Lock className="size-3" />

              MFA Not Enforced
            </Badge>
          </div>
        </div>
      </div>

      {/* Account metadata */}

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
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Created
          </p>

          <p className="text-xs font-medium">
            {formatDateTime(user.createdAt)}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Last Login
          </p>

          <p className="text-xs font-medium">
            {formatDateTime(user.lastLoginAt)}
          </p>
        </div>
      </div>
    </div>
  );
}