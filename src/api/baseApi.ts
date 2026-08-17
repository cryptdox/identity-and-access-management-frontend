import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './axiosBaseQuery'

export const apiTagTypes = [
  'Realm',
  'User',
  'UserAttribute',
  'Credential',
  'UserSession',
  'RefreshToken',
  'Group',
  'GroupRole',
  'UserGroup',
  'UserRole',
  'Role',
  'RoleComposite',
  'Client',
  'Resource',
  'Permission',
  'Event',
  'Me',
] as const

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: apiTagTypes,
  endpoints: () => ({}),
})
