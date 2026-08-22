import { useCallback, useEffect, useState } from 'react'
import type { ApiResponse } from '@/api/types/common.types'
import type { CursorPage } from '@/features/realms/realmPackage.types'

/** Drives a cursor ("load more") list from an RTK Query lazy-query trigger —
 * shared by the Realms list's "Realms" and "Package requests" tabs, the only
 * two lists in this app using cursor pagination (everywhere else keeps
 * offset/page-number pagination via usePagination + DataTable's default mode).
 * Reloads from scratch whenever `params` changes (e.g. a filter), and appends
 * on loadMore(). */
export function useCursorList<T, P extends object>(
  trigger: (arg: P & { cursor?: string }) => { unwrap: () => Promise<ApiResponse<CursorPage<T>>> },
  params: P,
) {
  const [items, setItems] = useState<T[]>([])
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const paramsKey = JSON.stringify(params)

  const reload = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await trigger({ ...params, cursor: undefined }).unwrap()
      setItems(result.data?.items ?? [])
      setNextCursor(result.data?.nextCursor ?? undefined)
    } finally {
      setIsLoading(false)
    }
    // `trigger` from useLazy*Query is stable; params is captured via paramsKey below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey])

  useEffect(() => {
    void reload()
  }, [reload])

  async function loadMore() {
    if (!nextCursor) return
    setIsLoadingMore(true)
    try {
      const result = await trigger({ ...params, cursor: nextCursor }).unwrap()
      setItems((prev) => [...prev, ...(result.data?.items ?? [])])
      setNextCursor(result.data?.nextCursor ?? undefined)
    } finally {
      setIsLoadingMore(false)
    }
  }

  return { items, isLoading, isLoadingMore, hasMore: Boolean(nextCursor), loadMore, reload }
}
