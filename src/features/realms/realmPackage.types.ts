/** Mirrors backend src/modules/realm/realmPackage.dto.ts */

export type PackageTier = 'TRIAL' | 'STARTER' | 'GROWTH' | 'BUSINESS' | 'PRO' | 'SCALE' | 'ENTERPRISE'
export type BillingCycle = 'MONTHLY' | 'YEARLY'
export type PackageRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type PackageLogAction = 'ASSIGNED' | 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'UPDATED'

export interface PackageDefinition {
  packageDefinitionId: string
  tier: PackageTier
  billingCycle: BillingCycle
  userLimit: number | null
  concurrentLoginLimit: number | null
  price: number | null
}

export interface RealmPackageRequest {
  realmPackageRequestId: string
  realmId: string
  packageDefinition: PackageDefinition
  calculatedPrice: number | null
  recurringPrice: number | null
  status: PackageRequestStatus
  requestedByUserId: string
  resolvedByUserId: string | null
  resolvedAt: string | null
  createdAt: string
}

export interface RealmPackage {
  realmPackageId: string
  realmId: string
  activeFrom: string
  activeTo: string
  packageDefinition: PackageDefinition
  pendingRequest: RealmPackageRequest | null
}

export interface RealmPackageLog {
  realmPackageLogId: string
  action: PackageLogAction
  fromDefinitionId: string | null
  toDefinitionId: string | null
  fromActiveTo: string | null
  toActiveTo: string | null
  requestId: string | null
  performedByUserId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface AssignPackageDto {
  packageDefinitionId: string
  activeFrom?: string
  activeTo?: string
  confirmForceDowngrade?: boolean
}

export interface CreatePackageRequestDto {
  packageDefinitionId: string
}

export interface DowngradeConfirmationRequired {
  requiresConfirmation: true
  activeUserCount: number
  allowedUserCount: number
  excessCount: number
  message: string
}

export interface RequestRealmDto {
  realmName: string
  adminUsername: string
  adminEmail: string
  adminPassword: string
  captchaToken: string
}
