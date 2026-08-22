import { baseApi } from '@/api/baseApi'
import type { ApiResponse, PaginatedData } from '@/api/types/common.types'
import type { TypeEvent } from '@/api/types/enums.types'
import type { Event } from '@/features/events/event.types'

export interface ListEventsParams {
  realmId?: string
  userId?: string
  // Case-insensitive match against the event's user's display name/username/email.
  userSearch?: string
  clientIdInternal?: string
  type?: TypeEvent
  offset?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listEvents: builder.query<ApiResponse<PaginatedData<Event>>, ListEventsParams | void>({
      query: (params) => ({ url: '/event', method: 'GET', params: params ?? undefined }),
      providesTags: [{ type: 'Event', id: 'LIST' }],
    }),
  }),
})

export const { useListEventsQuery } = eventApi
