export interface UserGroup {
  userId: string
  groupId: string
  joinedAt?: string
  user?: { userId: string; name?: string; username: string; email: string }
  group?: { groupId: string; name: string }
}
