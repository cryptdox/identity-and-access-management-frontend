import type { ResourceName, TypeAction, TypeResource } from '@/api/types/enums.types'

export interface PermissionResource {
  resourceId: string
  name: ResourceName
  type: TypeResource
  clientIdInternal: string
}

export interface Permission {
  permissionId: string
  action: TypeAction
  resourceId: string
  resource: PermissionResource
}

export interface RoleClientSummary {
  clientIdInternal: string
  clientId: string
  name: string | null
}

export interface Role {
  roleId: string
  clientIdInternal: string
  client?: RoleClientSummary
  name: string
  description?: string
  permissions: Permission[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateRoleDto {
  clientIdInternal: string
  name: string
  description?: string
}

export interface UpdateRoleDto {
  name?: string
  description?: string
}

export interface RoleComposite {
  roleId: string
  compositeRoleId: string
  role?: { roleId: string; name: string }
  compositeRole?: { roleId: string; name: string }
}
