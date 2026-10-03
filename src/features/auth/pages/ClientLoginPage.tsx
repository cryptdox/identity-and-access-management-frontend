import { useEffect, useRef, useState } from 'react'
import { useFormik } from 'formik'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { loginSchema } from '@/features/auth/schemas/login.schema'
import { useLoginMutation } from '@/api/endpoints/auth.api'
import type { LoginResponseDto } from '@/features/auth/auth.types'
import { Input } from '@/common/components/ui/Input'
import { Button } from '@/common/components/ui/Button'
import { Turnstile } from '@/common/components/ui/Turnstile'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'

const clientLoginSchema = loginSchema.pick(['email', 'password'])

/** Hands the session to the external client app via the URL fragment (never sent
 * to any server, and the receiving app strips it from history on arrival). The
 * target is the backend-validated redirectUri, never the raw query param. */
function buildClientRedirectUrl(data: LoginResponseDto): string {
  const url = new URL(data.redirectUri!)
  url.hash = new URLSearchParams({
    access_token: data.accessToken,
    refresh_token: data.refreshToken,
    user: JSON.stringify(data.user),
  }).toString()
  return url.toString()
}

/**
 * Hosted login for external client apps (e.g. batools):
 * /sso/login?crAccessCode=XXXX[&redirectUri=...][&embed=true][&theme=light|dark]
 * Signs in as THAT client (the access code stays hidden) — nothing is stored in
 * this console. Default: sends the user back to the client's LOGIN_CALLBACK URI.
 * embed=true (page shown in the client's iframe): posts the session to the parent
 * window instead, addressed only to the validated redirectUri's origin so no other
 * page framing this one can receive it.
 */
export default function ClientLoginPage() {
  const { t } = useTranslation('auth')
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const crAccessCode = searchParams.get('crAccessCode') ?? ''
  const redirectUri = searchParams.get('redirectUri') ?? undefined
  const embedded = searchParams.get('embed') === 'true' && window.parent !== window
  const contentRef = useRef<HTMLDivElement>(null)

  // Lets the parent size its iframe to the form (validation errors change height).
  // Height alone isn't sensitive, so '*' is fine here — unlike the session below.
  // Let the host page's card show through, so the form looks native to it.
  useEffect(() => {
    if (!embedded) return
    document.documentElement.style.background = 'transparent'
    document.body.style.background = 'transparent'
  }, [embedded])

  useEffect(() => {
    if (!embedded || !contentRef.current) return
    const el = contentRef.current
    const observer = new ResizeObserver(() => {
      window.parent.postMessage({ type: 'iam:resize', height: Math.ceil(el.getBoundingClientRect().height) }, '*')
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [embedded])
  const [loginMutation] = useLoginMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: clientLoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (!captchaToken) {
        toast.error('Please complete the verification challenge')
        setSubmitting(false)
        return
      }
      try {
        const result = await loginMutation({
          crAccessCode,
          email: values.email,
          password: values.password,
          captchaToken,
          redirect: true,
          redirectUri,
        }).unwrap()
        if (!result.data?.redirectUri) throw new Error('Login response missing redirect URI')
        if (embedded) {
          const { accessToken, refreshToken, user } = result.data
          window.parent.postMessage(
            { type: 'iam:login', session: { accessToken, refreshToken, user } },
            new URL(result.data.redirectUri).origin,
          )
          return
        }
        window.location.replace(buildClientRedirectUrl(result.data))
      } catch (err) {
        toast.error(getApiErrorMessage(err, t('invalidCredentials')))
        setSubmitting(false)
      }
    },
  })

  return (
    <div className={embedded ? undefined : 'flex min-h-screen items-center justify-center bg-bg p-6'}>
      <motion.div
        ref={contentRef}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={embedded ? 'w-full p-1' : 'w-full max-w-sm'}
      >
        {/* Embedded, the host app brands the page; IAM shows only in the footer below. */}
        {!embedded && (
          <div className="mb-8 flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg">
              <ShieldCheck className="size-7" />
            </div>
          </div>
        )}

        {!crAccessCode ? (
          <p className="text-center text-sm text-danger">{t('missingAccessCode')}</p>
        ) : (
          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
            <Input
              label={t('email')}
              name="email"
              type="email"
              autoComplete="username"
              autoFocus
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

            <Turnstile onVerify={setCaptchaToken} />

            <Button type="submit" loading={formik.isSubmitting} className="mt-2">
              {t('signIn')}
            </Button>
          </form>
        )}

        {embedded && (
          <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-text-secondary">
            <ShieldCheck className="size-3.5 text-primary" />
            {t('securedByIam')}
          </div>
        )}
      </motion.div>
    </div>
  )
}
