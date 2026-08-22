import { baseApi } from '@/api/baseApi'
import type { ApiResponse, ListQueryParams, PaginatedData } from '@/api/types/common.types'
import type { CreateRealmDto, Realm, RealmSettingKeyMeta, UpdateRealmDto } from '@/features/realms/realm.types'
import type {
  PackageDefinition,
  RealmPackage,
  RealmPackageLog,
  AssignPackageDto,
  CreatePackageRequestDto,
  RequestRealmDto,
} from '@/features/realms/realmPackage.types'

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
    resetRealmRateLimiters: builder.mutation<ApiResponse<{ keysCleared: number }>, string>({
      query: (realmId) => ({ url: `/realm/${realmId}/rate-limit/reset`, method: 'POST' }),
    }),
    resetAllRateLimiters: builder.mutation<ApiResponse<{ keysCleared: number }>, void>({
      query: () => ({ url: '/realm/rate-limit/reset-all', method: 'POST' }),
    }),

    // Public — no auth, used by the landing page pricing table and the
    // package-change pickers on the Package tab.
    listPackageDefinitions: builder.query<ApiResponse<PackageDefinition[]>, void>({
      query: () => ({ url: '/package-definitions', method: 'GET' }),
    }),
    // Public — creates a disabled realm + disabled admin user, pending Master's review.
    requestRealm: builder.mutation<ApiResponse<{ message: string }>, RequestRealmDto>({
      query: (body) => ({ url: '/realm-requests', method: 'POST', data: body }),
    }),

    getRealmPackage: builder.query<ApiResponse<RealmPackage>, string>({
      query: (realmId) => ({ url: `/realm/${realmId}/package`, method: 'GET' }),
      providesTags: (_result, _error, realmId) => [{ type: 'Realm', id: `${realmId}:package` }],
    }),
    getRealmPackageHistory: builder.query<ApiResponse<RealmPackageLog[]>, string>({
      query: (realmId) => ({ url: `/realm/${realmId}/package/history`, method: 'GET' }),
      providesTags: (_result, _error, realmId) => [{ type: 'Realm', id: `${realmId}:package-history` }],
    }),
    // Master-only direct/custom assignment — may resolve with a 409
    // requiresConfirmation payload (ApiError.data) instead of throwing cleanly.
    assignRealmPackage: builder.mutation<ApiResponse<RealmPackage>, { realmId: string; body: AssignPackageDto }>({
      query: ({ realmId, body }) => ({ url: `/realm/${realmId}/package`, method: 'PUT', data: body }),
      invalidatesTags: (_result, _error, { realmId }) => [
        { type: 'Realm', id: `${realmId}:package` },
        { type: 'Realm', id: `${realmId}:package-history` },
      ],
    }),
    createPackageRequest: builder.mutation<ApiResponse<unknown>, { realmId: string; body: CreatePackageRequestDto }>({
      query: ({ realmId, body }) => ({ url: `/realm/${realmId}/package/request`, method: 'POST', data: body }),
      invalidatesTags: (_result, _error, { realmId }) => [{ type: 'Realm', id: `${realmId}:package` }],
    }),
    approvePackageRequest: builder.mutation<
      ApiResponse<RealmPackage>,
      { realmId: string; requestId: string; confirmForceDowngrade?: boolean }
    >({
      query: ({ realmId, requestId, confirmForceDowngrade }) => ({
        url: `/realm/${realmId}/package/requests/${requestId}/approve`,
        method: 'POST',
        data: { confirmForceDowngrade },
      }),
      invalidatesTags: (_result, _error, { realmId }) => [
        { type: 'Realm', id: `${realmId}:package` },
        { type: 'Realm', id: `${realmId}:package-history` },
      ],
    }),
    rejectPackageRequest: builder.mutation<ApiResponse<null>, { realmId: string; requestId: string }>({
      query: ({ realmId, requestId }) => ({ url: `/realm/${realmId}/package/requests/${requestId}/reject`, method: 'POST' }),
      invalidatesTags: (_result, _error, { realmId }) => [
        { type: 'Realm', id: `${realmId}:package` },
        { type: 'Realm', id: `${realmId}:package-history` },
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
  useResetRealmRateLimitersMutation,
  useResetAllRateLimitersMutation,
  useListPackageDefinitionsQuery,
  useRequestRealmMutation,
  useGetRealmPackageQuery,
  useGetRealmPackageHistoryQuery,
  useAssignRealmPackageMutation,
  useCreatePackageRequestMutation,
  useApprovePackageRequestMutation,
  useRejectPackageRequestMutation,
} = realmApi
