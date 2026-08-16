import { baseApi } from '@/api/baseApi'
import type { ApiResponse } from '@/api/types/common.types'
import type {
  LoginDto,
  LoginResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  RegisterDto,
  UserProfileDetailsDto,
} from '@/features/auth/auth.types'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<LoginResponseDto>, LoginDto>({
      query: (body) => ({ url: '/auth/login', method: 'POST', data: body }),
    }),
    refresh: builder.mutation<ApiResponse<RefreshTokenResponseDto>, RefreshTokenDto>({
      query: (body) => ({ url: '/auth/refresh', method: 'POST', data: body }),
    }),
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    register: builder.mutation<
      ApiResponse<{ id: string; email: string; name?: string }>,
      RegisterDto
    >({
      query: (body) => ({ url: '/auth/register', method: 'POST', data: body }),
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
