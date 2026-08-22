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

const CR_ACCESS_CODE_HEADER = 'x-cr-access-code'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<LoginResponseDto>, LoginRequest>({
      query: ({ crAccessCode, ...body }) => ({
        url: '/auth/login',
        method: 'POST',
        data: body,
        headers: { [CR_ACCESS_CODE_HEADER]: crAccessCode },
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
      query: ({ crAccessCode, ...body }) => ({
        url: '/auth/register',
        method: 'POST',
        data: body,
        headers: { [CR_ACCESS_CODE_HEADER]: crAccessCode },
      }),
    }),
    getMe: builder.query<ApiResponse<UserProfileDetailsDto>, void>({
      query: () => ({ url: '/auth/me', method: 'GET' }),
      providesTags: ['Me'],
    }),
    updateProfile: builder.mutation<ApiResponse<UserProfileDetailsDto>, { name?: string }>({
      query: (body) => ({ url: '/auth/me', method: 'PUT', data: body }),
      invalidatesTags: ['Me'],
    }),
    changePassword: builder.mutation<ApiResponse<null>, { oldPassword: string; newPassword: string }>({
      query: (body) => ({ url: '/auth/change-password', method: 'POST', data: body }),
    }),
    resendVerifyEmail: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: '/auth/verify-email/resend', method: 'POST' }),
    }),
    // Public — called from the emailed-link landing page, before the visitor is
    // necessarily logged in as anyone in particular.
    verifyEmail: builder.query<ApiResponse<boolean>, string>({
      query: (token) => ({ url: '/auth/verify-email', method: 'GET', params: { token } }),
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
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useResendVerifyEmailMutation,
  useVerifyEmailQuery,
} = authApi
