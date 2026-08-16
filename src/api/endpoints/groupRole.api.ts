import { baseApi } from '@/api/baseApi'
import type { ApiResponse, PaginatedData } from '@/api/types/common.types'
import type { GroupRole } from '@/features/groups/group.types'

export const groupRoleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listGroupRoles: builder.query<ApiResponse<PaginatedData<GroupRole>>, { groupId: string; limit?: number }>({
      query: ({ groupId, limit }) => ({ url: '/group-role', method: 'GET', params: { groupId, limit } }),
      providesTags: (_result, _error, { groupId }) => [{ type: 'GroupRole', id: groupId }],
    }),
    assignGroupRole: builder.mutation<ApiResponse<GroupRole>, { groupId: string; roleId: string }>({
      query: (body) => ({ url: '/group-role', method: 'POST', data: body }),
      invalidatesTags: (_result, _error, { groupId, roleId }) => [
        { type: 'GroupRole', id: groupId },
        { type: 'Group', id: groupId },
        { type: 'Role', id: roleId },
      ],
    }),
    removeGroupRole: builder.mutation<ApiResponse<null>, { groupId: string; roleId: string }>({
      query: ({ groupId, roleId }) => ({ url: `/group-role/${groupId}/${roleId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { groupId, roleId }) => [
        { type: 'GroupRole', id: groupId },
        { type: 'Group', id: groupId },
        { type: 'Role', id: roleId },
      ],
    }),
  }),
})

export const { useListGroupRolesQuery, useAssignGroupRoleMutation, useRemoveGroupRoleMutation } = groupRoleApi
