import { Trash2 } from 'lucide-react'
import { useCreatePermissionMutation, useDeletePermissionMutation } from '@/api/endpoints/permission.api'
import { useDeleteResourceMutation } from '@/api/endpoints/resource.api'
import { confirm } from '@/common/utils/confirm'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import type { Resource } from '@/features/resources/resource.types'
import type { Permission } from '@/features/roles/role.types'

const ACTIONS = Object.values(TypeAction)

interface ResourceRow {
  resource: Resource
  permissionByAction: Map<string, Permission>
}

export function ResourceMatrixTable({
  rows,
  clientIdInternal,
}: {
  rows: ResourceRow[]
  clientIdInternal: string
}) {
  const canManage = useCan(ResourceName.RESOURCE, TypeAction.UPDATE)
  const [createPermission] = useCreatePermissionMutation()
  const [deletePermission] = useDeletePermissionMutation()
  const [deleteResource] = useDeleteResourceMutation()
  const toast = useToast()

  async function toggle(resourceId: string, action: TypeAction, existing?: Permission) {
    try {
      if (existing) {
        await deletePermission({ permissionId: existing.permissionId, clientIdInternal }).unwrap()
      } else {
        await createPermission({ action, resourceId, clientIdInternal }).unwrap()
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update permission'))
    }
  }

  async function handleDeleteResource(resourceId: string, name: string) {
    const confirmed = await confirm({
      title: 'Delete resource',
      message: `Delete "${name}" and all its permissions? Roles referencing them lose that access.`,
      confirmLabel: 'Delete resource',
      danger: true,
    })
    if (!confirmed) return
    try {
      await deleteResource({ resourceId, clientIdInternal }).unwrap()
      toast.success('Resource deleted')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete resource'))
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-alt/50">
            <th className="px-4 py-2.5 font-medium text-text-secondary">Resource</th>
            <th className="px-3 py-2.5 font-medium text-text-secondary">Type</th>
            {ACTIONS.map((action) => (
              <th key={action} className="px-3 py-2.5 text-center font-medium text-text-secondary">
                {action}
              </th>
            ))}
            {canManage && <th className="px-3 py-2.5" />}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ resource, permissionByAction }) => (
            <tr key={resource.resourceId} className="border-b border-border last:border-0">
              <td className="px-4 py-2 font-medium text-text">{resource.name}</td>
              <td className="px-3 py-2 text-text-secondary">{resource.type}</td>
              {ACTIONS.map((action) => {
                const existing = permissionByAction.get(action)
                return (
                  <td key={action} className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={Boolean(existing)}
                      disabled={!canManage}
                      onChange={() => void toggle(resource.resourceId, action, existing)}
                      className="size-4 rounded border-border text-primary focus:ring-primary/30"
                    />
                  </td>
                )
              })}
              {canManage && (
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => void handleDeleteResource(resource.resourceId, resource.name)}
                    className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                    aria-label="Delete resource"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
