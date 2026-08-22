import { baseApi } from '@/api/baseApi'
import type { ApiResponse } from '@/api/types/common.types'
import type {
  CreateDashboardViewDto,
  DashboardView,
  DashboardViewTypeMeta,
  DashboardViewWithData,
  RoleDashboardView,
} from '@/features/dashboard/dashboard.types'

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardViewTypes: builder.query<ApiResponse<DashboardViewTypeMeta[]>, void>({
      query: () => ({ url: '/dashboard/view-types', method: 'GET' }),
    }),
    getDashboardData: builder.query<ApiResponse<DashboardViewWithData[]>, void>({
      query: () => ({ url: '/dashboard/data', method: 'GET' }),
      providesTags: [{ type: 'Dashboard', id: 'DATA' }],
    }),
    getClientDashboardViews: builder.query<ApiResponse<DashboardView[]>, string>({
      query: (clientIdInternal) => ({ url: `/dashboard/client/${clientIdInternal}/views`, method: 'GET' }),
      providesTags: (_result, _error, clientIdInternal) => [{ type: 'Dashboard', id: `catalog:${clientIdInternal}` }],
    }),
    createClientDashboardView: builder.mutation<
      ApiResponse<DashboardView>,
      { clientIdInternal: string; body: CreateDashboardViewDto }
    >({
      query: ({ clientIdInternal, body }) => ({ url: `/dashboard/client/${clientIdInternal}/views`, method: 'POST', data: body }),
      invalidatesTags: (_result, _error, { clientIdInternal }) => [{ type: 'Dashboard', id: `catalog:${clientIdInternal}` }],
    }),
    deleteDashboardView: builder.mutation<ApiResponse<void>, { dashboardViewId: string; clientIdInternal: string }>({
      query: ({ dashboardViewId }) => ({ url: `/dashboard/views/${dashboardViewId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { clientIdInternal }) => [{ type: 'Dashboard', id: `catalog:${clientIdInternal}` }],
    }),
    getRoleDashboardViews: builder.query<ApiResponse<RoleDashboardView[]>, string>({
      query: (roleId) => ({ url: `/dashboard/role/${roleId}/views`, method: 'GET' }),
      providesTags: (_result, _error, roleId) => [{ type: 'Dashboard', id: `role:${roleId}` }],
    }),
    assignRoleDashboardView: builder.mutation<ApiResponse<RoleDashboardView>, { roleId: string; dashboardViewId: string }>({
      query: ({ roleId, dashboardViewId }) => ({ url: `/dashboard/role/${roleId}/views`, method: 'POST', data: { dashboardViewId } }),
      invalidatesTags: (_result, _error, { roleId }) => [{ type: 'Dashboard', id: `role:${roleId}` }],
    }),
    revokeRoleDashboardView: builder.mutation<ApiResponse<void>, { roleId: string; dashboardViewId: string }>({
      query: ({ roleId, dashboardViewId }) => ({ url: `/dashboard/role/${roleId}/views/${dashboardViewId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { roleId }) => [{ type: 'Dashboard', id: `role:${roleId}` }],
    }),
  }),
})

export const {
  useGetDashboardViewTypesQuery,
  useGetDashboardDataQuery,
  useGetClientDashboardViewsQuery,
  useCreateClientDashboardViewMutation,
  useDeleteDashboardViewMutation,
  useGetRoleDashboardViewsQuery,
  useAssignRoleDashboardViewMutation,
  useRevokeRoleDashboardViewMutation,
} = dashboardApi
