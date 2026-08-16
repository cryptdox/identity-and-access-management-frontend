import { useFormik } from 'formik'
import { useNavigate } from 'react-router-dom'
import { roleSchema, type RoleFormValues } from '@/features/roles/schemas/role.schema'
import { useRoleMutations } from '@/features/roles/hooks/useRoleMutations'
import { useRealmId } from '@/common/hooks/useRealmId'
import { Input } from '@/common/components/ui/Input'
import { Button } from '@/common/components/ui/Button'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useToast } from '@/common/hooks/useToast'

const initialValues: RoleFormValues = { name: '', description: '' }

export function RoleCreateForm() {
  const realmId = useRealmId()
  const { createRole, isCreating } = useRoleMutations()
  const navigate = useNavigate()
  const toast = useToast()

  const formik = useFormik<RoleFormValues>({
    initialValues,
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
