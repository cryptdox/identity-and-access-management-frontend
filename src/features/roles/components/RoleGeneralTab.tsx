import { useFormik } from 'formik'
import { useNavigate } from 'react-router-dom'
import type { RoleFormValues } from '@/features/roles/schemas/role.schema'
import { useRoleMutations } from '@/features/roles/hooks/useRoleMutations'
import { useRealmId } from '@/common/hooks/useRealmId'
import { Input } from '@/common/components/ui/Input'
import { Button } from '@/common/components/ui/Button'
import { confirm } from '@/common/utils/confirm'
import { useCan } from '@/common/hooks/usePermission'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import type { Role } from '@/features/roles/role.types'

export function RoleGeneralTab({ role }: { role: Role }) {
  const realmId = useRealmId()
  const navigate = useNavigate()
  const { updateRole, deleteRole, isUpdating, isDeleting } = useRoleMutations()
  const { isMasterRealmUser } = useCurrentUser()
  // Role has no realm concept — every tenant shares the same global role row, so the
  // backend restricts updating/deleting an EXISTING role to Master-realm admins only.
  const canUpdate = useCan(ResourceName.ROLE, TypeAction.UPDATE) && isMasterRealmUser
  const canDelete = useCan(ResourceName.ROLE, TypeAction.DELETE) && isMasterRealmUser

  const formik = useFormik<RoleFormValues>({
    initialValues: { name: role.name, description: role.description ?? '' },
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await updateRole(role.roleId, values)
      } finally {
        setSubmitting(false)
      }
    },
  })

  async function handleDelete() {
    const confirmed = await confirm({
      title: 'Delete role',
      message: `Delete "${role.name}"? Any user/group assignments of this role are removed. This cannot be undone.`,
      confirmLabel: 'Delete role',
      danger: true,
    })
    if (!confirmed) return
    await deleteRole(role.roleId)
    navigate(`/r/${realmId}/roles`, { replace: true })
  }

  return (
    <div className="flex max-w-lg flex-col gap-8">
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
        <Input label="Client" value={role.client?.clientId ?? role.clientIdInternal} disabled readOnly />
        <Input
          label="Role name"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          disabled={!canUpdate}
        />
        <Input
          label="Description"
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
          disabled={!canUpdate}
        />
        {canUpdate && (
          <Button type="submit" size="sm" className="w-fit" loading={isUpdating || formik.isSubmitting} disabled={!formik.dirty}>
            Save changes
          </Button>
        )}
      </form>

      {canDelete && (
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
          <p className="text-sm font-medium text-danger">Danger zone</p>
          <Button variant="danger" size="sm" className="mt-3" loading={isDeleting} onClick={() => void handleDelete()}>
            Delete role
          </Button>
        </div>
      )}
    </div>
  )
}
