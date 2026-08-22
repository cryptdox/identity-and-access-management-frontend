import type { BaseQueryFn } from '@reduxjs/toolkit/query/react'
import type { AxiosError, AxiosRequestConfig, Method } from 'axios'
import { axiosInstance } from './axiosInstance'
import type { ApiError } from './types/common.types'

export interface AxiosBaseQueryArgs {
  url: string
  method?: Method
  data?: AxiosRequestConfig['data']
  params?: AxiosRequestConfig['params']
  headers?: AxiosRequestConfig['headers']
}

export function axiosBaseQuery(): BaseQueryFn<AxiosBaseQueryArgs, unknown, ApiError> {
  return async ({ url, method = 'GET', data, params, headers }, api) => {
    try {
      const result = await axiosInstance({
        url,
        method,
        data,
        params,
        headers,
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
          data: axiosError.response?.data?.data,
        },
      }
    }
  }
}
