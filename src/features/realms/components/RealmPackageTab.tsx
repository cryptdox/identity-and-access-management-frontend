import { useState } from 'react'
import {
  useGetRealmPackageQuery,
  useGetRealmPackageHistoryQuery,
  useListPackageDefinitionsQuery,
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
import { Button } from '@/common/components/ui/Button'
import { Badge } from '@/common/components/ui/Badge'
import { Skeleton } from '@/common/components/ui/Skeleton'
import type { DowngradeConfirmationRequired, PackageDefinition } from '@/features/realms/realmPackage.types'

function definitionLabel(d: PackageDefinition): string {
  const price = d.price == null ? 'Contact us' : `$${d.price}/${d.billingCycle === 'YEARLY' ? 'yr' : 'mo'}`
  return `${d.tier} (${d.billingCycle}) — ${price}`
}

// A downgrade that would exceed the new plan's user limit comes back as a 409
// carrying { requiresConfirmation, ... } in ApiError.data instead of applying —
// see realmPackage.service.ts's applyPackageChangeOrConfirm on the backend.
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
  const { data: definitionsData } = useListPackageDefinitionsQuery()
  const { data: historyData } = useGetRealmPackageHistoryQuery(realmId, { skip: !isMasterRealmUser })

  const [createRequest, { isLoading: isRequesting }] = useCreatePackageRequestMutation()
  const [approveRequest, { isLoading: isApproving }] = useApprovePackageRequestMutation()
  const [rejectRequest, { isLoading: isRejecting }] = useRejectPackageRequestMutation()
  const [assignPackage, { isLoading: isAssigning }] = useAssignRealmPackageMutation()

  const [selectedDefinitionId, setSelectedDefinitionId] = useState('')
  const [customDefinitionId, setCustomDefinitionId] = useState('')

  const pkg = pkgData?.data
  const definitions = definitionsData?.data ?? []
  const history = historyData?.data ?? []

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
      await createRequest({ realmId, body: { packageDefinitionId: selectedDefinitionId } }).unwrap()
      toast.success('Plan change request submitted')
      setSelectedDefinitionId('')
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
      await assignPackage({ realmId, body: { packageDefinitionId: customDefinitionId, confirmForceDowngrade } }).unwrap()
      toast.success('Package updated')
      setCustomDefinitionId('')
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

  const requestPickerOptions = definitions
    .filter((d) => d.packageDefinitionId !== pkg.packageDefinition.packageDefinitionId)
    .map((d) => ({ value: d.packageDefinitionId, label: definitionLabel(d) }))
  const assignPickerOptions = definitions.map((d) => ({ value: d.packageDefinitionId, label: definitionLabel(d) }))

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-sm font-medium text-text">Current plan</p>
        <div className="mt-2 grid grid-cols-[140px_1fr] gap-y-1.5 text-sm">
          <span className="text-text-secondary">Tier</span>
          <span className="text-text">
            {pkg.packageDefinition.tier} ({pkg.packageDefinition.billingCycle})
          </span>
          <span className="text-text-secondary">User limit</span>
          <span className="text-text">{pkg.packageDefinition.userLimit ?? 'Unlimited'}</span>
          <span className="text-text-secondary">Concurrent logins</span>
          <span className="text-text">{pkg.packageDefinition.concurrentLoginLimit ?? 'Unlimited'}</span>
          <span className="text-text-secondary">Active until</span>
          <span className="text-text">{formatDate(pkg.activeTo)}</span>
        </div>
      </div>

      {pkg.pendingRequest ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium text-text">Pending plan change request</p>
          <p className="mt-1 text-sm text-text-secondary">
            Requested: {pkg.pendingRequest.packageDefinition.tier} ({pkg.pendingRequest.packageDefinition.billingCycle})
          </p>
          {pkg.pendingRequest.calculatedPrice != null && (
            <p className="mt-1 text-sm text-text-secondary">
              {pkg.pendingRequest.calculatedPrice >= 0
                ? `Due now: $${pkg.pendingRequest.calculatedPrice.toFixed(2)}`
                : `Credit: $${Math.abs(pkg.pendingRequest.calculatedPrice).toFixed(2)}`}
              {pkg.pendingRequest.recurringPrice != null &&
                ` — then $${pkg.pendingRequest.recurringPrice}/${pkg.pendingRequest.packageDefinition.billingCycle === 'YEARLY' ? 'yr' : 'mo'}`}
            </p>
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
          <p className="text-sm font-medium text-text">Request a plan change</p>
          <div className="mt-3 flex flex-col gap-3">
            <Select
              value={selectedDefinitionId}
              onChange={(e) => setSelectedDefinitionId(e.target.value)}
              options={requestPickerOptions}
              placeholder="Choose a plan"
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
