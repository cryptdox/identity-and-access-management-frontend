import { baseApi } from '@/api/baseApi'
import type { ApiResponse, PaginatedData } from '@/api/types/common.types'
import type {
  BulkUpdateResourceDto,
  CreateResourceDto,
  Resource,
  UpdateResourceDto,
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
      // Additively creates Permission rows for any newly-listed actions —
      // the Permission cache is stale too, same as create above.
      invalidatesTags: (_result, _error, { clientIdInternal }) => [
        { type: 'Resource', id: clientIdInternal },
        { type: 'Permission', id: 'LIST' },
      ],
    }),
    // Editing a resource's actions can remove some — the backend cascade-deletes
    // their Permission rows, so the Permission cache is stale too, same as delete below.
    updateResource: builder.mutation<ApiResponse<Resource>, UpdateResourceDto & { resourceId: string; clientIdInternal: string }>({
      query: ({ resourceId, clientIdInternal: _clientIdInternal, ...body }) => ({
        url: `/resource/${resourceId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: (_result, _error, { clientIdInternal }) => [
        { type: 'Resource', id: clientIdInternal },
        { type: 'Permission', id: 'LIST' },
      ],
    }),
    deleteResource: builder.mutation<ApiResponse<null>, { resourceId: string; clientIdInternal: string }>({
      query: ({ resourceId }) => ({ url: `/resource/${resourceId}`, method: 'DELETE' }),
      // Cascade-deletes the resource's Permission rows server-side — the
      // Permission cache is stale too, same as create/update above. Without
      // this, a later resource reusing the same name+type shows its
      // permission checkboxes as unchecked while the DB already has them.
      invalidatesTags: (_result, _error, { clientIdInternal }) => [
        { type: 'Resource', id: clientIdInternal },
        { type: 'Permission', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useListResourcesQuery,
  useCreateResourcesMutation,
  useBulkUpdateResourcesMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
} = resourceApi
