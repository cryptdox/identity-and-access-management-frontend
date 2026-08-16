export type ClientTypeValue = 'PUBLIC' | 'CONFIDENTIAL'

export interface Client {
  clientIdInternal: string
  realmId?: string
  clientId?: string
  name?: string
  secret?: string | null
  type?: ClientTypeValue
  redirectUris?: string[] | null
  enabled?: boolean
  accessTokenTTL?: number
  refreshTokenTTL?: number
  createdAt?: string
  updatedAt: string
}

export interface CreateClientDto {
  realmId: string
  clientId: string
  secret?: string
  name?: string
  type: ClientTypeValue
  redirectUris?: string[]
  enabled?: boolean
  accessTokenTTL?: number
  refreshTokenTTL?: number
}

export interface UpdateClientDto {
  clientId?: string
  secret?: string
  type?: ClientTypeValue
  redirectUris?: string[]
  enabled?: boolean
  accessTokenTTL?: number
  refreshTokenTTL?: number
}

export interface ClientRole {
  clientIdInternal: string
  roleId: string
  client?: { clientIdInternal: string; clientId: string; name?: string | null }
  role?: { roleId: string; name: string }
}
