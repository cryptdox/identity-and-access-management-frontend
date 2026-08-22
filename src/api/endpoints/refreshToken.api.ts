import { baseApi } from '@/api/baseApi'
import type { ApiResponse, ListQueryParams, PaginatedData } from '@/api/types/common.types'
import type { RefreshToken } from '@/features/tokens/token.types'

export interface ListRefreshTokensParams extends ListQueryParams {
  userId?: string
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
    revokeRefreshToken: builder.mutation<ApiResponse<RefreshToken>, string>({
      query: (refreshTokenId) => ({ url: `/refresh-token/${refreshTokenId}`, method: 'PUT', data: { revoked: true } }),
      invalidatesTags: [{ type: 'RefreshToken', id: 'LIST' }],
    }),
  }),
})

export const { useListRefreshTokensQuery, useRevokeRefreshTokenMutation } = refreshTokenApi
