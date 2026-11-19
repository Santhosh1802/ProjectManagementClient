import { describe, it, expect, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"
import DataPagination, {
  getPaginationItems,
  useClientPagination,
} from "./DataPagination"

function ClientPaginationHarness({
  initialItems,
  initialPageSize = 3,
}: {
  initialItems: string[]
  initialPageSize?: number
}) {
  const [items, setItems] = useState(initialItems)
  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalElements,
    totalPages,
    paginatedItems,
  } = useClientPagination(items, initialPageSize)

  return (
    <div>
      <ul>
        {paginatedItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button type="button" onClick={() => setItems(items.slice(0, 2))}>
        Shrink Items
      </button>
      <DataPagination
        compact
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        pageSizeOptions={[3, 5, 10]}
        itemLabel="entries"
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  )
}

describe("DataPagination", () => {
  it("computes page items and ellipses accurately across small and large page counts", () => {
    expect(getPaginationItems(1, 0)).toEqual([0])
    expect(getPaginationItems(5, 2)).toEqual([0, 1, 2, 3, 4])
    expect(getPaginationItems(10, 0)).toEqual([0, 1, "ellipsis", 9])
    expect(getPaginationItems(10, 5)).toEqual([
      0,
      "ellipsis",
      4,
      5,
      6,
      "ellipsis",
      9,
    ])
    expect(getPaginationItems(10, 9)).toEqual([0, "ellipsis", 8, 9])
  })

  it("renders full pagination controls and invokes onPageChange accurately", () => {
    const onPageChange = vi.fn()
    const onPageSizeChange = vi.fn()

    render(
      <DataPagination
        page={1}
        totalPages={5}
        totalElements={45}
        pageSize={10}
        itemLabel="projects"
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    )

    expect(screen.getByText("11–20")).toBeInTheDocument()
    expect(screen.getByText("45")).toBeInTheDocument()
    expect(screen.getByText(/projects/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Go to first page" }))
    expect(onPageChange).toHaveBeenCalledWith(0)

    fireEvent.click(screen.getByRole("button", { name: "Go to page 4" }))
    expect(onPageChange).toHaveBeenCalledWith(3)

    fireEvent.click(screen.getByRole("button", { name: "Go to last page" }))
    expect(onPageChange).toHaveBeenCalledWith(4)

    fireEvent.click(screen.getByRole("button", { name: "Go to previous page" }))
    expect(onPageChange).toHaveBeenCalledWith(0)

    fireEvent.click(screen.getByRole("button", { name: "Go to next page" }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it("disables boundary controls cleanly on first page, last page, and disabled state", () => {
    const onPageChange = vi.fn()

    const { rerender } = render(
      <DataPagination
        page={0}
        totalPages={3}
        totalElements={25}
        pageSize={10}
        onPageChange={onPageChange}
      />
    )

    expect(screen.getByRole("button", { name: "Go to first page" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Go to last page" })).not.toBeDisabled()

    rerender(
      <DataPagination
        page={2}
        totalPages={3}
        totalElements={25}
        pageSize={10}
        onPageChange={onPageChange}
      />
    )
    expect(screen.getByRole("button", { name: "Go to last page" })).toBeDisabled()

    rerender(
      <DataPagination
        page={1}
        totalPages={3}
        totalElements={25}
        pageSize={10}
        disabled={true}
        onPageChange={onPageChange}
      />
    )
    expect(screen.getByRole("button", { name: "Go to first page" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Go to last page" })).toBeDisabled()
  })

  it("returns null when totalElements is 0 and renders compact mode cleanly", () => {
    const { container, rerender } = render(
      <DataPagination
        page={0}
        totalPages={1}
        totalElements={0}
        pageSize={10}
        onPageChange={vi.fn()}
      />
    )
    expect(container.firstChild).toBeNull()

    rerender(
      <DataPagination
        compact
        page={0}
        totalPages={1}
        totalElements={3}
        pageSize={5}
        onPageChange={vi.fn()}
      />
    )
    expect(container.firstChild).toBeNull()

    const onPageChange = vi.fn()
    rerender(
      <DataPagination
        compact
        page={0}
        totalPages={3}
        totalElements={14}
        pageSize={5}
        itemLabel="files"
        onPageChange={onPageChange}
      />
    )

    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Next/i }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it("useClientPagination slices items and automatically clamps page when items shrink", () => {
    render(
      <ClientPaginationHarness
        initialItems={["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6", "Item 7"]}
        initialPageSize={3}
      />
    )

    expect(screen.getByText("Item 1")).toBeInTheDocument()
    expect(screen.queryByText("Item 4")).not.toBeInTheDocument()

    // Jump to last page (page 3 -> Item 7)
    fireEvent.click(screen.getByRole("button", { name: "Last page" }))
    expect(screen.getByText("Item 7")).toBeInTheDocument()
    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument()

    // Shrink list to 2 items -> clamps back to page 1 safely
    fireEvent.click(screen.getByRole("button", { name: "Shrink Items" }))
    expect(screen.getByText("Item 1")).toBeInTheDocument()
    expect(screen.getByText("Item 2")).toBeInTheDocument()
  })

  it("supports [ and ] keyboard page navigation in full mode and ignores inputs/compact mode", () => {
    const onPageChange = vi.fn()

    const { rerender } = render(
      <div>
        <input aria-label="Filter input" />
        <DataPagination
          page={1}
          totalPages={4}
          totalElements={40}
          pageSize={10}
          itemLabel="tasks"
          onPageChange={onPageChange}
        />
      </div>
    )

    // Visible [ and ] keycaps rendered in full mode
    expect(screen.getByText("[")).toBeInTheDocument()
    expect(screen.getByText("]")).toBeInTheDocument()

    // ] moves to next page (2), [ moves to previous page (0)
    fireEvent.keyDown(document, { key: "]" })
    expect(onPageChange).toHaveBeenCalledWith(2)

    fireEvent.keyDown(document, { key: "[" })
    expect(onPageChange).toHaveBeenCalledWith(0)

    // Ignored inside editable input
    onPageChange.mockClear()
    const input = screen.getByLabelText("Filter input")
    input.focus()
    fireEvent.keyDown(input, { key: "]" })
    expect(onPageChange).not.toHaveBeenCalled()

    // Ignored in compact mode by default
    rerender(
      <DataPagination
        compact
        page={1}
        totalPages={4}
        totalElements={40}
        pageSize={10}
        itemLabel="tasks"
        onPageChange={onPageChange}
      />
    )
    fireEvent.keyDown(document, { key: "]" })
    expect(onPageChange).not.toHaveBeenCalled()
  })
})
