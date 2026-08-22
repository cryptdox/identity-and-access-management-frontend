import { useFormik } from 'formik'
import { useNavigate } from 'react-router-dom'
import { createGroupSchema, type CreateGroupFormValues } from '@/features/groups/schemas/group.schema'
import { useGroupMutations } from '@/features/groups/hooks/useGroupMutations'
import { useListGroupsQuery } from '@/api/endpoints/group.api'
import { useRealmId } from '@/common/hooks/useRealmId'
import { Input } from '@/common/components/ui/Input'
import { Select } from '@/common/components/ui/Select'
import { Button } from '@/common/components/ui/Button'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useToast } from '@/common/hooks/useToast'

const initialValues: CreateGroupFormValues = { name: '', parentId: '' }

export function GroupCreateForm() {
  const realmId = useRealmId()
  const { createGroup, isCreating } = useGroupMutations()
  const { data, isLoading: isGroupsLoading } = useListGroupsQuery({ realmId, limit: 200 })
  const navigate = useNavigate()
  const toast = useToast()

  const parentOptions = [
    { value: '', label: 'None (top-level group)' },
    ...(data?.data?.items.map((g) => ({ value: g.groupId, label: g.name })) ?? []),
  ]

  const formik = useFormik<CreateGroupFormValues>({
    initialValues,
    validationSchema: createGroupSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const group = await createGroup({
          realmId,
          name: values.name,
          parentId: values.parentId || undefined,
        })
        if (group) navigate(`/r/${realmId}/groups/${group.groupId}`)
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to create group'))
      } finally {
        setSubmitting(false)
      }
    },
  })

  return (
    <form onSubmit={formik.handleSubmit} className="flex max-w-lg flex-col gap-4">
      <Input
        label="Group name"
        name="name"
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.name ? formik.errors.name : undefined}
      />
      {/* `parentOptions` always has a real "" value ("None") — no separate
      placeholder option, or the select would show two entries at value="". */}
      <Select
        label="Parent group"
        name="parentId"
        options={isGroupsLoading ? [{ value: '', label: 'Loading groups…' }] : parentOptions}
        value={formik.values.parentId}
        onChange={formik.handleChange}
        disabled={isGroupsLoading}
      />
      <div className="mt-2 flex gap-2">
        <Button type="submit" loading={isCreating || formik.isSubmitting}>
          Create group
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate(`/r/${realmId}/groups`)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
