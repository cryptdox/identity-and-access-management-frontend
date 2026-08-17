export interface UserRole {
  userId: string
  roleId: string
  createdAt?: string
  updatedAt?: string | null
  user?: { userId: string; username: string; email: string }
  role?: { roleId: string; name: string; client?: { clientIdInternal: string; clientId: string } }
}
