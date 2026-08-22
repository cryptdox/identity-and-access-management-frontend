import { baseApi } from '@/api/baseApi'
import type { ApiResponse, ListQueryParams, PaginatedData } from '@/api/types/common.types'
import type { UserSession } from '@/features/users/user.types'

export interface ListUserSessionsParams extends ListQueryParams {
  userId?: string
  realmId?: string
  revoked?: boolean
}

export const userSessionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listUserSessions: builder.query<ApiResponse<PaginatedData<UserSession>>, ListUserSessionsParams>({
      query: (params) => ({ url: '/user-session', method: 'GET', params }),
      providesTags: (result, _error, params) => [
        { type: 'UserSession', id: params.userId ?? params.realmId ?? 'LIST' },
        ...(result?.data?.items.map((s) => ({ type: 'UserSession' as const, id: s.userSessionId })) ?? []),
      ],
    }),
    revokeUserSession: builder.mutation<
      ApiResponse<UserSession>,
      // `listArgs` — the exact params object the caller's active listUserSessions
      // query is using — lets a successful revoke patch that one row's `revoked`
      // directly in the cache instead of invalidating the whole list and refetching
      // it. Omit it and this falls back to the old invalidate-and-refetch behavior.
      { userSessionId: string; userId?: string; realmId?: string; listArgs?: ListUserSessionsParams }
    >({
      query: ({ userSessionId }) => ({ url: `/user-session/${userSessionId}`, method: 'PUT', data: { revoked: true } }),
      invalidatesTags: (_result, _error, { userId, realmId, listArgs }) =>
        listArgs ? [] : [{ type: 'UserSession', id: userId ?? realmId ?? 'LIST' }],
      async onQueryStarted({ userSessionId, listArgs }, { dispatch, queryFulfilled }) {
        if (!listArgs) return
        const patch = dispatch(
          userSessionApi.util.updateQueryData('listUserSessions', listArgs, (draft) => {
            const item = draft.data?.items.find((s) => s.userSessionId === userSessionId)
            if (item) item.revoked = true
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
    }),
    deleteUserSession: builder.mutation<
      ApiResponse<null>,
      { userSessionId: string; userId?: string; realmId?: string }
    >({
      query: ({ userSessionId }) => ({ url: `/user-session/${userSessionId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { userId, realmId }) => [
        { type: 'UserSession', id: userId ?? realmId ?? 'LIST' },
      ],
    }),
  }),
})

export const { useListUserSessionsQuery, useRevokeUserSessionMutation, useDeleteUserSessionMutation } =
  userSessionApi
