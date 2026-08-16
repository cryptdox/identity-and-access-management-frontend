import { baseApi } from '@/api/baseApi'
import type { ApiResponse, ListQueryParams, PaginatedData } from '@/api/types/common.types'
import type {
  CreateUserAttributeDto,
  UpdateUserAttributeDto,
  UserAttribute,
} from '@/features/users/user.types'

export const userAttributeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listUserAttributes: builder.query<
      ApiResponse<PaginatedData<UserAttribute>>,
      ListQueryParams & { userId: string }
    >({
      query: ({ userId, ...params }) => ({ url: '/user-attribute', method: 'GET', params: { ...params, userId } }),
      providesTags: (_result, _error, { userId }) => [{ type: 'UserAttribute', id: userId }],
    }),
    createUserAttribute: builder.mutation<ApiResponse<UserAttribute>, CreateUserAttributeDto>({
      query: (body) => ({ url: '/user-attribute', method: 'POST', data: body }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'UserAttribute', id: userId }],
    }),
    updateUserAttribute: builder.mutation<
      ApiResponse<UserAttribute>,
      { userAttributeId: string; userId: string; body: UpdateUserAttributeDto }
    >({
      query: ({ userAttributeId, body }) => ({
        url: `/user-attribute/${userAttributeId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'UserAttribute', id: userId }],
    }),
    deleteUserAttribute: builder.mutation<
      ApiResponse<null>,
      { userAttributeId: string; userId: string }
    >({
      query: ({ userAttributeId }) => ({ url: `/user-attribute/${userAttributeId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'UserAttribute', id: userId }],
    }),
  }),
})

export const {
  useListUserAttributesQuery,
  useCreateUserAttributeMutation,
  useUpdateUserAttributeMutation,
  useDeleteUserAttributeMutation,
} = userAttributeApi
