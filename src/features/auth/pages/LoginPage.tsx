import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ShieldCheck } from 'lucide-react'
import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginPage() {
  const { t } = useTranslation('auth')
  return (
    <div className="flex min-h-screen bg-bg">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-secondary p-10 text-white lg:flex">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <ShieldCheck className="size-6" />
          <span className="font-semibold">IAM Console</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-3xl font-semibold leading-tight">{t('heroTitle')}</h1>
          <p className="mt-3 max-w-md text-white/75">{t('heroSubtitle')}</p>
        </motion.div>

        <div />
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 text-text">
              <ShieldCheck className="size-6 text-primary" />
              <span className="font-semibold">IAM Console</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-text">{t('signIn')}</h2>
          <p className="mt-1 text-sm text-text-secondary">{t('signInSubtitle')}</p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
