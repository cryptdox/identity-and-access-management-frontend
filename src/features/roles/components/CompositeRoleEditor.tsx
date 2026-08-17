import { useState } from 'react'
import { Trash2, ShieldPlus } from 'lucide-react'
import {
  useListRoleCompositesQuery,
  useAddCompositeRoleMutation,
  useRemoveCompositeRoleMutation,
} from '@/api/endpoints/roleComposite.api'
import { useListRolesQuery } from '@/api/endpoints/role.api'
import { Select } from '@/common/components/ui/Select'
import { Button } from '@/common/components/ui/Button'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { confirm } from '@/common/utils/confirm'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useCan } from '@/common/hooks/usePermission'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { ResourceName, TypeAction } from '@/api/types/enums.types'

/** Composite roles let this role "include" another role's permissions. Cycle
 * prevention (e.g. A includes B includes A) is enforced server-side — we just
 * surface a rejection via toast rather than re-implementing cycle detection here. */
export function CompositeRoleEditor({ roleId }: { roleId: string }) {
  const { isMasterRealmUser } = useCurrentUser()
  // Roles are global/shared across tenants, so adding/removing a composite link is
  // restricted server-side to Master-realm admins — mirrored here so the UI doesn't
  // offer an action every tenant admin would just get a 403 back for.
  const canManage = useCan(ResourceName.ROLE_COMPOSITE, TypeAction.CREATE) && isMasterRealmUser
  const { data: compositesData, isLoading } = useListRoleCompositesQuery({ roleId, limit: 200 })
  const { data: allRolesData } = useListRolesQuery({ limit: 500 })
  const [addComposite, { isLoading: isAdding }] = useAddCompositeRoleMutation()
  const [removeComposite] = useRemoveCompositeRoleMutation()
  const toast = useToast()
  const [selectedRoleId, setSelectedRoleId] = useState('')

  const composites = compositesData?.data?.items ?? []
  const excludedIds = new Set([roleId, ...composites.map((c) => c.compositeRoleId)])
  const availableRoles = (allRolesData?.data?.items ?? []).filter((r) => !excludedIds.has(r.roleId))

  async function handleAdd() {
    if (!selectedRoleId) return
    try {
      await addComposite({ roleId, compositeRoleId: selectedRoleId }).unwrap()
      toast.success('Composite role added')
      setSelectedRoleId('')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to add composite role'))
    }
  }

  async function handleRemove(compositeRoleId: string, name: string) {
    const confirmed = await confirm({ message: `Stop including "${name}"?`, confirmLabel: 'Remove', danger: true })
    if (!confirmed) return
    try {
      await removeComposite({ roleId, compositeRoleId }).unwrap()
      toast.success('Composite role removed')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to remove composite role'))
    }
  }

  return (
    <div className="max-w-lg">
      <p className="mb-4 text-sm text-text-secondary">
        A composite role automatically includes another role's permissions.
      </p>

      {canManage && (
        <div className="mb-4 flex items-end gap-2">
          <div className="flex-1">
            <Select
              label="Include a role"
              placeholder="Select a role…"
              options={availableRoles.map((r) => ({ value: r.roleId, label: r.name }))}
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
            />
          </div>
          <Button size="sm" loading={isAdding} disabled={!selectedRoleId} onClick={() => void handleAdd()}>
            Add
          </Button>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : composites.length === 0 ? (
        <EmptyState title="Not a composite role" description="This role doesn't include any other roles." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {composites.map((c) => (
            <div key={c.compositeRoleId} className="flex items-center justify-between border-b border-border px-4 py-2.5 text-sm last:border-0">
              <div className="flex items-center gap-2">
                <ShieldPlus className="size-4 text-text-secondary" />
                <span className="text-text">{c.compositeRole?.name ?? c.compositeRoleId}</span>
              </div>
              {canManage && (
                <button
                  onClick={() => void handleRemove(c.compositeRoleId, c.compositeRole?.name ?? c.compositeRoleId)}
                  className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label="Remove composite role"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
