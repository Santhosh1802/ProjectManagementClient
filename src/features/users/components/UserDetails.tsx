import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge";

import {
  Check,
  Circle,
  FolderKanban,
  ListTodo,
  Lock,
  Users,
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

  /*
   * Temporary static values.
   *
   * Later replace these with values coming
   * from the backend.
   */
  const statistics = {
    ownedProjects: 4,
    projectMemberships: 2,
    tasksCreated: 18,
  };

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
      {/* ----------------------------------------- */}
      {/* User Information */}
      {/* ----------------------------------------- */}

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

        {/* --------------------------------------- */}
        {/* Account Metadata */}
        {/* --------------------------------------- */}

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

      {/* ----------------------------------------- */}
      {/* User Statistics */}
      {/* ----------------------------------------- */}

      <div
        className="
          grid
          grid-cols-1
          gap-3

          sm:grid-cols-3
        "
      >
        {/* Owned Projects */}

        <Statistic
          icon={FolderKanban}
          label="Owned Projects"
          value={statistics.ownedProjects}
        />

        {/* Project Memberships */}

        <Statistic
          icon={Users}
          label="Project Memberships"
          value={statistics.projectMemberships}
        />

        {/* Created Tasks */}

        <Statistic
          icon={ListTodo}
          label="Tasks Created"
          value={statistics.tasksCreated}
        />
      </div>
    </div>
  );
}

/* --------------------------------------------- */
/* Statistic Component */
/* --------------------------------------------- */

interface StatisticProps {
  icon: React.ElementType;
  label: string;
  value: number;
}

function Statistic({
  icon: Icon,
  label,
  value,
}: StatisticProps) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-lg
        border
        bg-muted/30
        px-4
        py-3
        transition-colors
        hover:bg-muted/50
      "
    >
      <div
        className="
          flex
          size-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-primary/10
          text-primary
        "
      >
        <Icon className="size-4" />
      </div>

      <div className="min-w-0">
        <p className="text-lg font-semibold leading-none">
          {value}
        </p>

        <p className="mt-1 truncate text-[11px] text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}