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
  // Effective "can the caller manage this role's client" — already true for Master,
  // computed server-side. Use this alone; don't also check isMasterRealmUser.
  isOwner: boolean
}

export interface Role {
  roleId: string
  clientIdInternal: string
  client?: RoleClientSummary
  name: string
  description?: string
  // True for the standard ADMIN/MANAGER/VIEWER/AUDITOR/USER set every client is
  // seeded with at creation — the backend refuses to delete these regardless of
  // ownership, so the delete action must stay hidden for them here too.
  seedValue?: boolean
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
