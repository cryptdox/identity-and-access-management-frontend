export type ClientTypeValue = 'PUBLIC' | 'CONFIDENTIAL'

export interface Client {
  clientIdInternal: string
  realmId?: string
  clientId?: string
  name?: string | null
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
  // The caller's realm's access code for this client (ClientRealm.crAccessCode) — sent
  // as the x-cr-access-code header at login. Undefined if the caller's realm has no
  // ClientRealm row for this client.
  crAccessCode?: string
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
  name?: string | null
  secret?: string
  type?: ClientTypeValue
  redirectUris?: string[]
  enabled?: boolean
  accessTokenTTL?: number
  refreshTokenTTL?: number
}

export type ClientRedirectUriParamType = 'STRING' | 'NUMBER' | 'BOOLEAN'

export interface ClientRedirectUriParam {
  name: string
  type: ClientRedirectUriParamType
}

/** Mirrors backend `src/utils/clientRedirectUriMeta.ts` — one entry per
 * ClientRedirectUriKind, driving the redirect-URIs form (one ordered-list
 * input rendered per entry instead of a hardcoded section per kind). `param`
 * here is only the seed shown when a kind has never been customized — the
 * authoritative, admin-edited schema comes back per-client from
 * GET .../redirect-uris. */
export interface ClientRedirectUriKindMeta {
  kind: string
  label: string
  param: ClientRedirectUriParam[]
}

/** One kind's stored state — GET/PUT .../redirect-uris both use this shape,
 * keyed by ClientRedirectUriKind. */
export interface ClientRedirectUriKindData {
  values: string[]
  param: ClientRedirectUriParam[]
}
