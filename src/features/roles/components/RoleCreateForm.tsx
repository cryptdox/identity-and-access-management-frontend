import { useFormik } from 'formik'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { roleSchema, type RoleFormValues } from '@/features/roles/schemas/role.schema'
import { useRoleMutations } from '@/features/roles/hooks/useRoleMutations'
import { useRealmId } from '@/common/hooks/useRealmId'
import { useListClientsQuery } from '@/api/endpoints/client.api'
import { Input } from '@/common/components/ui/Input'
import { Select } from '@/common/components/ui/Select'
import { Button } from '@/common/components/ui/Button'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useToast } from '@/common/hooks/useToast'

export function RoleCreateForm() {
  const realmId = useRealmId()
  const [searchParams] = useSearchParams()
  const presetClientIdInternal = searchParams.get('clientIdInternal') ?? ''
  const { createRole, isCreating } = useRoleMutations()
  const navigate = useNavigate()
  const toast = useToast()
  const { data: clientsData, isLoading: isClientsLoading } = useListClientsQuery({ realmId, limit: 200 })
  // Creating a role for a client your realm doesn't own is rejected server-side —
  // only offer the ones this realm actually owns.
  const clients = (clientsData?.data?.items ?? []).filter((c) => c.isOwner)

  const formik = useFormik<RoleFormValues>({
    initialValues: { clientIdInternal: presetClientIdInternal, name: '', description: '' },
    enableReinitialize: true,
    validationSchema: roleSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const role = await createRole(values)
        if (role) navigate(`/r/${realmId}/roles/${role.roleId}`)
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to create role'))
      } finally {
        setSubmitting(false)
      }
    },
  })

  return (
    <form onSubmit={formik.handleSubmit} className="flex max-w-lg flex-col gap-4">
      <Select
        label="Client"
        name="clientIdInternal"
        placeholder={isClientsLoading ? 'Loading clients…' : 'Select a client…'}
        options={clients.map((c) => ({ value: c.clientIdInternal, label: c.clientId ?? c.clientIdInternal }))}
        value={formik.values.clientIdInternal}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.clientIdInternal ? formik.errors.clientIdInternal : undefined}
        disabled={Boolean(presetClientIdInternal)}
      />
      <Input
        label="Role name"
        name="name"
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.name ? formik.errors.name : undefined}
      />
      <Input
        label="Description (optional)"
        name="description"
        value={formik.values.description}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      <div className="mt-2 flex gap-2">
        <Button type="submit" loading={isCreating || formik.isSubmitting}>
          Create role
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate(`/r/${realmId}/roles`)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
