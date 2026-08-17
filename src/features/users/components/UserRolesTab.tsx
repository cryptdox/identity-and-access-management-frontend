import { useEffect, useState } from 'react'
import { Trash2, ShieldCheck } from 'lucide-react'
import { useListUserRolesQuery, useAssignUserRoleMutation, useRemoveUserRoleMutation } from '@/api/endpoints/userRole.api'
import { useListRolesByClientQuery } from '@/api/endpoints/role.api'
import { useListClientsQuery } from '@/api/endpoints/client.api'
import { useRealmId } from '@/common/hooks/useRealmId'
import { useDebounce } from '@/common/hooks/useDebounce'
import { Select } from '@/common/components/ui/Select'
import { Badge } from '@/common/components/ui/Badge'
import { SearchMultiSelect, type SearchMultiSelectOption } from '@/common/components/ui/SearchMultiSelect'
import { Button } from '@/common/components/ui/Button'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { confirm } from '@/common/utils/confirm'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'

const IAM_CLIENT_ID = (import.meta.env.VITE_IAM_CLIENT_ID as string | undefined) ?? ''

/** Roles are scoped to one client each, so the "add a role" picker filters by client
 * first — but the assigned-roles LIST below stays unfiltered (a user can hold roles
 * from several clients at once, and that's the whole point of assigning them here
 * instead of per-client). Client select defaults to this admin console's own client. */
export function UserRolesTab({ userId }: { userId: string }) {
  const realmId = useRealmId()
  const canManage = useCan(ResourceName.USER_ROLE, TypeAction.CREATE)
  const toast = useToast()

  const { data: assignedData, isLoading } = useListUserRolesQuery({ userId, limit: 200 })
  const assigned = assignedData?.data?.items ?? []
  const assignedIds = new Set(assigned.map((ur) => ur.roleId))

  const { data: clientsData } = useListClientsQuery({ realmId, limit: 200 })
  const clients = clientsData?.data?.items ?? []
  const [clientIdInternal, setClientIdInternal] = useState('')

  useEffect(() => {
    if (clientIdInternal || clients.length === 0) return
    const iamClient = clients.find((c) => c.clientId === IAM_CLIENT_ID)
    setClientIdInternal(iamClient?.clientIdInternal ?? clients[0].clientIdInternal)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients])

  const [roleQuery, setRoleQuery] = useState('')
  const debouncedRoleQuery = useDebounce(roleQuery, 300)
  const { data: roleOptionsData, isFetching: isSearchingRoles } = useListRolesByClientQuery(
    { clientIdInternal, search: debouncedRoleQuery || undefined, limit: 10 },
    { skip: !clientIdInternal },
  )
  const roleOptions: SearchMultiSelectOption[] = (roleOptionsData?.data?.items ?? [])
    .filter((r) => !assignedIds.has(r.roleId))
    .map((r) => ({ value: r.roleId, label: r.name }))

  const [selectedRoles, setSelectedRoles] = useState<SearchMultiSelectOption[]>([])
  const [isAssigning, setIsAssigning] = useState(false)

  function toggleRole(option: SearchMultiSelectOption) {
    setSelectedRoles((prev) =>
      prev.some((r) => r.value === option.value) ? prev.filter((r) => r.value !== option.value) : [...prev, option],
    )
  }

  const [assignUserRole] = useAssignUserRoleMutation()
  const [removeUserRole] = useRemoveUserRoleMutation()

  async function handleAssign() {
    if (selectedRoles.length === 0) return
    setIsAssigning(true)
    try {
      await Promise.all(selectedRoles.map((r) => assignUserRole({ userId, roleId: r.value }).unwrap()))
      toast.success(selectedRoles.length > 1 ? 'Roles assigned' : 'Role assigned')
      setSelectedRoles([])
      setRoleQuery('')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to assign role(s)'))
    } finally {
      setIsAssigning(false)
    }
  }

  async function handleRemove(roleId: string, roleName: string) {
    const confirmed = await confirm({ message: `Remove role "${roleName}" from this user?`, confirmLabel: 'Remove', danger: true })
    if (!confirmed) return
    try {
      await removeUserRole({ userId, roleId }).unwrap()
      toast.success('Role removed')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to remove role'))
    }
  }

  return (
    <div className="max-w-lg">
      {canManage && (
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                label="Client"
                options={clients.map((c) => ({ value: c.clientIdInternal, label: c.clientId ?? c.clientIdInternal }))}
                value={clientIdInternal}
                onChange={(e) => {
                  setClientIdInternal(e.target.value)
                  setSelectedRoles([])
                  setRoleQuery('')
                }}
              />
            </div>
          </div>
          <SearchMultiSelect
            label="Assign role(s)"
            placeholder="Search roles for this client…"
            query={roleQuery}
            onQueryChange={setRoleQuery}
            options={roleOptions}
            selected={selectedRoles}
            onToggle={toggleRole}
            loading={isSearchingRoles}
          />
          <Button
            size="sm"
            className="w-fit"
            loading={isAssigning}
            disabled={selectedRoles.length === 0}
            onClick={() => void handleAssign()}
          >
            Assign {selectedRoles.length > 0 ? `(${selectedRoles.length})` : ''}
          </Button>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : assigned.length === 0 ? (
        <EmptyState title="No roles assigned" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {assigned.map((ur) => (
            <div key={ur.roleId} className="flex items-center justify-between border-b border-border px-4 py-2.5 text-sm last:border-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-text-secondary" />
                <Badge tone="neutral">{ur.role?.client?.clientId ?? '—'}</Badge>
                <span className="text-text">{ur.role?.name ?? ur.roleId}</span>
              </div>
              {canManage && (
                <button
                  onClick={() => void handleRemove(ur.roleId, ur.role?.name ?? ur.roleId)}
                  className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label="Remove role"
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
