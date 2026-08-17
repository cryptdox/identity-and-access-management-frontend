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
  // Effective "can the caller manage this client" (already true for Master) —
  // computed server-side from ClientRealm.isOwner relative to the caller's own realm.
  isOwner?: boolean
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
