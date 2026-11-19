import { useEffect, useMemo, useRef, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import PageSizeSelector from "@/components/common/PageSizeSelector"
import {
  hasAnyModifier,
  isEditableTarget,
  isOverlayOpen,
} from "@/lib/keyboard"
import { cn } from "@/lib/utils"

export function getPaginationItems(
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
    .filter((p) => p >= 0 && p < totalPages)
    .sort((a, b) => a - b)

  const result: (number | "ellipsis")[] = []

  visiblePages.forEach((p, index) => {
    if (index > 0 && p - visiblePages[index - 1] > 1) {
      result.push("ellipsis")
    }
    result.push(p)
  })

  return result
}

export interface DataPaginationProps {
  /** 0-indexed current page */
  page: number
  /** Total number of pages */
  totalPages: number
  /** Total number of items across all pages */
  totalElements: number
  /** Number of items per page */
  pageSize: number
  /** Callback when page changes (0-indexed) */
  onPageChange: (nextPage: number) => void
  /** Optional callback when page size changes */
  onPageSizeChange?: (nextSize: number) => void
  /** Page size options (defaults to [10, 20, 50, 100]) */
  pageSizeOptions?: number[]
  /** Plural label for items, e.g. "projects", "tasks", "members" */
  itemLabel?: string
  /** Compact mode for cards, dialogs, and embedded sections */
  compact?: boolean
  /** Disable navigation while loading */
  disabled?: boolean
  /** Enable `[` and `]` keyboard page navigation (defaults to `!compact`) */
  enableKeyboardShortcuts?: boolean
  /** Additional container class names */
  className?: string
}

export function DataPagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  itemLabel = "items",
  compact = false,
  disabled = false,
  enableKeyboardShortcuts = !compact,
  className,
}: DataPaginationProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const safeTotalPages = Math.max(1, totalPages)
  const safePage = Math.min(Math.max(0, page), safeTotalPages - 1)
  const safeSize = Math.max(1, pageSize)

  const startItem = totalElements === 0 ? 0 : safePage * safeSize + 1
  const endItem =
    totalElements === 0
      ? 0
      : Math.min((safePage + 1) * safeSize, totalElements)

  const isFirst = safePage <= 0 || disabled
  const isLast = safePage >= safeTotalPages - 1 || disabled

  useEffect(() => {
    if (
      !enableKeyboardShortcuts ||
      safeTotalPages <= 1 ||
      disabled ||
      totalElements <= 0
    ) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.repeat ||
        hasAnyModifier(event) ||
        isEditableTarget(event.target) ||
        isOverlayOpen()
      ) {
        return
      }

      const container = containerRef.current
      if (
        !container ||
        container.closest("[hidden], [data-hidden], [data-state='inactive']")
      ) {
        return
      }

      if (event.key === "[" && !isFirst) {
        event.preventDefault()
        onPageChange(Math.max(0, safePage - 1))
      } else if (event.key === "]" && !isLast) {
        event.preventDefault()
        onPageChange(Math.min(safeTotalPages - 1, safePage + 1))
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [
    enableKeyboardShortcuts,
    safeTotalPages,
    disabled,
    totalElements,
    isFirst,
    isLast,
    safePage,
    onPageChange,
  ])

  if (totalElements <= 0 && totalPages <= 1) {
    return null
  }

  if (compact) {
    if (totalElements <= safeSize && safeTotalPages <= 1 && !onPageSizeChange) {
      return null
    }

    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground",
          className
        )}
      >
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          <span className="truncate">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {startItem}–{endItem}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {totalElements.toLocaleString("en-IN")}
            </span>{" "}
            {itemLabel}
          </span>

          {onPageSizeChange && (
            <PageSizeSelector
              value={safeSize}
              onChange={(nextSize) => {
                onPageSizeChange(nextSize)
              }}
              options={pageSizeOptions}
            />
          )}
        </div>

        {safeTotalPages > 1 && (
          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              disabled={isFirst}
              onClick={() => onPageChange(0)}
              aria-label="First page"
              title="First page"
              className="hidden sm:inline-flex"
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              disabled={isFirst}
              onClick={() => onPageChange(Math.max(0, safePage - 1))}
              className="h-7 gap-1 px-2 text-xs"
            >
              <ChevronLeft className="size-3.5" />
              <span>Previous</span>
            </Button>

            <span className="px-2 font-mono text-[11px] font-medium text-foreground">
              Page {safePage + 1} of {safeTotalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="xs"
              disabled={isLast}
              onClick={() =>
                onPageChange(Math.min(safeTotalPages - 1, safePage + 1))
              }
              className="h-7 gap-1 px-2 text-xs"
            >
              <span>Next</span>
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              disabled={isLast}
              onClick={() => onPageChange(safeTotalPages - 1)}
              aria-label="Last page"
              title="Last page"
              className="hidden sm:inline-flex"
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  const paginationItems = getPaginationItems(safeTotalPages, safePage)

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col gap-3 border-t border-border/80 pt-4 sm:flex-row sm:items-center sm:justify-between min-w-0",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3 min-w-0">
        <p className="text-xs sm:text-sm text-muted-foreground truncate">
          Showing{" "}
          <span className="font-medium text-foreground">
            {startItem}–{endItem}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {totalElements.toLocaleString("en-IN")}
          </span>{" "}
          {itemLabel}
        </p>

        {onPageSizeChange && (
          <PageSizeSelector
            value={safeSize}
            onChange={(nextSize) => {
              onPageSizeChange(nextSize)
            }}
            options={pageSizeOptions}
          />
        )}
      </div>

      {safeTotalPages > 1 && (
        <Pagination className="mx-0 w-auto justify-between sm:justify-end">
          <PaginationContent className="flex-wrap gap-1">
            <PaginationItem className="hidden md:inline-flex">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isFirst}
                onClick={() => onPageChange(0)}
                aria-label="Go to first page"
                title="First page"
                className="size-8"
              >
                <ChevronsLeft className="size-4" />
              </Button>
            </PaginationItem>

            <PaginationItem className="flex items-center gap-1">
              <PaginationPrevious
                href="#"
                aria-disabled={isFirst}
                aria-keyshortcuts="["
                title="Previous page ([)"
                tabIndex={isFirst ? -1 : undefined}
                className={
                  isFirst ? "pointer-events-none opacity-50" : "cursor-pointer"
                }
                onClick={(event) => {
                  event.preventDefault()
                  if (!isFirst) {
                    onPageChange(Math.max(0, safePage - 1))
                  }
                }}
              />
              {enableKeyboardShortcuts && (
                <Kbd
                  aria-hidden="true"
                  className="hidden lg:inline-flex h-4 min-w-4 px-1 text-[9px]"
                >
                  [
                </Kbd>
              )}
            </PaginationItem>

            {/* Mobile compact indicator */}
            <PaginationItem className="sm:hidden">
              <span className="inline-flex h-8 items-center px-2.5 text-xs font-medium text-muted-foreground">
                Page {safePage + 1} / {safeTotalPages}
              </span>
            </PaginationItem>

            {/* Desktop/tablet numbered page buttons */}
            {paginationItems.map((item, index) => (
              <PaginationItem
                key={`${item}-${index}`}
                className="hidden sm:inline-flex"
              >
                {item === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    isActive={safePage === item}
                    aria-label={`Go to page ${item + 1}`}
                    aria-current={safePage === item ? "page" : undefined}
                    onClick={(event) => {
                      event.preventDefault()
                      if (!disabled && safePage !== item) {
                        onPageChange(item)
                      }
                    }}
                  >
                    {item + 1}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem className="flex items-center gap-1">
              {enableKeyboardShortcuts && (
                <Kbd
                  aria-hidden="true"
                  className="hidden lg:inline-flex h-4 min-w-4 px-1 text-[9px]"
                >
                  ]
                </Kbd>
              )}
              <PaginationNext
                href="#"
                aria-disabled={isLast}
                aria-keyshortcuts="]"
                title="Next page (])"
                tabIndex={isLast ? -1 : undefined}
                className={
                  isLast ? "pointer-events-none opacity-50" : "cursor-pointer"
                }
                onClick={(event) => {
                  event.preventDefault()
                  if (!isLast) {
                    onPageChange(Math.min(safeTotalPages - 1, safePage + 1))
                  }
                }}
              />
            </PaginationItem>

            <PaginationItem className="hidden md:inline-flex">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isLast}
                onClick={() => onPageChange(safeTotalPages - 1)}
                aria-label="Go to last page"
                title="Last page"
                className="size-8"
              >
                <ChevronsRight className="size-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

/**
 * Reusable client-side pagination hook for arrays.
 * Automatically clamps the current page if the underlying list shrinks (e.g., due to filtering or deletion).
 */
export function useClientPagination<T>(
  items: readonly T[],
  initialPageSize = 10
) {
  const [rawPage, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const totalElements = items.length
  const totalPages = Math.max(1, Math.ceil(totalElements / Math.max(1, pageSize)))
  const page = Math.min(Math.max(0, rawPage), totalPages - 1)

  const paginatedItems = useMemo(() => {
    const start = page * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  const handlePageSizeChange = (nextSize: number) => {
    setPageSize(nextSize)
    setPage(0)
  }

  return {
    page,
    setPage,
    pageSize,
    setPageSize: handlePageSizeChange,
    totalElements,
    totalPages,
    paginatedItems,
  }
}

export default DataPagination
