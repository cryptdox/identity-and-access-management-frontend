import { baseApi } from '@/api/baseApi'
import type { ApiResponse, ListQueryParams, PaginatedData } from '@/api/types/common.types'
import type { RefreshToken } from '@/features/tokens/token.types'

export interface ListRefreshTokensParams extends ListQueryParams {
  userId?: string
  // Case-insensitive match against the token's user's display name/username/email.
  userSearch?: string
  sessionId?: string
  clientIdInternal?: string
  revoked?: boolean
  // RefreshToken has no realmId column of its own — the backend filters
  // transitively via the owning user (`user.realmId`), and force-overrides this to
  // the caller's own realm unless they're Master.
  realmId?: string
}

export const refreshTokenApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listRefreshTokens: builder.query<ApiResponse<PaginatedData<RefreshToken>>, ListRefreshTokensParams | void>({
      query: (params) => ({ url: '/refresh-token', method: 'GET', params: params ?? undefined }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.items.map((t) => ({ type: 'RefreshToken' as const, id: t.refreshTokenId })),
              { type: 'RefreshToken' as const, id: 'LIST' },
            ]
          : [{ type: 'RefreshToken' as const, id: 'LIST' }],
    }),
    revokeRefreshToken: builder.mutation<
      ApiResponse<RefreshToken>,
      // `listArgs` — the exact params object the caller's active listRefreshTokens
      // query is using (RefreshTokensPage's filters, or SessionRefreshTokensModal's
      // {sessionId}) — lets a successful revoke patch that one row's `revoked`
      // directly in the cache instead of invalidating the whole list and refetching
      // it. Omit it and this falls back to the old invalidate-and-refetch behavior.
      { refreshTokenId: string; listArgs?: ListRefreshTokensParams | void }
    >({
      query: ({ refreshTokenId }) => ({ url: `/refresh-token/${refreshTokenId}`, method: 'PUT', data: { revoked: true } }),
      invalidatesTags: (_result, _error, { listArgs }) => (listArgs ? [] : [{ type: 'RefreshToken', id: 'LIST' }]),
      async onQueryStarted({ refreshTokenId, listArgs }, { dispatch, queryFulfilled }) {
        if (!listArgs) return
        const patch = dispatch(
          refreshTokenApi.util.updateQueryData('listRefreshTokens', listArgs, (draft) => {
            const item = draft.data?.items.find((t) => t.refreshTokenId === refreshTokenId)
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
  }),
})

export const { useListRefreshTokensQuery, useRevokeRefreshTokenMutation } = refreshTokenApi
