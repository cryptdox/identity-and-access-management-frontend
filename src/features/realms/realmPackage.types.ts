/** Mirrors backend src/modules/realm/realmPackage.dto.ts */

export type PackageTier = 'TRIAL' | 'STARTER' | 'GROWTH' | 'BUSINESS' | 'PRO' | 'SCALE' | 'ENTERPRISE'
export type BillingCycle = 'MONTHLY' | 'YEARLY'
export type PackageRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type PackageLogAction = 'ASSIGNED' | 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'UPDATED'
export type PackageDefinitionLogAction = 'CREATED' | 'UPDATED' | 'ACTIVATED' | 'DEACTIVATED'

export interface PackageDefinition {
  packageDefinitionId: string
  tier: PackageTier
  billingCycle: BillingCycle
  userLimit: number | null
  concurrentLoginLimit: number | null
  price: number | null
  isActive: boolean
}

// Master-only — adds a new tier/billing-cycle combo to the catalog.
export interface CreatePackageDefinitionDto {
  tier: PackageTier
  billingCycle: BillingCycle
  userLimit: number | null
  concurrentLoginLimit: number | null
  price: number | null
  isActive?: boolean
}

// Master-only — tier/billingCycle are immutable once created.
export interface UpdatePackageDefinitionDto {
  userLimit?: number | null
  concurrentLoginLimit?: number | null
  price?: number | null
  isActive?: boolean
}

// GET /package/definition-logs — catalog-level change feed (create/update/
// activate/deactivate a definition), distinct from RealmPackageLog which
// tracks a realm's own package lifecycle instead.
export interface PackageDefinitionLog {
  packageDefinitionLogId: string
  packageDefinitionId: string
  packageDefinition: PackageDefinition
  action: PackageDefinitionLogAction
  changes: Record<string, { from: unknown; to: unknown }> | null
  performedByUserId: string | null
  createdAt: string
}

// Shape stored on RealmPackageRequest.requestedSnapshot / RealmPackageLog's
// fromSnapshot/toSnapshot — a definition's fields at a point in time.
export interface PackageDefinitionSnapshot {
  tier: PackageTier
  billingCycle: BillingCycle
  userLimit: number | null
  concurrentLoginLimit: number | null
  price: number | null
  isActive: boolean
}

// Shape stored on Realm.currentPackage — the same snapshot plus the expiry
// date, a complete self-contained record of the realm's plan.
export interface CurrentPackage extends PackageDefinitionSnapshot {
  expiresAt: string
}

export interface RealmPackageRequest {
  realmPackageRequestId: string
  realmId: string
  packageDefinition: PackageDefinition
  requestedSnapshot: PackageDefinitionSnapshot | null
  // Same tier+billingCycle as the realm's plan at request time — a renewal
  // (full recurringPrice, extends the expiry) rather than an upgrade/downgrade
  // (prorated calculatedPrice, resets the cycle from approval).
  isRenewal: boolean
  // How many billing cycles this request covers (e.g. 4 on a MONTHLY plan = 4 months).
  requestedCycleCount: number
  // Total days to grant once approved, including any no-refund
  // balance-to-time extension — null only for a price-less "contact us" target.
  resolvedDurationDays: number | null
  // The adjusted amount actually due — never negative (no refunds; a
  // downgrade's leftover balance becomes extra resolvedDurationDays instead
  // of a credit) — "original vs adjusted" alongside recurringPrice.
  calculatedPrice: number | null
  // The target plan's own full, un-prorated sticker price for requestedCycleCount cycles.
  recurringPrice: number | null
  status: PackageRequestStatus
  requestedByUserId: string
  resolvedByUserId: string | null
  resolvedAt: string | null
  createdAt: string
}

// The realm's current plan — folded directly onto Realm, no separate table.
export interface RealmPackage {
  realmId: string
  currentPackage: CurrentPackage | null
  packageExpiresAt: string | null
  packageCalculatedPrice: number | null
  packagePaidAmount: number | null
  pendingRequest: RealmPackageRequest | null
}

export interface RealmPackageLog {
  realmPackageLogId: string
  realmId: string
  action: PackageLogAction
  fromDefinitionId: string | null
  toDefinitionId: string | null
  fromSnapshot: PackageDefinitionSnapshot | null
  toSnapshot: PackageDefinitionSnapshot | null
  fromActiveTo: string | null
  toActiveTo: string | null
  requestId: string | null
  performedByUserId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface AssignPackageDto {
  packageDefinitionId: string
  count?: number
  activeFrom?: string
  activeTo?: string
  confirmForceDowngrade?: boolean
}

export interface CreatePackageRequestDto {
  packageDefinitionId: string
  count?: number
}

export interface DowngradeConfirmationRequired {
  requiresConfirmation: true
  activeUserCount: number
  allowedUserCount: number
  excessCount: number
  message: string
}

// GET /package/requests (Packages module, cursor-paginated) needs the realm's
// name alongside each request — Master is looking at requests from many
// tenants at once here, unlike one realm's own Package tab.
export interface RealmPackageRequestWithRealm extends RealmPackageRequest {
  realmName: string
}

// GET /package/assigned — every realm's current package, name attached.
export interface RealmPackageWithRealm {
  realmId: string
  realmName: string
  currentPackage: CurrentPackage | null
  packageExpiresAt: string | null
}

// GET /package/logs — every realm's package lifecycle log, name attached.
export interface RealmPackageLogWithRealm extends RealmPackageLog {
  realmName: string
}

export interface CursorPage<T> {
  items: T[]
  nextCursor: string | null
}

export interface RequestRealmDto {
  realmName: string
  adminUsername: string
  adminEmail: string
  adminPassword: string
  captchaToken: string
}
