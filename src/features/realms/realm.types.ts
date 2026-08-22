/** Mirrors backend `src/modules/realm/realm.dto.ts` + the controller's actual (wider
 * than the DTO type) create-body shape, confirmed by reading realm.controller.ts. */
export interface Realm {
  realmId: string
  name: string
  enabled: boolean
  settings?: Record<string, unknown> | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateSuperAdminDto {
  username: string
  email: string
  password: string
  enabled?: boolean
}

export interface CreateRealmDto {
  name: string
  description?: string
  settings?: Record<string, unknown>
  superAdmin: CreateSuperAdminDto
}

export interface UpdateRealmDto {
  name?: string
  enabled?: boolean
  settings?: Record<string, unknown>
}

/** Mirrors backend `src/utils/realmSettingsMeta.ts` — one entry per
 * RealmSettingKey, driving the settings form (one input rendered per entry
 * instead of a hardcoded section per key). */
export interface RealmSettingKeyMeta {
  key: string
  valueType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON'
  label: string
  sensitive: boolean
}
