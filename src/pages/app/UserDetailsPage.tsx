import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  Clock,
  Copy,
  Mail,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import EmptyState from "@/components/common/EmptyState"

// Replace these imports with the corresponding exports in your project.
import { getUserById } from "@/features/users/services/users.service"
import type { User } from "@/features/users/types/user.types"

function formatDate(value?: string | null) {
  if (!value) return "Not available"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "Not available"

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 py-3">
      {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}

      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-medium wrap-break-word">{value || "—"}</p>
      </div>
    </div>
  )
}

function UserDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 max-w-full" />
            <Skeleton className="h-5 w-20" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}

export default function UserDetailsPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      return
    }

    let cancelled = false

    async function loadUser() {
      try {
        setLoading(true)
        setError(null)

        const response = await getUserById({
          id: userId || "",
        })

        if (cancelled) return

        setUser(response)
      } catch (error) {
        if (cancelled) return

        console.error("Failed to load user:", error)

        setUser(null)
        setError("Unable to load user details. Please try again.")
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadUser()

    return () => {
      cancelled = true
    }
  }, [userId])
  if (!userId) {
    return (
      <PageContainer>
        <EmptyState
          title="User ID is missing"
          description="No user ID was provided in the URL."
          action={<Button onClick={() => navigate("/app/users")}>Return to users</Button>}
          icon={CircleUserRound}
        />
      </PageContainer>
    )
  }

  if (loading) {
    return (
      <PageContainer>
        <UserDetailsSkeleton />
      </PageContainer>
    )
  }

  const handleCopyId = async () => {
    if (!userId) return

    try {
      await navigator.clipboard.writeText(userId)
      toast.add({ type: "success", title: "User ID copied." })
    } catch {
      toast.add({ type: "error", title: "Unable to copy user ID." })
    }
  }



  if (error || !user) {
    return (
      <PageContainer className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/app/users")} className="-ml-3">
          <ArrowLeft className="mr-2 size-4" />
          Back to users
        </Button>

        <EmptyState
          title="Unable to display user"
          description={error ?? "The requested user could not be found."}
          action={<Button onClick={() => navigate("/app/users")}>Return to users</Button>}
          icon={CircleUserRound}
        />
      </PageContainer>
    )
  }

  // Adjust these property names to match your existing User type.
  const firstName = user.firstName ?? ""
  const lastName = user.lastName ?? ""
  const fullName = `${firstName} ${lastName}`.trim() || "Unnamed user"
  const email = user.email ?? "No email address"
  const role = user.userRole ?? "USER"
  const userStatus = user.isActive ?? "UNKNOWN"
  const isVerified = user.emailVerified === true
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U"

  return (
    <PageContainer className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link
          to="/app/users"
          className="transition-colors hover:text-foreground"
        >
          Users
        </Link>

        <span>/</span>

        <span className="text-foreground">User details</span>
      </div>

      <PageHeader
        title="User details"
        description="View account information and user status."
        actions={
          <Button
            variant="outline"
            size="icon"
            aria-label="Back to users"
            onClick={() => navigate("/app/users")}
          >
            <ArrowLeft className="size-4" />
          </Button>
        }
      />

      {/* User profile header */}
      <Card>
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full border bg-muted text-xl font-semibold">
            {initials}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="text-xl font-semibold wrap-break-word">
              {fullName}
            </h2>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4 shrink-0" />
              <span className="break-all">{email}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{role}</Badge>
              <Badge variant="outline">
                {userStatus ? "Active" : "In-Active"}
              </Badge>
            </div>
          </div>

          <Button variant="outline" onClick={handleCopyId}>
            <Copy className="mr-2 size-4" />
            Copy user ID
          </Button>
        </CardContent>
      </Card>

      {/* Information cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserRound className="size-5 text-muted-foreground" />
              <CardTitle>Personal information</CardTitle>
            </div>

            <CardDescription>
              Basic information associated with this account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-x-6 sm:grid-cols-2">
              <DetailItem label="First name" value={firstName} />
              <DetailItem label="Last name" value={lastName} />

              <DetailItem
                label="Email address"
                value={email}
                icon={<Mail className="size-4" />}
              />

              <DetailItem
                label="User role"
                value={role}
                icon={<ShieldCheck className="size-4" />}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-muted-foreground" />
              <CardTitle>Account information</CardTitle>
            </div>

            <CardDescription>
              Account identity, verification and timestamps.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <DetailItem
              label="User ID"
              value={userId ?? "Not available"}
              icon={<CircleUserRound className="size-4" />}
            />

            <Separator />

            <div className="flex items-start gap-3 py-3">
              {isVerified ? (
                <CheckCircle2 className="mt-0.5 size-4 text-muted-foreground" />
              ) : (
                <XCircle className="mt-0.5 size-4 text-muted-foreground" />
              )}

              <div className="flex-1 space-y-1">
                <p className="text-sm text-muted-foreground">
                  Email verification
                </p>
                <p className="text-sm font-medium">
                  {isVerified ? "Verified" : "Not verified"}
                </p>
              </div>
            </div>

            <Separator />

            <DetailItem
              label="Created at"
              value={formatDate(user.createdAt)}
              icon={<CalendarDays className="size-4" />}
            />

            <Separator />

            <DetailItem
              label="Last updated"
              value={formatDate(user.updatedAt)}
              icon={<Clock className="size-4" />}
            />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
