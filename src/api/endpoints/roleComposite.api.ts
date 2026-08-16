import { baseApi } from '@/api/baseApi'
import type { ApiResponse, PaginatedData } from '@/api/types/common.types'
import type { RoleComposite } from '@/features/roles/role.types'

export const roleCompositeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listRoleComposites: builder.query<ApiResponse<PaginatedData<RoleComposite>>, { roleId: string; limit?: number }>({
      query: ({ roleId, limit }) => ({ url: '/role-composite', method: 'GET', params: { roleId, limit } }),
      providesTags: (_result, _error, { roleId }) => [{ type: 'RoleComposite', id: roleId }],
    }),
    addCompositeRole: builder.mutation<ApiResponse<RoleComposite>, { roleId: string; compositeRoleId: string }>({
      query: (body) => ({ url: '/role-composite', method: 'POST', data: body }),
      invalidatesTags: (_result, _error, { roleId, compositeRoleId }) => [
        { type: 'RoleComposite', id: roleId },
        { type: 'Role', id: roleId },
        { type: 'Role', id: compositeRoleId },
      ],
    }),
    removeCompositeRole: builder.mutation<ApiResponse<null>, { roleId: string; compositeRoleId: string }>({
      query: ({ roleId, compositeRoleId }) => ({
        url: `/role-composite/${roleId}/${compositeRoleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { roleId, compositeRoleId }) => [
        { type: 'RoleComposite', id: roleId },
        { type: 'Role', id: roleId },
        { type: 'Role', id: compositeRoleId },
      ],
    }),
  }),
})

export const { useListRoleCompositesQuery, useAddCompositeRoleMutation, useRemoveCompositeRoleMutation } =
  roleCompositeApi
