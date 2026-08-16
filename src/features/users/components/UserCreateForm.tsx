import { useFormik } from 'formik'
import { useNavigate } from 'react-router-dom'
import { createUserSchema, type CreateUserFormValues } from '@/features/users/schemas/user.schema'
import { useUserMutations } from '@/features/users/hooks/useUserMutations'
import { useRealmId } from '@/common/hooks/useRealmId'
import { Input } from '@/common/components/ui/Input'
import { Button } from '@/common/components/ui/Button'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useToast } from '@/common/hooks/useToast'

const initialValues: CreateUserFormValues = { username: '', email: '', password: '', enabled: true }

export function UserCreateForm() {
  const realmId = useRealmId()
  const { createUser, isCreating } = useUserMutations()
  const navigate = useNavigate()
  const toast = useToast()

  const formik = useFormik<CreateUserFormValues>({
    initialValues,
    validationSchema: createUserSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const user = await createUser({ realmId, ...values })
        if (user) navigate(`/r/${realmId}/users/${user.userId}`)
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to create user'))
      } finally {
        setSubmitting(false)
      }
    },
  })

  return (
    <form onSubmit={formik.handleSubmit} className="flex max-w-lg flex-col gap-4">
      <Input
        label="Username"
        name="username"
        value={formik.values.username}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.username ? formik.errors.username : undefined}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email ? formik.errors.email : undefined}
      />
      <Input
        label="Password (optional)"
        name="password"
        type="password"
        hint="Leave blank to invite the user to set their own password later."
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password ? formik.errors.password : undefined}
      />

      <label className="flex items-center gap-2 text-sm text-text">
        <input
          type="checkbox"
          name="enabled"
          checked={formik.values.enabled}
          onChange={formik.handleChange}
          className="size-4 rounded border-border text-primary focus:ring-primary/30"
        />
        Enabled
      </label>

      <div className="mt-2 flex gap-2">
        <Button type="submit" loading={isCreating || formik.isSubmitting}>
          Create user
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate(`/r/${realmId}/users`)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
