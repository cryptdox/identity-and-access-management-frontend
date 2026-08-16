import { useFormik } from 'formik'
import { useNavigate } from 'react-router-dom'
import { useGroupMutations } from '@/features/groups/hooks/useGroupMutations'
import { useListGroupsQuery } from '@/api/endpoints/group.api'
import { useRealmId } from '@/common/hooks/useRealmId'
import { Input } from '@/common/components/ui/Input'
import { Select } from '@/common/components/ui/Select'
import { Button } from '@/common/components/ui/Button'
import { confirm } from '@/common/utils/confirm'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import type { Group } from '@/features/groups/group.types'

export function GroupGeneralTab({ group }: { group: Group }) {
  const realmId = useRealmId()
  const navigate = useNavigate()
  const { updateGroup, deleteGroup, isUpdating, isDeleting } = useGroupMutations()
  const { data } = useListGroupsQuery({ realmId, limit: 200 })
  const canUpdate = useCan(ResourceName.GROUP, TypeAction.UPDATE)
  const canDelete = useCan(ResourceName.GROUP, TypeAction.DELETE)

  const parentOptions = [
    { value: '', label: 'None (top-level group)' },
    ...(data?.data?.items.filter((g) => g.groupId !== group.groupId).map((g) => ({ value: g.groupId, label: g.name })) ??
      []),
  ]

  const formik = useFormik({
    initialValues: { name: group.name, parentId: group.parentId ?? '' },
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await updateGroup(group.groupId, { name: values.name, parentId: values.parentId || null })
      } finally {
        setSubmitting(false)
      }
    },
  })

  async function handleDelete() {
    const confirmed = await confirm({
      title: 'Delete group',
      message: `Delete "${group.name}"? Child groups and role assignments are affected. This cannot be undone.`,
      confirmLabel: 'Delete group',
      danger: true,
    })
    if (!confirmed) return
    await deleteGroup(group.groupId)
    navigate(`/r/${realmId}/groups`, { replace: true })
  }

  return (
    <div className="flex max-w-lg flex-col gap-8">
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Group name"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          disabled={!canUpdate}
        />
        <Select
          label="Parent group"
          name="parentId"
          options={parentOptions}
          value={formik.values.parentId}
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
            Delete group
          </Button>
        </div>
      )}
    </div>
  )
}
