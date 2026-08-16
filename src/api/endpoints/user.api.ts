import { baseApi } from '@/api/baseApi'
import type { ApiResponse, ListQueryParams, PaginatedData } from '@/api/types/common.types'
import type { CreateUserDto, UpdateUserDto, User } from '@/features/users/user.types'

export interface ListUsersParams extends ListQueryParams {
  realmId?: string
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listUsers: builder.query<ApiResponse<PaginatedData<User>>, ListUsersParams | void>({
      query: (params) => ({ url: '/user', method: 'GET', params: params ?? undefined }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.items.map((u) => ({ type: 'User' as const, id: u.userId })),
              { type: 'User' as const, id: 'LIST' },
            ]
          : [{ type: 'User' as const, id: 'LIST' }],
    }),
    getUser: builder.query<ApiResponse<User>, string>({
      query: (userId) => ({ url: `/user/${userId}`, method: 'GET' }),
      providesTags: (_result, _error, userId) => [{ type: 'User', id: userId }],
    }),
    createUser: builder.mutation<ApiResponse<User>, CreateUserDto>({
      query: (body) => ({ url: '/user', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    updateUser: builder.mutation<ApiResponse<User>, { userId: string; body: UpdateUserDto }>({
      query: ({ userId, body }) => ({ url: `/user/${userId}`, method: 'PUT', data: body }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
      ],
    }),
    deleteUser: builder.mutation<ApiResponse<null>, string>({
      query: (userId) => ({ url: `/user/${userId}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
  }),
})

export const {
  useListUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi
