import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Building2, KeyRound, Activity, LayoutGrid, Lock } from 'lucide-react'
import { Button } from '@/common/components/ui/Button'
import { PricingSection } from '@/features/landing/components/PricingSection'
import { RequestRealmForm } from '@/features/landing/components/RequestRealmForm'

const FEATURES = [
  {
    icon: Building2,
    title: 'Multi-tenant realms',
    description: 'Isolate every customer or department into its own realm — users, roles, and data never cross boundaries.',
  },
  {
    icon: KeyRound,
    title: 'Fine-grained RBAC',
    description: 'Resource-level permissions, composite roles, and groups — model access exactly how your org is structured.',
  },
  {
    icon: Activity,
    title: 'Full audit trail',
    description: 'Every login, permission change, and admin action is logged — nothing happens silently.',
  },
  {
    icon: LayoutGrid,
    title: 'Live dashboards',
    description: 'Per-role dashboards with real usage charts, assignable to exactly the people who need them.',
  },
  {
    icon: Lock,
    title: 'Built-in safeguards',
    description: 'Rate limiting, CAPTCHA, and package-based usage limits are on by default — not bolted on later.',
  },
  {
    icon: ShieldCheck,
    title: 'You stay in control',
    description: 'Suspend, resize, or upgrade any tenant at any time — nothing is locked into a rigid annual plan.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between px-6 py-5 lg:px-10">
        <div className="flex items-center gap-2 text-text">
          <ShieldCheck className="size-6 text-primary" />
          <span className="font-semibold">IAM Console</span>
        </div>
        <Link to="/login">
          <Button size="sm" variant="outline">
            Sign in
          </Button>
        </Link>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-secondary px-6 py-24 text-center text-white lg:py-32">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-3xl text-4xl font-bold leading-tight lg:text-5xl"
        >
          Enterprise identity &amp; access management, without the enterprise wait
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-4 max-w-xl text-white/85"
        >
          Multi-tenant realms, role-based access control, and full audit logging — provisioned in minutes, not months.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <Button size="lg" onClick={() => document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' })}>
            Start free trial
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/40 text-white hover:bg-white/10"
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
          >
            View pricing
          </Button>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </div>
              <p className="font-semibold text-text">{f.title}</p>
              <p className="mt-1.5 text-sm text-text-secondary">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <PricingSection />

      <section id="get-started" className="mx-auto max-w-lg px-6 py-20">
        <RequestRealmForm />
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-sm text-text-secondary">
        IAM Console — Identity &amp; Access Management.
      </footer>
    </div>
  )
}
