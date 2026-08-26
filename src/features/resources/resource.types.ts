import type { TypeResource } from '@/api/types/enums.types'

export interface Resource {
  resourceId: string
  name: string
  type: TypeResource
  // Custom, per-resource action-type list — free-form strings, not limited to
  // the fixed TypeAction set.
  actions: string[]
  realmId?: string
  clientId?: string
  createdAt?: string
  updatedAt?: string
}

export interface PermissionInput {
  type: TypeResource
  actions: string[]
}

export interface ResourceInput {
  name: string
  permissions: PermissionInput[]
}

export interface CreateResourceDto {
  clientId: string
  resources: ResourceInput[]
}

export interface UpdateResourceDto {
  name?: string
  type?: TypeResource
  // Full replacement of the resource's action list — actions removed here
  // cascade-delete their Permission (and RolePermission) rows server-side.
  actions?: string[]
}

export interface BulkUpdateResourceItem {
  resourceId: string
  name?: string
  type?: TypeResource
  actions?: string[]
}

export interface BulkUpdateResourceDto {
  resources: BulkUpdateResourceItem[]
}
