import { useEffect, useState } from 'react'
import {
  useGetRealmPackageQuery,
  useGetRealmPackageHistoryQuery,
  useListAuthenticatedPackageDefinitionsQuery,
  useCreatePackageRequestMutation,
  useApprovePackageRequestMutation,
  useRejectPackageRequestMutation,
  useAssignRealmPackageMutation,
} from '@/api/endpoints/realm.api'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { confirm } from '@/common/utils/confirm'
import { formatDate, formatDateTime } from '@/common/utils/formatDate'
import { Select } from '@/common/components/ui/Select'
import { Input } from '@/common/components/ui/Input'
import { Button } from '@/common/components/ui/Button'
import { Badge } from '@/common/components/ui/Badge'
import { Skeleton } from '@/common/components/ui/Skeleton'
import type { DowngradeConfirmationRequired, PackageDefinition } from '@/features/realms/realmPackage.types'

function definitionLabel(d: PackageDefinition): string {
  const price = d.price == null ? 'Contact us' : `$${d.price}/${d.billingCycle === 'YEARLY' ? 'yr' : 'mo'}`
  return `${d.tier} (${d.billingCycle}) — ${price}`
}

function formatAmount(amount: number): string {
  return amount >= 0 ? `$${amount.toFixed(2)}` : `-$${Math.abs(amount).toFixed(2)}`
}

// A downgrade that would exceed the new plan's user limit comes back as a 409
// carrying { requiresConfirmation, ... } in ApiError.data instead of applying —
// see realmPackage.service.ts's applyToRealm on the backend.
function asDowngradeConfirmation(err: unknown): DowngradeConfirmationRequired | null {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: unknown }).data
    if (data && typeof data === 'object' && 'requiresConfirmation' in data) {
      return data as DowngradeConfirmationRequired
    }
  }
  return null
}

