import { baseApi } from '@/api/baseApi'
import type { ApiResponse, ListQueryParams, PaginatedData } from '@/api/types/common.types'
import type { CreateRoleDto, Role, UpdateRoleDto } from '@/features/roles/role.types'

export const roleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listRoles: builder.query<ApiResponse<PaginatedData<Role>>, ListQueryParams | void>({
      query: (params) => ({ url: '/role', method: 'GET', params: params ?? undefined }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.items.map((r) => ({ type: 'Role' as const, id: r.roleId })),
              { type: 'Role' as const, id: 'LIST' },
            ]
          : [{ type: 'Role' as const, id: 'LIST' }],
    }),
    getRole: builder.query<ApiResponse<Role>, string>({
      query: (roleId) => ({ url: `/role/${roleId}`, method: 'GET' }),
      providesTags: (_result, _error, roleId) => [{ type: 'Role', id: roleId }],
    }),
    createRole: builder.mutation<ApiResponse<Role>, CreateRoleDto>({
      query: (body) => ({ url: '/role', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),
    updateRole: builder.mutation<ApiResponse<Role>, { roleId: string; body: UpdateRoleDto }>({
      query: ({ roleId, body }) => ({ url: `/role/${roleId}`, method: 'PUT', data: body }),
      invalidatesTags: (_result, _error, { roleId }) => [
        { type: 'Role', id: roleId },
        { type: 'Role', id: 'LIST' },
      ],
    }),
    deleteRole: builder.mutation<ApiResponse<null>, string>({
      query: (roleId) => ({ url: `/role/${roleId}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),
    assignRolePermissions: builder.mutation<
      ApiResponse<{ assignedCount: number }>,
      { roleId: string; permissionIds: string[] }
    >({
      query: ({ roleId, permissionIds }) => ({
        url: `/role/${roleId}/permissions`,
        method: 'POST',
        data: { permissionIds },
      }),
      invalidatesTags: (_result, _error, { roleId }) => [{ type: 'Role', id: roleId }],
    }),
  }),
})

export const {
  useListRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignRolePermissionsMutation,
} = roleApi
