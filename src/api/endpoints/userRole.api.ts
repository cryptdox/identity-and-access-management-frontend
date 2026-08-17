import { baseApi } from '@/api/baseApi'
import type { ApiResponse, PaginatedData } from '@/api/types/common.types'
import type { UserRole } from '@/features/users/user-role.types'

export const userRoleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listUserRoles: builder.query<ApiResponse<PaginatedData<UserRole>>, { userId?: string; roleId?: string; limit?: number }>({
      query: (params) => ({ url: '/user-role', method: 'GET', params }),
      providesTags: (_result, _error, { userId, roleId }) => [{ type: 'UserRole', id: userId ?? roleId ?? 'LIST' }],
    }),
    assignUserRole: builder.mutation<ApiResponse<UserRole>, { userId: string; roleId: string }>({
      query: (body) => ({ url: '/user-role', method: 'POST', data: body }),
      invalidatesTags: (_result, _error, { userId, roleId }) => [
        { type: 'UserRole', id: userId },
        { type: 'User', id: userId },
        { type: 'Role', id: roleId },
        { type: 'Me' },
      ],
    }),
    removeUserRole: builder.mutation<ApiResponse<null>, { userId: string; roleId: string }>({
      query: ({ userId, roleId }) => ({ url: `/user-role/${userId}/${roleId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { userId, roleId }) => [
        { type: 'UserRole', id: userId },
        { type: 'User', id: userId },
        { type: 'Role', id: roleId },
        { type: 'Me' },
      ],
    }),
  }),
})

export const { useListUserRolesQuery, useAssignUserRoleMutation, useRemoveUserRoleMutation } = userRoleApi
