import { useEffect, useState } from 'react'
import { useCreatePackageDefinitionMutation, useUpdatePackageDefinitionMutation } from '@/api/endpoints/package.api'
import { Modal } from '@/common/components/ui/Modal'
import { Input } from '@/common/components/ui/Input'
import { Select } from '@/common/components/ui/Select'
import { Button } from '@/common/components/ui/Button'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import type { PackageDefinition, PackageTier, BillingCycle } from '@/features/realms/realmPackage.types'

const TIER_OPTIONS: { value: PackageTier; label: string }[] = [
  { value: 'TRIAL', label: 'Trial' },
  { value: 'STARTER', label: 'Starter' },
  { value: 'GROWTH', label: 'Growth' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'PRO', label: 'Pro' },
  { value: 'SCALE', label: 'Scale' },
  { value: 'ENTERPRISE', label: 'Enterprise' },
]

const CYCLE_OPTIONS: { value: BillingCycle; label: string }[] = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
]

/** Shared create/edit form for a catalog row. tier + billingCycle are the
 * row's identity (unique key, and already referenced by any realm on it), so
 * they're only settable at creation — editing locks them and only allows
 * changing limits, price, and active state. */
export function PackageDefinitionFormModal({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing: PackageDefinition | null
}) {
  const [createDefinition, { isLoading: isCreating }] = useCreatePackageDefinitionMutation()
  const [updateDefinition, { isLoading: isUpdating }] = useUpdatePackageDefinitionMutation()
  const toast = useToast()

  const [tier, setTier] = useState<PackageTier>(editing?.tier ?? 'STARTER')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(editing?.billingCycle ?? 'MONTHLY')
  const [userLimit, setUserLimit] = useState(editing?.userLimit != null ? String(editing.userLimit) : '')
  const [concurrentLoginLimit, setConcurrentLoginLimit] = useState(
    editing?.concurrentLoginLimit != null ? String(editing.concurrentLoginLimit) : '',
  )
  const [price, setPrice] = useState(editing?.price != null ? String(editing.price) : '')
  const [isActive, setIsActive] = useState(editing?.isActive ?? true)

  // This modal never unmounts between opens (always rendered by the parent,
  // just hidden) — the useState initializers above only ever ran once, on the
  // very first render (when `editing` was still null). Without this, opening
  // Edit on any row showed the very first render's stale values instead of
  // that row's actual data.
  useEffect(() => {
    if (!open) return
    setTier(editing?.tier ?? 'STARTER')
    setBillingCycle(editing?.billingCycle ?? 'MONTHLY')
    setUserLimit(editing?.userLimit != null ? String(editing.userLimit) : '')
    setConcurrentLoginLimit(editing?.concurrentLoginLimit != null ? String(editing.concurrentLoginLimit) : '')
    setPrice(editing?.price != null ? String(editing.price) : '')
    setIsActive(editing?.isActive ?? true)
  }, [open, editing])

  const isLoading = isCreating || isUpdating

  async function handleSubmit() {
    try {
      const body = {
        userLimit: userLimit === '' ? null : Number(userLimit),
        concurrentLoginLimit: concurrentLoginLimit === '' ? null : Number(concurrentLoginLimit),
        price: price === '' ? null : Number(price),
        isActive,
      }
      if (editing) {
        await updateDefinition({ packageDefinitionId: editing.packageDefinitionId, body }).unwrap()
        toast.success('Package definition updated')
      } else {
        await createDefinition({ tier, billingCycle, ...body }).unwrap()
        toast.success('Package definition created')
      }
      onClose()
    } catch (err) {
      toast.error(getApiErrorMessage(err, `Failed to ${editing ? 'update' : 'create'} package definition`))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit package definition' : 'New package definition'} size="sm">
      <div className="flex flex-col gap-3">
        <Select
          label="Tier"
          name="tier"
          options={TIER_OPTIONS}
          value={tier}
          disabled={Boolean(editing)}
          onChange={(e) => setTier(e.target.value as PackageTier)}
        />
        <Select
          label="Billing cycle"
          name="billingCycle"
          options={CYCLE_OPTIONS}
          value={billingCycle}
          disabled={Boolean(editing)}
          onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
        />
        <Input
          label="User limit"
          name="userLimit"
          type="number"
          min={0}
          placeholder="Leave blank for unlimited"
          value={userLimit}
          onChange={(e) => setUserLimit(e.target.value)}
        />
        <Input
          label="Concurrent login limit"
          name="concurrentLoginLimit"
          type="number"
          min={0}
          placeholder="Leave blank for unlimited"
          value={concurrentLoginLimit}
          onChange={(e) => setConcurrentLoginLimit(e.target.value)}
        />
        <Input
          label="Price"
          name="price"
          type="number"
          min={0}
          step="0.01"
          placeholder="Leave blank for &quot;Contact us&quot;"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <label className="flex items-center gap-1.5 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="size-4 rounded border-border text-primary focus:ring-primary/30"
          />
          Active (offered publicly and to plan pickers)
        </label>
        <Button loading={isLoading} onClick={() => void handleSubmit()}>
          {editing ? 'Save changes' : 'Create definition'}
        </Button>
      </div>
    </Modal>
  )
}
