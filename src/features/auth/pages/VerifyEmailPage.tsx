import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useVerifyEmailQuery } from '@/api/endpoints/auth.api'
import { getApiErrorMessage } from '@/common/utils/apiError'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const { isLoading, isSuccess, isError, error } = useVerifyEmailQuery(token ?? '', { skip: !token })

  let icon = <Loader2 className="size-14 animate-spin text-primary" />
  let title = 'Verifying your email…'
  let message = 'Hang on while we confirm your verification link.'

  if (!token) {
    icon = <XCircle className="size-14 text-danger" />
    title = 'Missing verification token'
    message = 'This link is missing its verification token — try clicking the link from your email again.'
  } else if (isSuccess) {
    icon = <CheckCircle2 className="size-14 text-success" />
    title = 'Email verified'
    message = 'Your email address has been verified. You can now sign in and use your account.'
  } else if (isError) {
    icon = <XCircle className="size-14 text-danger" />
    title = 'Verification failed'
    message = getApiErrorMessage(error, 'This link is invalid or has expired — request a new verification email and try again.')
  } else if (!isLoading) {
    icon = <Loader2 className="size-14 animate-spin text-primary" />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 text-center shadow-lg"
      >
        <div className="mb-6 flex items-center justify-center gap-2 text-text-secondary">
          <ShieldCheck className="size-5 text-primary" />
          <span className="text-sm font-semibold">IAM Console</span>
        </div>

        <motion.div
          key={title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center gap-4"
        >
          {icon}
          <div>
            <h1 className="text-lg font-semibold text-text">{title}</h1>
            <p className="mt-2 text-sm text-text-secondary">{message}</p>
          </div>
        </motion.div>

        <Link
          to="/login"
          className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Go to sign in
        </Link>
      </motion.div>
    </div>
  )
}
