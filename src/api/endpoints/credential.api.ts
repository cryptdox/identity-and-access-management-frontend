import { baseApi } from '@/api/baseApi'
import type { ApiResponse, ListQueryParams, PaginatedData } from '@/api/types/common.types'
import type { Credential, CreateCredentialDto } from '@/features/users/user.types'

export const credentialApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listCredentials: builder.query<
      ApiResponse<PaginatedData<Credential>>,
      ListQueryParams & { userId: string }
    >({
      query: ({ userId, ...params }) => ({ url: '/credential', method: 'GET', params: { ...params, userId } }),
      providesTags: (_result, _error, { userId }) => [{ type: 'Credential', id: userId }],
    }),
    createCredential: builder.mutation<ApiResponse<Credential>, CreateCredentialDto>({
      query: (body) => ({ url: '/credential', method: 'POST', data: body }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'Credential', id: userId }],
    }),
    deleteCredential: builder.mutation<ApiResponse<null>, { credentialId: string; userId: string }>({
      query: ({ credentialId }) => ({ url: `/credential/${credentialId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'Credential', id: userId }],
    }),
  }),
})

export const { useListCredentialsQuery, useCreateCredentialMutation, useDeleteCredentialMutation } =
  credentialApi
