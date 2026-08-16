export interface Group {
  groupId: string
  realmId: string
  name: string
  parentId?: string | null
  createdAt?: string
  updatedAt?: string | null
  parent?: { groupId: string; name: string } | null
  children?: { groupId: string; name: string }[]
}

export interface CreateGroupDto {
  realmId: string
  name: string
  parentId?: string
}

export interface UpdateGroupDto {
  name?: string
  parentId?: string | null
}

export interface GroupRole {
  groupId: string
  roleId: string
  group?: { groupId: string; name: string }
  role?: { roleId: string; name: string }
}
