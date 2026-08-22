import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/common/utils/cn'
import { Skeleton } from './Skeleton'
import { EmptyState } from './EmptyState'

export interface DataTableColumn<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  sortable?: boolean
  className?: string
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  loading?: boolean
  emptyMessage?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (key: string) => void
  onRowClick?: (row: T) => void
  // Page-number pagination (offset-based) — used by every list in this app
  // except the Realms list / Package requests list, which use cursor mode below.
  page?: number
  limit?: number
  total?: number
  onPageChange?: (page: number) => void
  // Cursor ("load more") pagination — takes over the footer instead of the
  // page-number controls whenever `onLoadMore` is provided.
  hasMore?: boolean
  onLoadMore?: () => void
  loadingMore?: boolean
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  emptyMessage = 'No records found.',
  sortBy,
  sortOrder,
  onSort,
  page,
  limit,
  total,
  onPageChange,
  onRowClick,
  hasMore,
  onLoadMore,
  loadingMore,
}: DataTableProps<T>) {
  const isCursorMode = Boolean(onLoadMore)
  const pageCount = total !== undefined && limit ? Math.max(1, Math.ceil(total / limit)) : 1
  const from = !total || page === undefined || !limit ? 0 : page * limit + 1
  const to = !total || page === undefined || !limit ? 0 : Math.min(total, (page + 1) * limit)

  return (
    <div className="animate-fade-in overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-alt/50">
              {columns.map((col) => (
                <th key={col.key} className={cn('px-4 py-3 font-medium text-text-secondary', col.className)}>
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort?.(col.key)}
                      className="inline-flex items-center gap-1 hover:text-text"
                    >
                      {col.header}
                      {sortBy === col.key ? (
                        sortOrder === 'desc' ? (
                          <ChevronDown className="size-3.5 text-primary" />
                        ) : (
                          <ChevronUp className="size-3.5 text-primary" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3.5 text-text-secondary/50" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-32" />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading &&
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-b border-border last:border-0 hover:bg-surface-alt/40',
                    onRowClick && 'cursor-pointer',
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3 text-text', col.className)}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && (
          <div className="p-4">
            <EmptyState title={emptyMessage} />
          </div>
        )}
      </div>

      {!loading && isCursorMode && rows.length > 0 && (hasMore || loadingMore) && (
        <div className="flex items-center justify-center border-t border-border px-4 py-3">
          <button
            type="button"
            disabled={loadingMore}
            onClick={onLoadMore}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-surface-alt disabled:pointer-events-none disabled:opacity-50"
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {!loading && !isCursorMode && total !== undefined && total > 0 && page !== undefined && onPageChange && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-text-secondary">
          <span>
            Showing {from}-{to} of {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => onPageChange(page - 1)}
              className="rounded-lg p-1.5 transition-colors hover:bg-surface-alt disabled:pointer-events-none disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="px-2 text-text">
              {page + 1} / {pageCount}
            </span>
            <button
              type="button"
              disabled={page + 1 >= pageCount}
              onClick={() => onPageChange(page + 1)}
              className="rounded-lg p-1.5 transition-colors hover:bg-surface-alt disabled:pointer-events-none disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
