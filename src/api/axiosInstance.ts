import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { tokenManager } from './tokenManager'
import { getStoreRef } from './storeAccessor'
import { authActions } from '@/features/auth/authSlice'
import type { ApiResponse } from './types/common.types'
import type { RefreshTokenResponseDto } from '@/features/auth/auth.types'

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000/api'

/** Backend message for the "Redis-cached per-realm JWT secret expired independently of
 * the JWT itself" case — must be treated exactly like a 401 "Token expired". */
const JWT_SECRET_MISSING_MESSAGE =
  'JWT secret not configured in Redis, supposed to be erased after token expire.'

const NO_RETRY_URL_FRAGMENTS = ['/auth/login', '/auth/refresh', '/auth/register']

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

export const axiosInstance = axios.create({ baseURL: API_BASE_URL })

/** Bare client for the refresh call itself — must not go through the response
 * interceptor below, or a failed refresh would try to refresh itself. */
const refreshClient = axios.create({ baseURL: API_BASE_URL })

axiosInstance.interceptors.request.use((config) => {
  const token = tokenManager.get()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

function isNoRetryUrl(url?: string): boolean {
  if (!url) return false
  return NO_RETRY_URL_FRAGMENTS.some((fragment) => url.includes(fragment))
}

function isAuthExpiredError(error: AxiosError<{ message?: string }>): boolean {
  const status = error.response?.status
  const message = error.response?.data?.message
  if (status === 401) return true
  if (status === 500 && message === JWT_SECRET_MISSING_MESSAGE) return true
  return false
}

function forceSessionExpired() {
  const store = getStoreRef()
  tokenManager.clear()
  store.dispatch(authActions.sessionExpired())
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login?sessionExpired=1'
  }
}

let isRefreshing = false
type QueueItem = { resolve: (token: string) => void; reject: (error: unknown) => void }
let failedQueue: QueueItem[] = []

function flushQueue(error: unknown, token: string | null) {
  for (const { resolve, reject } of failedQueue) {
    if (error || !token) reject(error)
    else resolve(token)
  }
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as RetryableConfig | undefined

    if (
      !originalRequest ||
      !isAuthExpiredError(error) ||
      isNoRetryUrl(originalRequest.url) ||
      originalRequest._retry
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest._retry = true
        originalRequest.headers.set('Authorization', `Bearer ${token}`)
        return axiosInstance(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    const store = getStoreRef()
    const refreshToken = store.getState().auth.refreshToken

    if (!refreshToken) {
      isRefreshing = false
      forceSessionExpired()
      return Promise.reject(error)
    }

    try {
      const response = await refreshClient.post<ApiResponse<RefreshTokenResponseDto>>(
        '/auth/refresh',
        { refreshToken },
      )
      const tokens = response.data.data
      if (!tokens) throw new Error('Refresh response missing token data')

      tokenManager.set(tokens.accessToken)
      store.dispatch(authActions.tokensRotated({ refreshToken: tokens.refreshToken }))
      flushQueue(null, tokens.accessToken)

      originalRequest.headers.set('Authorization', `Bearer ${tokens.accessToken}`)
      return axiosInstance(originalRequest)
    } catch (refreshError) {
      flushQueue(refreshError, null)
      forceSessionExpired()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
