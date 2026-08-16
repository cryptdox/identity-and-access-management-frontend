import type { TypeAction, TypeResource } from '@/api/types/enums.types'

export interface Resource {
  resourceId: string
  name: string
  type: TypeResource
  realmId?: string
  clientId?: string
  createdAt?: string
  updatedAt?: string
}

export interface PermissionInput {
  type: TypeResource
  actions: TypeAction[]
}

export interface ResourceInput {
  name: string
  permissions: PermissionInput[]
}

export interface CreateResourceDto {
  clientId: string
  resources: ResourceInput[]
}

export interface BulkUpdateResourceItem {
  resourceId: string
  name?: string
  type?: TypeResource
  actions?: TypeAction[]
}

export interface BulkUpdateResourceDto {
  resources: BulkUpdateResourceItem[]
}
