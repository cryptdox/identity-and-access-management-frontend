import type { ResourceName, TypeAction, TypeResource } from '@/api/types/enums.types'

export interface PermissionResource {
  resourceId: string
  name: ResourceName
  type: TypeResource
  clientId?: string
}

export interface Permission {
  permissionId: string
  action: TypeAction
  resourceId: string
  resource: PermissionResource
}

export interface Role {
  roleId: string
  name: string
  description?: string
  permissions: Permission[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateRoleDto {
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
