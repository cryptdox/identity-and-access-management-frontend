export interface RefreshToken {
  refreshTokenId: string
  userId: string
  user?: { userId: string; name?: string; username: string; email: string }
  sessionId: string
  clientIdInternal: string
  client?: { clientIdInternal: string; name: string | null; clientId: string }
  expiresAt: string
  revoked: boolean
  createdAt?: string
  updatedAt?: string | null
}
