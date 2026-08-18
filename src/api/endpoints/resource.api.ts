import { baseApi } from '@/api/baseApi'
import type { ApiResponse, PaginatedData } from '@/api/types/common.types'
import type {
  BulkUpdateResourceDto,
  CreateResourceDto,
  Resource,
} from '@/features/resources/resource.types'

export const resourceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listResources: builder.query<
      ApiResponse<PaginatedData<Resource>>,
      { clientIdInternal: string; limit?: number }
    >({
      query: ({ clientIdInternal, limit }) => ({ url: '/resource', method: 'GET', params: { clientIdInternal, limit } }),
      providesTags: (_result, _error, { clientIdInternal }) => [
        { type: 'Resource', id: clientIdInternal },
        { type: 'Resource', id: 'LIST' },
      ],
    }),
    // createResources only receives the client's business `clientId` string, not its
    // internal id that listResources' cache key is keyed by — invalidate the shared
    // LIST tag instead of trying to match a specific client's cache entry.
    createResources: builder.mutation<ApiResponse<Resource[]>, CreateResourceDto>({
      query: (body) => ({ url: '/resource', method: 'POST', data: body }),
      // The backend seeds permissions for each resource in the same call, so the
      // Permission list cache is stale too — without this the new resource's row
      // renders with every checkbox unchecked until a manual reload.
      invalidatesTags: [{ type: 'Resource', id: 'LIST' }, { type: 'Permission', id: 'LIST' }],
    }),
    bulkUpdateResources: builder.mutation<ApiResponse<unknown>, BulkUpdateResourceDto & { clientIdInternal: string }>({
      query: ({ clientIdInternal: _clientIdInternal, ...body }) => ({ url: '/resource/bulk', method: 'PUT', data: body }),
      invalidatesTags: (_result, _error, { clientIdInternal }) => [{ type: 'Resource', id: clientIdInternal }],
    }),
    deleteResource: builder.mutation<ApiResponse<null>, { resourceId: string; clientIdInternal: string }>({
      query: ({ resourceId }) => ({ url: `/resource/${resourceId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { clientIdInternal }) => [{ type: 'Resource', id: clientIdInternal }],
    }),
  }),
})

export const {
  useListResourcesQuery,
  useCreateResourcesMutation,
  useBulkUpdateResourcesMutation,
  useDeleteResourceMutation,
} = resourceApi
