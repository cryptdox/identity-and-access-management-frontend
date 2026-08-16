import { useCallback, useMemo, useState } from 'react'
import type { ListQueryParams } from '@/api/types/common.types'

export interface PaginationState {
  offset: number
  limit: number
  search: string
  sortBy?: string
  sortOrder: 'asc' | 'desc'
}

const DEFAULT_LIMIT = 20

/** Shared list-page state: every module's list endpoint takes the same
 * offset/limit/search/sortBy/sortOrder params (common.dto.ts's PaginationRequestDto),
 * so one hook covers all ~17 list pages. */
export function usePagination(initial?: Partial<PaginationState>) {
  const [state, setState] = useState<PaginationState>({
    offset: 0,
    limit: DEFAULT_LIMIT,
    search: '',
    sortOrder: 'asc',
    ...initial,
  })

  const setPage = useCallback((page: number) => {
    setState((s) => ({ ...s, offset: page * s.limit }))
  }, [])

  const setLimit = useCallback((limit: number) => {
    setState((s) => ({ ...s, limit, offset: 0 }))
  }, [])

  const setSearch = useCallback((search: string) => {
    setState((s) => ({ ...s, search, offset: 0 }))
  }, [])

  const setSort = useCallback((sortBy: string) => {
    setState((s) => ({
      ...s,
      sortBy,
      sortOrder: s.sortBy === sortBy && s.sortOrder === 'asc' ? 'desc' : 'asc',
    }))
  }, [])

  const params = useMemo<ListQueryParams>(
    () => ({
      offset: state.offset,
      limit: state.limit,
      search: state.search || undefined,
      sortBy: state.sortBy,
      sortOrder: state.sortOrder,
    }),
    [state],
  )

  const page = Math.floor(state.offset / state.limit)

  return { state, params, page, setPage, setLimit, setSearch, setSort }
}
