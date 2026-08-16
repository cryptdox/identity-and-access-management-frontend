import type { TypeEvent } from '@/api/types/enums.types'

export interface Event {
  eventId: string
  realmId: string
  clientIdInternal?: string | null
  userId?: string | null
  type: TypeEvent
  ipAddress?: string | null
  metadata?: Record<string, unknown> | null
  createdAt?: string
}
