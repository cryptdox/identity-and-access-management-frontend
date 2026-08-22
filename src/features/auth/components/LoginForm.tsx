import { useState } from 'react'
import { useFormik } from 'formik'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/login.schema'
import { useLogin } from '@/features/auth/hooks/useLogin'
import { Input } from '@/common/components/ui/Input'
import { Button } from '@/common/components/ui/Button'
import { Turnstile } from '@/common/components/ui/Turnstile'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'

// Prefills the access code field for local/dev convenience (defaults to the fixed
// bootstrap iam-client+Master access code) — any realm's users still type their own
// realm's access code to log in, this is just what's shown before they do.
const DEFAULT_CR_ACCESS_CODE = (import.meta.env.VITE_CR_ACCESS_CODE as string | undefined) ?? 'MASTER'

export function LoginForm() {
  const { t } = useTranslation('auth')
  const { login, isLoading } = useLogin()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

  const formik = useFormik<LoginFormValues>({
    initialValues: { crAccessCode: DEFAULT_CR_ACCESS_CODE, email: '', password: '', rememberDevice: false },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (!captchaToken) {
        toast.error('Please complete the verification challenge')
        setSubmitting(false)
        return
      }
      try {
        const user = await login(values, captchaToken)
        // `from` is wherever the browser was before hitting the login gate — if that
        // was a realm-scoped URL, it belongs to whoever was logged in *before*. If a
        // different account just signed in (browser left on a stale/foreign-realm
        // URL, or someone else's session), blindly honoring it lands the user on a
        // realm they have no relationship to. Only trust `from` when it's not
        // realm-scoped, or already points at this user's own realm — including for
        // master users: a fresh login should always land in the user's OWN default
        // realm, never wherever they happened to be browsing before signing out.
        const realmMatch = from.match(/^\/r\/([^/]+)\//)
        // Master-only top-level pages (routes.config.tsx: /realms, /realms/new — no
        // /r/:realmId prefix, so realmMatch above never catches these) must never be
        // trusted for a non-Master account either, for the same reason: the browser
        // could've been left on /realms by a Master admin, then a tenant admin signs
        // in on the same machine and would otherwise get bounced there and rejected.
        const isMasterOnlyPath = from === '/realms' || from.startsWith('/realms/')
        const safeToReturn = realmMatch
          ? realmMatch[1] === user?.realmId
          : isMasterOnlyPath
            ? Boolean(user?.isMasterRealmUser)
            : true
        const defaultDestination = user?.realmId ? `/r/${user.realmId}/dashboard` : '/'
        navigate(safeToReturn ? from : defaultDestination, { replace: true })
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
        label={t('crAccessCode')}
        name="crAccessCode"
        value={formik.values.crAccessCode}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.crAccessCode ? formik.errors.crAccessCode : undefined}
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

      <Turnstile onVerify={setCaptchaToken} />

      <Button type="submit" loading={isLoading || formik.isSubmitting} className="mt-2">
        {t('signIn')}
      </Button>
    </form>
  )
}
