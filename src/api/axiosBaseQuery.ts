import type { BaseQueryFn } from '@reduxjs/toolkit/query/react'
import type { AxiosError, AxiosRequestConfig, Method } from 'axios'
import { axiosInstance } from './axiosInstance'
import type { ApiError } from './types/common.types'

export interface AxiosBaseQueryArgs {
  url: string
  method?: Method
  data?: AxiosRequestConfig['data']
  params?: AxiosRequestConfig['params']
}

export function axiosBaseQuery(): BaseQueryFn<AxiosBaseQueryArgs, unknown, ApiError> {
  return async ({ url, method = 'GET', data, params }, api) => {
    try {
      const result = await axiosInstance({
        url,
        method,
        data,
        params,
        signal: api.signal,
      })
      return { data: result.data }
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>
      return {
        error: {
          success: false,
          status: axiosError.response?.status ?? 0,
          message:
            axiosError.response?.data?.message ?? axiosError.message ?? 'Unknown network error',
        },
      }
    }
  }
}
