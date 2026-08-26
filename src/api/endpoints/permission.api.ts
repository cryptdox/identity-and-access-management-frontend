import { baseApi } from '@/api/baseApi'
import type { ApiResponse, ListQueryParams, PaginatedData } from '@/api/types/common.types'
import type { Permission } from '@/features/roles/role.types'

export const permissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPermissions: builder.query<ApiResponse<PaginatedData<Permission>>, ListQueryParams | void>({
      query: (params) => ({ url: '/permission', method: 'GET', params: params ?? undefined }),
      providesTags: [{ type: 'Permission', id: 'LIST' }],
    }),
    listPermissionsByClient: builder.query<ApiResponse<PaginatedData<Permission>>, { clientIdInternal: string } & ListQueryParams>({
      // Route param is literally named :clientId, but the backend treats it as the
      // internal id (permission.service.ts's getByClientId) — not the external clientId string.
      query: ({ clientIdInternal, ...params }) => ({ url: `/permission/client/${clientIdInternal}`, method: 'GET', params }),
      // Also provide the shared 'LIST' tag: several resource.api.ts mutations
      // (create/bulkUpdate/delete a resource) only know the client's external
      // clientId, not this internal id, so they can only invalidate 'LIST' —
      // without this, this query stayed stale after any of those, making the
      // matrix show a checkbox as unchecked when the backend already created
      // that Permission row (next click then 500s with "already exists").
      providesTags: (_result, _error, { clientIdInternal }) => [
        { type: 'Permission', id: clientIdInternal },
        { type: 'Permission', id: 'LIST' },
      ],
    }),
    createPermission: builder.mutation<
      ApiResponse<Permission>,
      { action: string; resourceId: string; clientIdInternal: string }
    >({
      query: ({ action, resourceId }) => ({ url: '/permission', method: 'POST', data: { action, resourceId } }),
      invalidatesTags: (_result, _error, { clientIdInternal }) => [
        { type: 'Permission', id: 'LIST' },
        { type: 'Resource', id: clientIdInternal },
      ],
    }),
    deletePermission: builder.mutation<ApiResponse<null>, { permissionId: string; clientIdInternal: string }>({
      query: ({ permissionId }) => ({ url: `/permission/${permissionId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { clientIdInternal }) => [
        { type: 'Permission', id: 'LIST' },
        { type: 'Resource', id: clientIdInternal },
      ],
    }),
  }),
})

export const {
  useListPermissionsQuery,
  useListPermissionsByClientQuery,
  useCreatePermissionMutation,
  useDeletePermissionMutation,
} = permissionApi
