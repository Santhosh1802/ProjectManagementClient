import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"


import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  deleteUser,
  searchUsers,
} from "@/features/users/services/users.service"
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
import UserFilters from "@/features/users/components/UserFilters"
import UserList from "@/features/users/components/UserList"
import UserListSkeleton from "@/features/users/components/UserListSkeleton"
import UserScopeTabs from "@/features/users/components/UserScopeTabs"
import UserTable from "@/features/users/components/UserTable"
import UserTableSkeleton from "@/features/users/components/UserTableSkeleton"
import UserViewSwitcher from "@/features/users/components/UserViewSwitcher"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"
import ErrorState from "@/components/common/ErrorState"
import { Plus } from "lucide-react"

const PAGE_SIZE = 10

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const navigate = useNavigate()

  const [keyword, setKeyword] = useState("")
  const [role, setRole] = useState<UserRole | "all">("all")
  const [status, setStatus] = useState<UserStatus>("all")
  const [verification, setVerification] = useState<VerificationStatus>("all")
  const [sortBy, setSortBy] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [view, setView] = useState<UserView>("table")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const loadUsers = useCallback(
    async (signal: { cancelled: boolean }) => {
      setLoading(true)
      setError(null)

      const params: UserSearchRequest = {
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

      try {
        const response = await searchUsers(params)
        if (signal.cancelled) return
        setUsers(response.content)
        setTotalPages(response.totalPages)
        setTotalElements(response.totalElements)
      } catch (err) {
        if (signal.cancelled) return
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load users. Please try again."
        )
      } finally {
        if (!signal.cancelled) setLoading(false)
      }
    },
    [page, keyword, role, status, verification, sortBy, sortOrder]
  )

  useEffect(() => {
    const signal = { cancelled: false }
    const timeout = window.setTimeout(() => void loadUsers(signal), 250)
    return () => {
      signal.cancelled = true
      window.clearTimeout(timeout)
    }
  }, [loadUsers, reloadKey])

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

  const activeCount = useMemo(
    () => users.filter((user) => user.isActive).length,
    [users]
  )
 
  const inactiveCount = users.length - activeCount

  const handleDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    setActionError(null)

    try {
      await deleteUser({ id: pendingDelete.id })
      setPendingDelete(null)
      if (users.length === 1 && page > 0) {
        setPage((current) => current - 1)
      } else {
        setReloadKey((current) => current + 1)
      }
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Could not delete this user. Please try again."
      )
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = (nextStatus: UserStatus) => {
    setStatus(nextStatus)
    resetPage()
  }

  const handleSortByChange = (nextSort: SortField) => {
    setSortBy(nextSort)
    resetPage()
  }

  const handleSortOrderChange = (nextOrder: "asc" | "desc") => {
    setSortOrder(nextOrder)
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
          retryAction={() => setReloadKey((key) => key + 1)}
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
          active: activeCount,
          inactive: inactiveCount,
        }}
      />



        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <UserFilters
              keyword={keyword}
              role={role}
              status={status}
              verification={verification}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onKeywordChange={(value) => {
                setKeyword(value)
                resetPage()
              }}
              onRoleChange={(value) => {
                setRole(value)
                resetPage()
              }}
              onStatusChange={handleStatusChange}
              onVerificationChange={(value) => {
                setVerification(value)
                resetPage()
              }}
              onSortByChange={handleSortByChange}
              onSortOrderChange={handleSortOrderChange}
              onReset={resetFilters}
            />
          </div>
          <div className="flex justify-end">
            <UserViewSwitcher value={view} onChange={setView} />
          </div>
        </div>

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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {pendingDelete?.firstName}{" "}
              {pendingDelete?.lastName} and remove their account from the
              workspace. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && (
            <p role="alert" className="text-sm text-destructive">
              {actionError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                void handleDelete()
              }}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete user"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
