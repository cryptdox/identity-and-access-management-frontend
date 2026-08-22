import { useState } from 'react'
import { useFormik } from 'formik'
import { CheckCircle2 } from 'lucide-react'
import { requestRealmSchema, type RequestRealmFormValues } from '@/features/landing/schemas/requestRealm.schema'
import { useRequestRealmMutation } from '@/api/endpoints/realm.api'
import { Input } from '@/common/components/ui/Input'
import { Button } from '@/common/components/ui/Button'
import { Turnstile } from '@/common/components/ui/Turnstile'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'

/** Public, unauthenticated "start your trial" form — patterned directly off
 * LoginForm.tsx, the only other public-form precedent in this codebase. Creates
 * a disabled realm + disabled admin user pending Master's review; never signs
 * anyone in directly. */
export function RequestRealmForm() {
  const [requestRealm, { isLoading }] = useRequestRealmMutation()
  const toast = useToast()
  const [captchaToken, setCaptchaToken] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const formik = useFormik<RequestRealmFormValues>({
    initialValues: { realmName: '', adminUsername: '', adminEmail: '', adminPassword: '' },
    validationSchema: requestRealmSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      if (!captchaToken) {
        toast.error('Please complete the verification challenge')
        setSubmitting(false)
        return
      }
      try {
        await requestRealm({ ...values, captchaToken }).unwrap()
        setSubmitted(true)
        resetForm()
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to submit request'))
      } finally {
        setSubmitting(false)
      }
    },
  })

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2 className="size-10 text-success" />
        <p className="text-lg font-semibold text-text">Request received</p>
        <p className="max-w-sm text-sm text-text-secondary">
          An administrator will review your request and activate your organization shortly. You&apos;ll be able to sign in
          once it&apos;s approved.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-text-secondary">10 users, 5 concurrent logins, free for 1 month. No card required.</p>

      <Input
        label="Organization name"
        name="realmName"
        value={formik.values.realmName}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.realmName ? formik.errors.realmName : undefined}
      />
      <Input
        label="Your name"
        name="adminUsername"
        value={formik.values.adminUsername}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.adminUsername ? formik.errors.adminUsername : undefined}
      />
      <Input
        label="Work email"
        name="adminEmail"
        type="email"
        autoComplete="email"
        value={formik.values.adminEmail}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.adminEmail ? formik.errors.adminEmail : undefined}
      />
      <Input
        label="Password"
        name="adminPassword"
        type="password"
        autoComplete="new-password"
        value={formik.values.adminPassword}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.adminPassword ? formik.errors.adminPassword : undefined}
      />

      <Turnstile onVerify={setCaptchaToken} />

      <Button type="submit" loading={isLoading || formik.isSubmitting} className="mt-1">
        Request access
      </Button>
    </form>
  )
}
