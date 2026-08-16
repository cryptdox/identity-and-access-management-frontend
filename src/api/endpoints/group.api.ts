import { baseApi } from '@/api/baseApi'
import type { ApiResponse, ListQueryParams, PaginatedData } from '@/api/types/common.types'
import type { CreateGroupDto, Group, UpdateGroupDto } from '@/features/groups/group.types'

export interface ListGroupsParams extends ListQueryParams {
  realmId?: string
  parentId?: string
}

export const groupApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listGroups: builder.query<ApiResponse<PaginatedData<Group>>, ListGroupsParams | void>({
      query: (params) => ({ url: '/group', method: 'GET', params: params ?? undefined }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.items.map((g) => ({ type: 'Group' as const, id: g.groupId })),
              { type: 'Group' as const, id: 'LIST' },
            ]
          : [{ type: 'Group' as const, id: 'LIST' }],
    }),
    getGroup: builder.query<ApiResponse<Group>, string>({
      query: (groupId) => ({ url: `/group/${groupId}`, method: 'GET' }),
      providesTags: (_result, _error, groupId) => [{ type: 'Group', id: groupId }],
    }),
    createGroup: builder.mutation<ApiResponse<Group>, CreateGroupDto>({
      query: (body) => ({ url: '/group', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Group', id: 'LIST' }],
    }),
    updateGroup: builder.mutation<ApiResponse<Group>, { groupId: string; body: UpdateGroupDto }>({
      query: ({ groupId, body }) => ({ url: `/group/${groupId}`, method: 'PUT', data: body }),
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: 'Group', id: groupId },
        { type: 'Group', id: 'LIST' },
      ],
    }),
    deleteGroup: builder.mutation<ApiResponse<null>, string>({
      query: (groupId) => ({ url: `/group/${groupId}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Group', id: 'LIST' }],
    }),
  }),
})

export const {
  useListGroupsQuery,
  useGetGroupQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
} = groupApi
