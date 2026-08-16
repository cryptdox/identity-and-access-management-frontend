import { baseApi } from '@/api/baseApi'
import type { ApiResponse, PaginatedData } from '@/api/types/common.types'
import type { ClientRole } from '@/features/clients/client.types'

export const clientRoleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listClientRoles: builder.query<
      ApiResponse<PaginatedData<ClientRole>>,
      { clientIdInternal: string; limit?: number }
    >({
      query: ({ clientIdInternal, limit }) => ({
        url: '/client-role',
        method: 'GET',
        params: { clientIdInternal, limit },
      }),
      providesTags: (_result, _error, { clientIdInternal }) => [{ type: 'ClientRole', id: clientIdInternal }],
    }),
    assignClientRole: builder.mutation<ApiResponse<ClientRole>, { clientIdInternal: string; roleId: string }>({
      query: (body) => ({ url: '/client-role', method: 'POST', data: body }),
      invalidatesTags: (_result, _error, { clientIdInternal, roleId }) => [
        { type: 'ClientRole', id: clientIdInternal },
        { type: 'Client', id: clientIdInternal },
        { type: 'Role', id: roleId },
      ],
    }),
    removeClientRole: builder.mutation<ApiResponse<null>, { clientIdInternal: string; roleId: string }>({
      query: ({ clientIdInternal, roleId }) => ({
        url: `/client-role/${clientIdInternal}/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { clientIdInternal, roleId }) => [
        { type: 'ClientRole', id: clientIdInternal },
        { type: 'Client', id: clientIdInternal },
        { type: 'Role', id: roleId },
      ],
    }),
  }),
})

export const { useListClientRolesQuery, useAssignClientRoleMutation, useRemoveClientRoleMutation } = clientRoleApi
