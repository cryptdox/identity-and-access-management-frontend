import { baseApi } from '@/api/baseApi'
import type { ApiResponse, ListQueryParams, PaginatedData } from '@/api/types/common.types'
import type { Permission } from '@/features/roles/role.types'
import type { TypeAction } from '@/api/types/enums.types'

export const permissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPermissions: builder.query<ApiResponse<PaginatedData<Permission>>, ListQueryParams | void>({
      query: (params) => ({ url: '/permission', method: 'GET', params: params ?? undefined }),
      providesTags: [{ type: 'Permission', id: 'LIST' }],
    }),
    createPermission: builder.mutation<
      ApiResponse<Permission>,
      { action: TypeAction; resourceId: string; clientIdInternal: string }
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

export const { useListPermissionsQuery, useCreatePermissionMutation, useDeletePermissionMutation } = permissionApi
