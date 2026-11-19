import { useState } from "react"
import { useNavigate } from "react-router-dom"


import { Button } from "@/components/ui/button"
import ShortcutHint from "@/components/common/ShortcutHint"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  useDeleteUserMutation,
  useUsersQuery,
} from "@/features/users/hooks/useUsersQuery"
import type {
  SortField,
  User,
  UserRole,
  UserSearchRequest,
  UserStatus,
  UserView,
  VerificationStatus,
} from "@/features/users/types/user.types"
import UserCard from "@/features/users/components/UserCard"
import UserCardSkeleton from "@/features/users/components/UserCardSkeleton"
import UserEmptyState from "@/features/users/components/UserEmptyState"
import UserToolbar from "@/features/users/components/UserToolbar"
import UserList from "@/features/users/components/UserList"
import UserListSkeleton from "@/features/users/components/UserListSkeleton"
import UserTable from "@/features/users/components/UserTable"
import UserTableSkeleton from "@/features/users/components/UserTableSkeleton"
import DataPagination from "@/components/common/DataPagination"
import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import ErrorState from "@/components/common/ErrorState"
import { Loader2, Plus, Trash2 } from "lucide-react"

export default function UsersPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState("")
  const [role, setRole] = useState<UserRole | "all">("all")
  const [status, setStatus] = useState<UserStatus>("all")
  const [verification, setVerification] = useState<VerificationStatus>("all")
  const [sortBy, setSortBy] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [view, setView] = useState<UserView>("table")
  const [pageSize, setPageSize] = useState(10)

  const [pendingDelete, setPendingDelete] = useState<User | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const searchParams: UserSearchRequest = {
    page,
    size: pageSize,
    keyword: keyword.trim() || undefined,
    role: role === "all" ? undefined : role,
    isActive: status === "all" ? undefined : status === "active",
    emailVerified:
      verification === "all" ? undefined : verification === "verified",
    sortBy,
    sortOrder,
  }

  const {
    data: usersResponse,
    isLoading: loading,
    isFetching,
    error: usersError,
    refetch,
  } = useUsersQuery(searchParams)

  const deleteMutation = useDeleteUserMutation()
  const deleting = deleteMutation.isPending

  const users = usersResponse?.content ?? []
  const totalPages = usersResponse?.totalPages ?? 0
  const totalElements = usersResponse?.totalElements ?? 0
  const error = usersError
    ? usersError instanceof Error
      ? usersError.message
      : "Unable to load users. Please try again."
    : null

  const resetPage = () => setPage(0)

  const resetFilters = () => {
    setKeyword("")
    setRole("all")
    setStatus("all")
    setVerification("all")
    setSortBy("createdAt")
    setSortOrder("desc")
    setPage(0)
  }

  const hasFilters =
    keyword.trim() !== "" ||
    role !== "all" ||
    status !== "all" ||
    verification !== "all"



  const handleDelete = async () => {
    if (!pendingDelete) return
    setActionError(null)

    try {
      await deleteMutation.mutateAsync({ id: pendingDelete.id })
      setPendingDelete(null)
      if (users.length === 1 && page > 0) {
        setPage((current) => current - 1)
      }
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Could not delete this user. Please try again."
      )
    }
  }

  const renderResults = () => {
    if (loading) {
      if (view === "card") return <UserCardSkeleton />
      if (view === "list") return <UserListSkeleton />
      return <UserTableSkeleton />
    }

    if (error) {
      return (
        <ErrorState 
          title="Unable to load users"
          description={error}
          retryAction={() => void refetch()}
        />
      )
    }

    if (users.length === 0) {
      return (
        <UserEmptyState
          hasFilters={hasFilters}
          onReset={resetFilters}
          onCreate={() => navigate("/app/users/create")}
        />
      )
    }

    if (view === "card") {
      return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )
    }

    if (view === "list") return <UserList users={users} />

    return <UserTable users={users} onDelete={setPendingDelete} />
  }

  return (
    <PageContainer>
      <PageHeader 
        title="User management"
        description="Manage accounts, roles, and access."
        onRefresh={() => void refetch()}
        isRefreshing={isFetching}
        actions={
          <Button onClick={() => navigate("/app/users/create")} className="gap-2">
            <Plus className="size-4" />
            <span>Create user</span>
            <ShortcutHint
              keys={["c", "u"]}
              sequence
              compact
              decorative
              variant="onPrimary"
              className="hidden sm:inline-flex ml-1"
            />
          </Button>
        }
      />

      <UserToolbar
        keyword={keyword}
        role={role}
        status={status}
        verification={verification}
        sortBy={sortBy}
        sortOrder={sortOrder}
        view={view}
        pageSize={pageSize}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize)
          resetPage()
        }}
        onKeywordChange={(value) => {
          setKeyword(value)
          resetPage()
        }}
        onApplyFilters={(appliedFilters) => {
          setRole(appliedFilters.role)
          setStatus(appliedFilters.status)
          setVerification(appliedFilters.verification)
          resetPage()
        }}
        onApplySort={(appliedSort) => {
          setSortBy(appliedSort.sortBy)
          setSortOrder(appliedSort.sortOrder)
          resetPage()
        }}
        onViewChange={setView}
      />

      {/* Showing counter matching ProjectPage / TaskPage */}
      {!loading && !error && users.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{users.length}</span> of{" "}
          <span className="font-medium text-foreground">{totalElements}</span> users
        </div>
      )}

        {actionError && (
          <p role="alert" className="text-sm text-destructive">
            {actionError}
          </p>
        )}
        {renderResults()}

        {!loading && !error && users.length > 0 && (
          <DataPagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            itemLabel="users"
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize)
              resetPage()
            }}
          />
        )}
      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && !deleting && setPendingDelete(null)}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5 shrink-0" />
              <AlertDialogTitle>Delete User</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left pt-1.5 text-sm">
              This will permanently delete{" "}
              <span className="font-semibold text-foreground">
                {pendingDelete?.firstName} {pendingDelete?.lastName}
              </span>{" "}
              and remove their account from the workspace. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && (
            <p role="alert" className="text-sm text-destructive">
              {actionError}
            </p>
          )}
          <AlertDialogFooter className="gap-3 pt-3 border-t">
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={(event) => {
                event.preventDefault()
                void handleDelete()
              }}
              disabled={deleting}
              className="gap-2"
            >
              {deleting && <Loader2 className="size-4 animate-spin" />}
              {deleting ? "Deleting…" : "Delete User"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
