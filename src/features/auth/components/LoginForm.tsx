import { useState } from 'react'
import { useFormik } from 'formik'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/login.schema'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { Input } from '@/common/components/ui/Input'
import { Button } from '@/common/components/ui/Button'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'

const DEFAULT_REALM = (import.meta.env.VITE_DEFAULT_REALM_NAME as string | undefined) ?? 'Master'

export function LoginForm() {
  const { t } = useTranslation('auth')
  const { login, isLoading } = useLogin()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

  const formik = useFormik<LoginFormValues>({
    initialValues: { realmName: DEFAULT_REALM, email: '', password: '', rememberDevice: false },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const user = await login(values)
        // `from` is wherever the browser was before hitting the login gate — if that
        // was a realm-scoped URL, it belongs to whoever was logged in *before*. If a
        // different account just signed in (browser left on a stale/foreign-realm
        // URL, or someone else's session), blindly honoring it can land a non-master
        // user on a realm they have no relationship to. Only trust `from` when it's
        // not realm-scoped, or already points at this user's own realm; master users
        // can legitimately go anywhere so they're exempt from this check.
        const realmMatch = from.match(/^\/r\/([^/]+)\//)
        const safeToReturn = !realmMatch || user?.isMasterRealmUser || realmMatch[1] === user?.realmId
        navigate(safeToReturn ? from : '/', { replace: true })
      } catch (err) {
        toast.error(getApiErrorMessage(err, t('invalidCredentials')))
      } finally {
        setSubmitting(false)
      }
    },
  })

  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
      <Input
        label={t('realm')}
        name="realmName"
        value={formik.values.realmName}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.realmName ? formik.errors.realmName : undefined}
      />
      <Input
        label={t('email')}
        name="email"
        type="email"
        autoComplete="username"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email ? formik.errors.email : undefined}
      />
      <div className="relative">
        <Input
          label={t('password')}
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password ? formik.errors.password : undefined}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-9 text-text-secondary hover:text-text"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          name="rememberDevice"
          checked={formik.values.rememberDevice}
          onChange={formik.handleChange}
          className="size-4 rounded border-border text-primary focus:ring-primary/30"
        />
        {t('rememberDevice')}
      </label>

      <Button type="submit" loading={isLoading || formik.isSubmitting} className="mt-2">
        {t('signIn')}
      </Button>
    </form>
  )
}