export function RealmPackageTab({ realmId }: { realmId: string }) {
  const { isMasterRealmUser } = useCurrentUser()
  const toast = useToast()

  const { data: pkgData, isLoading: isPkgLoading } = useGetRealmPackageQuery(realmId)
  const { data: definitionsData } = useListAuthenticatedPackageDefinitionsQuery()
  const { data: historyData } = useGetRealmPackageHistoryQuery(realmId, { skip: !isMasterRealmUser })

  const [createRequest, { isLoading: isRequesting }] = useCreatePackageRequestMutation()
  const [approveRequest, { isLoading: isApproving }] = useApprovePackageRequestMutation()
  const [rejectRequest, { isLoading: isRejecting }] = useRejectPackageRequestMutation()
  const [assignPackage, { isLoading: isAssigning }] = useAssignRealmPackageMutation()

  const [selectedDefinitionId, setSelectedDefinitionId] = useState('')
  const [requestCount, setRequestCount] = useState('1')
  const [customDefinitionId, setCustomDefinitionId] = useState('')
  const [assignCount, setAssignCount] = useState('1')

  const pkg = pkgData?.data
  const definitions = definitionsData?.data?.items ?? []
  const history = historyData?.data ?? []

  // Both pickers default to whichever catalog row matches the realm's
  // current plan (tier + billingCycle) once it's loaded, so "Choose a plan"
  // never starts on an arbitrary/empty selection — a no-op change would just
  // be a renewal request/assign, not an error. Only sets it once (skipped
  // once the user has picked anything, including re-picking the same value).
  useEffect(() => {
    if (!pkg?.currentPackage || definitions.length === 0) return
    // TRIAL is never a pickable option (see assignableDefinitions below) —
    // a realm still on its trial has nothing sensible to default to, so it's
    // deliberately left on the placeholder in that case.
    const match = definitions.find(
      (d) => d.tier !== 'TRIAL' && d.tier === pkg.currentPackage!.tier && d.billingCycle === pkg.currentPackage!.billingCycle,
    )
    if (!match) return
    setSelectedDefinitionId((prev) => prev || match.packageDefinitionId)
    setCustomDefinitionId((prev) => prev || match.packageDefinitionId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkg?.currentPackage?.tier, pkg?.currentPackage?.billingCycle, definitions])

  async function confirmDowngrade(confirmation: DowngradeConfirmationRequired): Promise<boolean> {
    return confirm({
      title: 'Confirm downgrade',
      message: confirmation.message,
      confirmLabel: 'Deactivate & apply',
      danger: true,
    })
  }

  async function handleRequestChange() {
    if (!selectedDefinitionId) return
    try {
      const count = Math.max(1, Number(requestCount) || 1)
      await createRequest({ realmId, body: { packageDefinitionId: selectedDefinitionId, count } }).unwrap()
      toast.success('Plan change request submitted')
      setSelectedDefinitionId('')
      setRequestCount('1')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to submit request'))
    }
  }

  async function handleApprove(confirmForceDowngrade?: boolean) {
    if (!pkg?.pendingRequest) return
    try {
      await approveRequest({ realmId, requestId: pkg.pendingRequest.realmPackageRequestId, confirmForceDowngrade }).unwrap()
      toast.success('Package request approved')
    } catch (err) {
      const confirmation = asDowngradeConfirmation(err)
      if (confirmation) {
        if (await confirmDowngrade(confirmation)) await handleApprove(true)
        return
      }
      toast.error(getApiErrorMessage(err, 'Failed to approve request'))
    }
  }

  async function handleReject() {
    if (!pkg?.pendingRequest) return
    try {
      await rejectRequest({ realmId, requestId: pkg.pendingRequest.realmPackageRequestId }).unwrap()
      toast.success('Package request rejected')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to reject request'))
    }
  }

  async function handleCustomAssign(confirmForceDowngrade?: boolean) {
    if (!customDefinitionId) return
    try {
      const count = Math.max(1, Number(assignCount) || 1)
      await assignPackage({ realmId, body: { packageDefinitionId: customDefinitionId, count, confirmForceDowngrade } }).unwrap()
      toast.success('Package updated')
      setCustomDefinitionId('')
      setAssignCount('1')
    } catch (err) {
      const confirmation = asDowngradeConfirmation(err)
      if (confirmation) {
        if (await confirmDowngrade(confirmation)) await handleCustomAssign(true)
        return
      }
      toast.error(getApiErrorMessage(err, 'Failed to update package'))
    }
  }

  if (isPkgLoading || !pkg) {
    return <Skeleton className="h-40 w-full max-w-lg" />
  }

  // TRIAL is excluded — it's only ever granted automatically when a realm is
  // first created (never a request/assign target, and the backend rejects it
  // either way; see realmPackage.service.ts). Requesting the SAME
  // non-TRIAL plan is still valid — a renewal, not filtered out — the
  // backend detects it (isRenewal) and charges the full recurring price
  // instead of prorating, extending the expiry instead of resetting it.
  const assignableDefinitions = definitions.filter((d) => d.tier !== 'TRIAL')
  const requestPickerOptions = assignableDefinitions.map((d) => ({ value: d.packageDefinitionId, label: definitionLabel(d) }))
  const assignPickerOptions = assignableDefinitions.map((d) => ({ value: d.packageDefinitionId, label: definitionLabel(d) }))

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-sm font-medium text-text">Current plan</p>
        <div className="mt-2 grid grid-cols-[140px_1fr] gap-y-1.5 text-sm">
          <span className="text-text-secondary">Tier</span>
          <span className="text-text">
            {pkg.currentPackage ? `${pkg.currentPackage.tier} (${pkg.currentPackage.billingCycle})` : '—'}
          </span>
          <span className="text-text-secondary">User limit</span>
          <span className="text-text">{pkg.currentPackage?.userLimit ?? 'Unlimited'}</span>
          <span className="text-text-secondary">Concurrent logins</span>
          <span className="text-text">{pkg.currentPackage?.concurrentLoginLimit ?? 'Unlimited'}</span>
          <span className="text-text-secondary">Expires</span>
          <span className="text-text">{pkg.packageExpiresAt ? formatDate(pkg.packageExpiresAt) : '—'}</span>
          {pkg.packagePaidAmount != null && (
            <>
              <span className="text-text-secondary">Last paid amount</span>
              <span className="text-text">{formatAmount(pkg.packagePaidAmount)}</span>
            </>
          )}
        </div>
      </div>

      {pkg.pendingRequest ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium text-text">
            {pkg.pendingRequest.isRenewal ? 'Pending plan renewal' : 'Pending plan change request'}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Requested: {pkg.pendingRequest.packageDefinition.tier} ({pkg.pendingRequest.packageDefinition.billingCycle})
          </p>
          {pkg.pendingRequest.recurringPrice != null && (
            <div className="mt-2 grid grid-cols-[140px_1fr] gap-y-1 text-sm">
              <span className="text-text-secondary">Original price</span>
              <span className="text-text">
                {formatAmount(pkg.pendingRequest.recurringPrice)}/{pkg.pendingRequest.packageDefinition.billingCycle === 'YEARLY' ? 'yr' : 'mo'}
              </span>
              <span className="text-text-secondary">Adjusted amount</span>
              <span className="text-text">
                {pkg.pendingRequest.calculatedPrice == null
                  ? 'Contact us'
                  : pkg.pendingRequest.isRenewal
                    ? `${formatAmount(pkg.pendingRequest.calculatedPrice)} (renewal, no proration)`
                    : pkg.pendingRequest.calculatedPrice > 0
                      ? `${formatAmount(pkg.pendingRequest.calculatedPrice)} due now`
                      : `$0.00 (no refund — leftover balance added as extra time)`}
              </span>
              <span className="text-text-secondary">Cycles requested</span>
              <span className="text-text">{pkg.pendingRequest.requestedCycleCount}</span>
              <span className="text-text-secondary">Duration once approved</span>
              <span className="text-text">
                {pkg.pendingRequest.resolvedDurationDays == null ? 'Set manually' : `${pkg.pendingRequest.resolvedDurationDays} days`}
              </span>
            </div>
          )}
          <div className="mt-2">
            <Badge tone="warning">Pending Master&apos;s review</Badge>
          </div>

          {isMasterRealmUser && (
            <div className="mt-3 flex gap-2">
              <Button size="sm" loading={isApproving} onClick={() => void handleApprove()}>
                Approve
              </Button>
              <Button size="sm" variant="outline" loading={isRejecting} onClick={() => void handleReject()}>
                Reject
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface-alt/50 p-4">
          <p className="text-sm font-medium text-text">Request a plan change or renewal</p>
          <div className="mt-3 flex flex-col gap-3">
            <Select
              value={selectedDefinitionId}
              onChange={(e) => setSelectedDefinitionId(e.target.value)}
              options={requestPickerOptions}
              placeholder="Choose a plan"
            />
            <Input
              label="Cycles"
              type="number"
              min={1}
              value={requestCount}
              onChange={(e) => setRequestCount(e.target.value)}
              hint="e.g. 4 on a monthly plan requests 4 months at once"
            />
            <Button
              size="sm"
              className="w-fit"
              disabled={!selectedDefinitionId}
              loading={isRequesting}
              onClick={() => void handleRequestChange()}
            >
              Submit request
            </Button>
          </div>
        </div>
      )}

      {isMasterRealmUser && (
        <>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm font-medium text-text">Custom assign (Master only)</p>
            <p className="mt-1 text-sm text-text-secondary">Directly set this realm&apos;s package, bypassing any request.</p>
            <div className="mt-3 flex flex-col gap-3">
              <Select
                value={customDefinitionId}
                onChange={(e) => setCustomDefinitionId(e.target.value)}
                options={assignPickerOptions}
                placeholder="Choose a plan"
              />
              <Input
                label="Cycles"
                type="number"
                min={1}
                value={assignCount}
                onChange={(e) => setAssignCount(e.target.value)}
              />
              <Button
                size="sm"
                variant="outline"
                className="w-fit"
                disabled={!customDefinitionId}
                loading={isAssigning}
                onClick={() => void handleCustomAssign()}
              >
                Assign
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm font-medium text-text">Package history</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {history.length === 0 && <li className="text-text-secondary">No history yet.</li>}
              {history.map((h) => (
                <li
                  key={h.realmPackageLogId}
                  className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0 last:pb-0"
                >
                  <span className="text-text">{h.action}</span>
                  <span className="text-text-secondary">{formatDateTime(h.createdAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
