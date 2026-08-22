import { useFormik } from 'formik'
import * as yup from 'yup'
import { useGetMeQuery } from '@/api/endpoints/auth.api'
import { useProfileMutations } from '@/features/auth/hooks/useProfileMutations'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { Input } from '@/common/components/ui/Input'
import { Button } from '@/common/components/ui/Button'
import { Badge } from '@/common/components/ui/Badge'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { Tabs } from '@/common/components/ui/Tabs'
import { formatDate } from '@/common/utils/formatDate'

const passwordSchema = yup.object({
  oldPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(8, 'At least 8 characters').required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords do not match')
    .required('Confirm your new password'),
})

function ProfileGeneralTab() {
  const { data, isLoading } = useGetMeQuery()
  const { updateProfile, resendVerifyEmail, isUpdating, isResendingVerifyEmail } = useProfileMutations()
  const user = data?.data

  const formik = useFormik({
    initialValues: { name: user?.name ?? '' },
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await updateProfile({ name: values.name })
      } finally {
        setSubmitting(false)
      }
    },
  })

  if (isLoading || !user) {
    return (
      <div className="max-w-lg space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-8">
      <div className="grid grid-cols-[140px_1fr] items-center gap-y-3 text-sm">
        <span className="text-text-secondary">Username</span>
        <span className="text-text">{user.username}</span>
        <span className="text-text-secondary">Email</span>
        <span className="text-text">{user.email}</span>
        <span className="text-text-secondary">Email verified</span>
        <span className="flex items-center gap-2">
          <Badge tone={user.isEmailVerified ? 'info' : 'warning'}>
            {user.isEmailVerified ? 'Verified' : 'Unverified'}
          </Badge>
          {!user.isEmailVerified && (
            <Button
              variant="outline"
              size="sm"
              loading={isResendingVerifyEmail}
              onClick={() => void resendVerifyEmail()}
            >
              Verify email
            </Button>
          )}
        </span>
        <span className="text-text-secondary">Realm</span>
        <span className="text-text">{user.realm.name}</span>
        <span className="text-text-secondary">Member since</span>
        <span className="text-text">{formatDate(user.createdAt)}</span>
      </div>

      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Display name"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          placeholder="Add a display name"
        />
        <Button
          type="submit"
          size="sm"
          className="w-fit"
          loading={isUpdating || formik.isSubmitting}
          disabled={!formik.dirty}
        >
          Save changes
        </Button>
      </form>
    </div>
  )
}

function ProfileSecurityTab() {
  const { changePassword, isChangingPassword } = useProfileMutations()

  const formik = useFormik({
    initialValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
    validationSchema: passwordSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await changePassword({ oldPassword: values.oldPassword, newPassword: values.newPassword })
        resetForm()
      } finally {
        setSubmitting(false)
      }
    },
  })

  return (
    <form onSubmit={formik.handleSubmit} className="flex max-w-lg flex-col gap-4">
      <Input
        label="Current password"
        name="oldPassword"
        type="password"
        autoComplete="current-password"
        value={formik.values.oldPassword}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.oldPassword ? formik.errors.oldPassword : undefined}
      />
      <Input
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        value={formik.values.newPassword}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.newPassword ? formik.errors.newPassword : undefined}
      />
      <Input
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        value={formik.values.confirmPassword}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.confirmPassword ? formik.errors.confirmPassword : undefined}
      />
      <Button type="submit" size="sm" className="w-fit" loading={isChangingPassword || formik.isSubmitting}>
        Change password
      </Button>
    </form>
  )
}

export default function ProfilePage() {
  return (
    <div>
      <PageHeader title="My profile" description="View and manage your own account." />
      <Tabs
        items={[
          { key: 'general', label: 'General', content: <ProfileGeneralTab /> },
          { key: 'security', label: 'Security', content: <ProfileSecurityTab /> },
        ]}
      />
    </div>
  )
}
