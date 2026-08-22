import { baseApi } from '@/api/baseApi'
import type { ApiResponse, ListQueryParams, PaginatedData } from '@/api/types/common.types'
import type { CreateRealmDto, Realm, RealmSettingKeyMeta, UpdateRealmDto } from '@/features/realms/realm.types'

export const realmApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listRealms: builder.query<ApiResponse<PaginatedData<Realm>>, ListQueryParams | void>({
      query: (params) => ({ url: '/realm', method: 'GET', params: params ?? undefined }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.items.map((r) => ({ type: 'Realm' as const, id: r.realmId })),
              { type: 'Realm' as const, id: 'LIST' },
            ]
          : [{ type: 'Realm' as const, id: 'LIST' }],
    }),
    getRealm: builder.query<ApiResponse<Realm>, string>({
      query: (realmId) => ({ url: `/realm/${realmId}`, method: 'GET' }),
      providesTags: (_result, _error, realmId) => [{ type: 'Realm', id: realmId }],
    }),
    createRealm: builder.mutation<ApiResponse<Realm>, CreateRealmDto>({
      query: (body) => ({ url: '/realm', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Realm', id: 'LIST' }],
    }),
    updateRealm: builder.mutation<ApiResponse<Realm>, { realmId: string; body: UpdateRealmDto }>({
      query: ({ realmId, body }) => ({ url: `/realm/${realmId}`, method: 'PUT', data: body }),
      invalidatesTags: (_result, _error, { realmId }) => [
        { type: 'Realm', id: realmId },
        { type: 'Realm', id: 'LIST' },
      ],
    }),
    deleteRealm: builder.mutation<ApiResponse<null>, string>({
      query: (realmId) => ({ url: `/realm/${realmId}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Realm', id: 'LIST' }],
    }),
    getRealmSettings: builder.query<ApiResponse<Record<string, unknown>>, string>({
      query: (realmId) => ({ url: `/realm/${realmId}/settings`, method: 'GET' }),
      providesTags: (_result, _error, realmId) => [{ type: 'Realm', id: `${realmId}:settings` }],
    }),
    // Static metadata (not per-realm) — lets the settings form render one input
    // per key instead of hardcoding a section per key.
    getRealmSettingKeys: builder.query<ApiResponse<RealmSettingKeyMeta[]>, void>({
      query: () => ({ url: '/realm/settings/keys', method: 'GET' }),
    }),
    updateRealmSettings: builder.mutation<
      ApiResponse<Record<string, unknown>>,
      { realmId: string; body: Record<string, unknown> }
    >({
      query: ({ realmId, body }) => ({ url: `/realm/${realmId}/settings`, method: 'PUT', data: body }),
      invalidatesTags: (_result, _error, { realmId }) => [
        { type: 'Realm', id: `${realmId}:settings` },
        { type: 'Realm', id: realmId },
      ],
    }),
  }),
})

export const {
  useListRealmsQuery,
  useGetRealmQuery,
  useCreateRealmMutation,
  useUpdateRealmMutation,
  useDeleteRealmMutation,
  useGetRealmSettingsQuery,
  useGetRealmSettingKeysQuery,
  useUpdateRealmSettingsMutation,
} = realmApi
