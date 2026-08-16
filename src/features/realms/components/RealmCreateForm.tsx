import { useFormik } from 'formik'
import { useNavigate } from 'react-router-dom'
import { createRealmSchema, type CreateRealmFormValues } from '@/features/realms/schemas/realm.schema'
import { useRealmMutations } from '@/features/realms/hooks/useRealmMutations'
import { Input } from '@/common/components/ui/Input'
import { Button } from '@/common/components/ui/Button'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useToast } from '@/common/hooks/useToast'

const initialValues: CreateRealmFormValues = {
  name: '',
  description: '',
  superAdmin: { username: '', email: '', password: '' },
}

export function RealmCreateForm() {
  const { createRealm, isCreating } = useRealmMutations()
  const navigate = useNavigate()
  const toast = useToast()

  const formik = useFormik<CreateRealmFormValues>({
    initialValues,
    validationSchema: createRealmSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const realm = await createRealm(values)
        if (realm) navigate(`/r/${realm.realmId}/dashboard`)
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to create realm'))
      } finally {
        setSubmitting(false)
      }
    },
  })

  return (
    <form onSubmit={formik.handleSubmit} className="flex max-w-lg flex-col gap-4">
      <Input
        label="Realm name"
        name="name"
        placeholder="e.g. Acme Corp"
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

      <div className="mt-2 rounded-xl border border-border bg-surface-alt/40 p-4">
        <p className="mb-3 text-sm font-medium text-text">Realm super admin</p>
        <div className="flex flex-col gap-4">
          <Input
            label="Username"
            name="superAdmin.username"
            value={formik.values.superAdmin.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.superAdmin?.username ? formik.errors.superAdmin?.username : undefined}
          />
          <Input
            label="Email"
            name="superAdmin.email"
            type="email"
            value={formik.values.superAdmin.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.superAdmin?.email ? formik.errors.superAdmin?.email : undefined}
          />
          <Input
            label="Password"
            name="superAdmin.password"
            type="password"
            value={formik.values.superAdmin.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.superAdmin?.password ? formik.errors.superAdmin?.password : undefined}
          />
        </div>
      </div>

      <div className="mt-2 flex gap-2">
        <Button type="submit" loading={isCreating || formik.isSubmitting}>
          Create realm
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate('/realms')}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
