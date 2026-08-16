import { baseApi } from '@/api/baseApi'
import type { ApiResponse, ListQueryParams, PaginatedData } from '@/api/types/common.types'
import type { Client, CreateClientDto, UpdateClientDto } from '@/features/clients/client.types'

export interface ListClientsParams extends ListQueryParams {
  realmId?: string
}

export const clientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listClients: builder.query<ApiResponse<PaginatedData<Client>>, ListClientsParams | void>({
      query: (params) => ({ url: '/client', method: 'GET', params: params ?? undefined }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.items.map((c) => ({ type: 'Client' as const, id: c.clientIdInternal })),
              { type: 'Client' as const, id: 'LIST' },
            ]
          : [{ type: 'Client' as const, id: 'LIST' }],
    }),
    getClient: builder.query<ApiResponse<Client>, string>({
      query: (clientIdInternal) => ({ url: `/client/${clientIdInternal}`, method: 'GET' }),
      providesTags: (_result, _error, clientIdInternal) => [{ type: 'Client', id: clientIdInternal }],
    }),
    createClient: builder.mutation<ApiResponse<Client>, CreateClientDto>({
      query: (body) => ({ url: '/client', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Client', id: 'LIST' }],
    }),
    updateClient: builder.mutation<ApiResponse<Client>, { clientIdInternal: string; body: UpdateClientDto }>({
      query: ({ clientIdInternal, body }) => ({ url: `/client/${clientIdInternal}`, method: 'PUT', data: body }),
      invalidatesTags: (_result, _error, { clientIdInternal }) => [
        { type: 'Client', id: clientIdInternal },
        { type: 'Client', id: 'LIST' },
      ],
    }),
    deleteClient: builder.mutation<ApiResponse<null>, string>({
      query: (clientIdInternal) => ({ url: `/client/${clientIdInternal}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Client', id: 'LIST' }],
    }),
  }),
})

export const {
  useListClientsQuery,
  useGetClientQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} = clientApi
