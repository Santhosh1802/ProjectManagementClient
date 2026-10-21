import { useState } from "react"
import { useNavigate } from "react-router-dom"


import { Button } from "@/components/ui/button"
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
import UserScopeTabs from "@/features/users/components/UserScopeTabs"
import UserTable from "@/features/users/components/UserTable"
import UserTableSkeleton from "@/features/users/components/UserTableSkeleton"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import ErrorState from "@/components/common/ErrorState"
import { Loader2, Plus, Trash2 } from "lucide-react"

const PAGE_SIZE = 10

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

  const [pendingDelete, setPendingDelete] = useState<User | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const searchParams: UserSearchRequest = {
    page,
    size: PAGE_SIZE,
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

  const handleStatusChange = (nextStatus: UserStatus) => {
    setStatus(nextStatus)
    resetPage()
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
  function getPaginationItems(
    totalPages: number,
    currentPage: number
  ): (number | "ellipsis")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index)
    }

    const pages = new Set<number>([
      0,
      totalPages - 1,
      currentPage,
      currentPage - 1,
      currentPage + 1,
    ])

    const visiblePages = [...pages]
      .filter((page) => page >= 0 && page < totalPages)
      .sort((a, b) => a - b)

    const result: (number | "ellipsis")[] = []

    visiblePages.forEach((page, index) => {
      if (index > 0 && page - visiblePages[index - 1] > 1) {
        result.push("ellipsis")
      }

      result.push(page)
    })

    return result
  }

  return (
    <PageContainer>
      <PageHeader 
        title="User management"
        description="Manage accounts, roles, and access."
        onRefresh={() => void refetch()}
        isRefreshing={isFetching}
        actions={
          <Button onClick={() => navigate("/app/users/create")}>
            <Plus className="mr-2 size-4" />
            Create user
          </Button>
        }
      />

      <UserScopeTabs
        value={status}
        onChange={handleStatusChange}
        counts={{
          all: totalElements,
        }}
      />



      <UserToolbar
        keyword={keyword}
        role={role}
        status={status}
        verification={verification}
        sortBy={sortBy}
        sortOrder={sortOrder}
        view={view}
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

        {actionError && (
          <p role="alert" className="text-sm text-destructive">
            {actionError}
          </p>
        )}
        {renderResults()}

        {!loading && !error && users.length > 0 && (
          <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {page * PAGE_SIZE + 1}–
              {Math.min((page + 1) * PAGE_SIZE, totalElements)} of{" "}
              {totalElements.toLocaleString("en-IN")} users
            </p>

            {totalPages > 1 && (
              <Pagination className="mx-0 w-auto justify-start sm:justify-end">
                <PaginationContent className="flex-wrap">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={page === 0}
                      tabIndex={page === 0 ? -1 : undefined}
                      className={
                        page === 0
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                      onClick={(event) => {
                        event.preventDefault()

                        if (page > 0) {
                          setPage((current) => current - 1)
                        }
                      }}
                    />
                  </PaginationItem>

                  {getPaginationItems(totalPages, page).map((item, index) => (
                    <PaginationItem key={`${item}-${index}`}>
                      {item === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          isActive={page === item}
                          aria-label={`Go to page ${item + 1}`}
                          aria-current={page === item ? "page" : undefined}
                          onClick={(event) => {
                            event.preventDefault()

                            if (page !== item) {
                              setPage(item)
                            }
                          }}
                        >
                          {item + 1}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={page >= totalPages - 1}
                      tabIndex={page >= totalPages - 1 ? -1 : undefined}
                      className={
                        page >= totalPages - 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                      onClick={(event) => {
                        event.preventDefault()

                        if (page < totalPages - 1) {
                          setPage((current) => current + 1)
                        }
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
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
