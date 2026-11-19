import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import UsersPage from "./UsersPage"
import * as usersQueryHooks from "@/features/users/hooks/useUsersQuery"
import { renderWithProviders } from "@/test/testUtils"
import type { User } from "@/features/users/types/user.types"

vi.mock("@/features/users/hooks/useUsersQuery", () => ({
  useUsersQuery: vi.fn(),
  useDeleteUserMutation: vi.fn(),
}))

const sampleUsers: User[] = [
  {
    id: "u-1",
    firstName: "Alice",
    lastName: "Admin",
    email: "alice@example.com",
    userRole: "ADMIN",
    isActive: true,
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: null,
  },
  {
    id: "u-2",
    firstName: "Bob",
    lastName: "Developer",
    email: "bob@example.com",
    userRole: "USER",
    isActive: true,
    emailVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: null,
  },
]

describe("UsersPage Directory, Views, Pagination & Deletion", () => {
  const deleteMutateAsync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usersQueryHooks.useUsersQuery).mockReturnValue({
      data: {
        content: sampleUsers,
        page: 0,
        size: 10,
        totalElements: 22,
        totalPages: 3,
        first: true,
        last: false,
      },
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof usersQueryHooks.useUsersQuery>)

    vi.mocked(usersQueryHooks.useDeleteUserMutation).mockReturnValue({
      mutateAsync: deleteMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof usersQueryHooks.useDeleteUserMutation>)
  })

  it("renders table/card/list views, keyword filter, and DataPagination controls", async () => {
    renderWithProviders(<UsersPage />)

    expect(screen.getByText("User management")).toBeInTheDocument()
    expect(screen.getByText("Alice Admin")).toBeInTheDocument()
    expect(screen.getByText("Bob Developer")).toBeInTheDocument()
    expect(screen.getByText("1–10")).toBeInTheDocument()

    // Switch to Card view
    fireEvent.click(screen.getByRole("button", { name: "Card view" }))
    expect(screen.queryByRole("table")).not.toBeInTheDocument()
    expect(screen.getByText("Alice Admin")).toBeInTheDocument()

    // Switch back to Table view
    fireEvent.click(screen.getByRole("button", { name: "Table view" }))
    expect(screen.getByRole("table")).toBeInTheDocument()

    // Click Page 2 in DataPagination triggers query with page = 1
    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }))
    await waitFor(() => {
      expect(usersQueryHooks.useUsersQuery).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1 })
      )
    })

    // Type keyword filter -> resets page back to 0
    fireEvent.change(screen.getByPlaceholderText(/Search/i), {
      target: { value: "bob" },
    })
    await waitFor(() => {
      expect(usersQueryHooks.useUsersQuery).toHaveBeenLastCalledWith(
        expect.objectContaining({ keyword: "bob", page: 0 })
      )
    })
  })
})
