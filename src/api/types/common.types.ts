/** Mirrors backend `src/modules/common/common.dto.ts` exactly. */
export interface ApiResponse<T = unknown> {
  success: boolean
  status: number
  message: string
  data?: T
}

export interface PaginatedData<T> {
  items: T[]
  total: number
  offset: number
  limit: number
}

export interface ListQueryParams {
  offset?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ApiError {
  success: false
  status: number
  message: string
  stack?: string
  // Some endpoints (e.g. package downgrade confirmation) put extra structured
  // detail here on a non-2xx response, beyond the plain error message.
  data?: unknown
}
