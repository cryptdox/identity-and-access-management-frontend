import { baseApi } from '@/api/baseApi'
import type { ApiResponse, ListQueryParams, PaginatedData } from '@/api/types/common.types'
import type { RefreshToken } from '@/features/tokens/token.types'

export interface ListRefreshTokensParams extends ListQueryParams {
  userId?: string
  sessionId?: string
  clientIdInternal?: string
  revoked?: boolean
}

export const refreshTokenApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Note: this endpoint has no realmId filter server-side (RefreshToken has no
    // direct realmId column, only userId/sessionId) — the Refresh Tokens page can
    // only filter by user, not scope strictly to the current realm.
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
    revokeRefreshToken: builder.mutation<ApiResponse<RefreshToken>, string>({
      query: (refreshTokenId) => ({ url: `/refresh-token/${refreshTokenId}`, method: 'PUT', data: { revoked: true } }),
      invalidatesTags: [{ type: 'RefreshToken', id: 'LIST' }],
    }),
  }),
})

export const { useListRefreshTokensQuery, useRevokeRefreshTokenMutation } = refreshTokenApi
