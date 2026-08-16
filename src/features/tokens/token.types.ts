export interface RefreshToken {
  refreshTokenId: string
  userId: string
  sessionId: string
  expiresAt: string
  revoked: boolean
  createdAt?: string
  updatedAt?: string | null
}
