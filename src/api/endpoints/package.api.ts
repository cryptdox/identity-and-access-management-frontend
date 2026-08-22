import { baseApi } from '@/api/baseApi'
import type { ApiResponse } from '@/api/types/common.types'
import type {
  PackageDefinition,
  CreatePackageDefinitionDto,
  UpdatePackageDefinitionDto,
  RealmPackageWithRealm,
  RealmPackageRequestWithRealm,
  RealmPackageLogWithRealm,
  CursorPage,
} from '@/features/realms/realmPackage.types'

/** The Packages module — Master-only (see masterOnly.middleware.ts on the
 * backend). All four list endpoints are cursor-paginated except definitions
 * (a small fixed catalog, no pagination needed). */
export const packageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPackageModuleDefinitions: builder.query<ApiResponse<PackageDefinition[]>, void>({
      query: () => ({ url: '/package/definitions', method: 'GET' }),
      providesTags: [{ type: 'Realm', id: 'PACKAGE_DEFINITIONS' }],
    }),
    createPackageDefinition: builder.mutation<ApiResponse<PackageDefinition>, CreatePackageDefinitionDto>({
      query: (body) => ({ url: '/package/definitions', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Realm', id: 'PACKAGE_DEFINITIONS' }],
    }),
    updatePackageDefinition: builder.mutation<
      ApiResponse<PackageDefinition>,
      { packageDefinitionId: string; body: UpdatePackageDefinitionDto }
    >({
      query: ({ packageDefinitionId, body }) => ({ url: `/package/definitions/${packageDefinitionId}`, method: 'PATCH', data: body }),
      invalidatesTags: [{ type: 'Realm', id: 'PACKAGE_DEFINITIONS' }],
    }),
    listAssignedPackages: builder.query<
      ApiResponse<CursorPage<RealmPackageWithRealm>>,
      { packageDefinitionId?: string; realmName?: string; cursor?: string; limit?: number } | void
    >({
      query: (params) => ({ url: '/package/assigned', method: 'GET', params: params ?? undefined }),
    }),
    listPackageModuleRequests: builder.query<
      ApiResponse<CursorPage<RealmPackageRequestWithRealm>>,
      {
        status?: 'PENDING' | 'APPROVED' | 'REJECTED'
        packageDefinitionId?: string
        realmName?: string
        dateFrom?: string
        dateTo?: string
        cursor?: string
        limit?: number
      } | void
    >({
      query: (params) => ({ url: '/package/requests', method: 'GET', params: params ?? undefined }),
      providesTags: [{ type: 'Realm', id: 'PACKAGE_REQUESTS' }],
    }),
    listPackageModuleLogs: builder.query<
      ApiResponse<CursorPage<RealmPackageLogWithRealm>>,
      { realmName?: string; action?: string; dateFrom?: string; dateTo?: string; cursor?: string; limit?: number } | void
    >({
      query: (params) => ({ url: '/package/logs', method: 'GET', params: params ?? undefined }),
    }),
  }),
})

export const {
  useListPackageModuleDefinitionsQuery,
  useCreatePackageDefinitionMutation,
  useUpdatePackageDefinitionMutation,
  useLazyListAssignedPackagesQuery,
  useLazyListPackageModuleRequestsQuery,
  useLazyListPackageModuleLogsQuery,
} = packageApi
