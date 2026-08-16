import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'

/** The one-time branded "start-like" reveal shown during AuthBootstrap's silent-refresh
 * phase — this is the single place the app leans into a heavier entrance animation. */
export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-primary to-secondary">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex size-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm"
      >
        <ShieldCheck className="size-10 text-white" strokeWidth={1.75} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="text-center"
      >
        <p className="text-lg font-semibold text-white">IAM Console</p>
        <p className="text-sm text-white/70">Verifying your session…</p>
      </motion.div>

      <motion.div
        className="h-1 w-40 overflow-hidden rounded-full bg-white/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <motion.div
          className="h-full w-1/3 rounded-full bg-white"
          animate={{ x: ['-100%', '220%'] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  )
}
