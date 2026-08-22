/** Mirrors backend `src/modules/realm/realm.dto.ts` + the controller's actual (wider
 * than the DTO type) create-body shape, confirmed by reading realm.controller.ts. */
export interface Realm {
  realmId: string
  name: string
  enabled: boolean
  settings?: Record<string, unknown> | null
  createdAt?: string
  updatedAt?: string
  // Only populated by GET /realm/cursor-list — see RealmOrigin/RealmRequestStatus
  // in schema.prisma. Persisted columns, not derived: a MASTER_CREATED realm is
  // auto-APPROVED at creation; a PUBLIC_REQUEST realm starts PENDING_REVIEW and
  // flips to APPROVED the moment Master enables it, or REJECTED if declined.
  origin?: 'MASTER_CREATED' | 'PUBLIC_REQUEST'
  requestStatus?: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'
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
