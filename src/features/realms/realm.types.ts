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
