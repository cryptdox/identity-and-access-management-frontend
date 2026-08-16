import { baseApi } from '@/api/baseApi'
import type { ApiResponse, PaginatedData } from '@/api/types/common.types'
import type { UserGroup } from '@/features/groups/group-user.types'

export const userGroupApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listUserGroups: builder.query<
      ApiResponse<PaginatedData<UserGroup>>,
      { groupId?: string; userId?: string; limit?: number }
    >({
      query: (params) => ({ url: '/user-group', method: 'GET', params }),
      providesTags: (_result, _error, { groupId, userId }) => [
        { type: 'UserGroup', id: groupId ?? userId ?? 'LIST' },
      ],
    }),
    addUserToGroup: builder.mutation<ApiResponse<UserGroup>, { userId: string; groupId: string }>({
      query: (body) => ({ url: '/user-group', method: 'POST', data: body }),
      invalidatesTags: (_result, _error, { userId, groupId }) => [
        { type: 'UserGroup', id: groupId },
        { type: 'UserGroup', id: userId },
        { type: 'Group', id: groupId },
      ],
    }),
    removeUserFromGroup: builder.mutation<ApiResponse<null>, { userId: string; groupId: string }>({
      query: ({ userId, groupId }) => ({ url: `/user-group/${userId}/${groupId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { userId, groupId }) => [
        { type: 'UserGroup', id: groupId },
        { type: 'UserGroup', id: userId },
        { type: 'Group', id: groupId },
      ],
    }),
  }),
})

export const { useListUserGroupsQuery, useAddUserToGroupMutation, useRemoveUserFromGroupMutation } = userGroupApi
