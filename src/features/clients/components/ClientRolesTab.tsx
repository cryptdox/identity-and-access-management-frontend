import { Plus, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useListRolesByClientQuery } from '@/api/endpoints/role.api'
import { useRealmId } from '@/common/hooks/useRealmId'
import { Button } from '@/common/components/ui/Button'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'

/** A Role's client is fixed at creation (Role.clientIdInternal) — there's no separate
 * "assign an existing role to a client" action anymore, so this tab is read-only. New
 * roles for this client are created from the Roles feature, with the client preset. */
export function ClientRolesTab({ clientIdInternal }: { clientIdInternal: string }) {
  const realmId = useRealmId()
  const navigate = useNavigate()
  const canCreate = useCan(ResourceName.ROLE, TypeAction.CREATE)
  const { data, isLoading } = useListRolesByClientQuery({ clientIdInternal, limit: 200 })
  const roles = data?.data?.items ?? []

  return (
    <div className="max-w-lg">
      {canCreate && (
        <div className="mb-4 flex justify-end">
          <Button size="sm" onClick={() => navigate(`/r/${realmId}/roles/new?clientIdInternal=${clientIdInternal}`)}>
            <Plus className="size-4" /> Create role for this client
          </Button>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : roles.length === 0 ? (
        <EmptyState title="No roles for this client" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {roles.map((role) => (
            <div
              key={role.roleId}
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/r/${realmId}/roles/${role.roleId}`)}
              className="flex cursor-pointer items-center gap-2 border-b border-border px-4 py-2.5 text-sm last:border-0 hover:bg-surface-alt/50"
            >
              <ShieldCheck className="size-4 text-text-secondary" />
              <span className="text-text">{role.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
