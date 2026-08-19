import { baseApi } from '@/api/baseApi'
import type { ApiResponse } from '@/api/types/common.types'
import type {
  LoginRequest,
  LoginResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  RegisterRequest,
  UserProfileDetailsDto,
} from '@/features/auth/auth.types'

const CLIENT_REALM_CODE_HEADER = 'x-client-realm-code'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<LoginResponseDto>, LoginRequest>({
      query: ({ code, ...body }) => ({
        url: '/auth/login',
        method: 'POST',
        data: body,
        headers: { [CLIENT_REALM_CODE_HEADER]: code },
      }),
    }),
    refresh: builder.mutation<ApiResponse<RefreshTokenResponseDto>, RefreshTokenDto>({
      query: (body) => ({ url: '/auth/refresh', method: 'POST', data: body }),
    }),
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    register: builder.mutation<
      ApiResponse<{ id: string; email: string; name?: string }>,
      RegisterRequest
    >({
      query: ({ code, ...body }) => ({
        url: '/auth/register',
        method: 'POST',
        data: body,
        headers: { [CLIENT_REALM_CODE_HEADER]: code },
      }),
    }),
    getMe: builder.query<ApiResponse<UserProfileDetailsDto>, void>({
      query: () => ({ url: '/auth/me', method: 'GET' }),
      providesTags: ['Me'],
    }),
  }),
})

export const {
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} = authApi
