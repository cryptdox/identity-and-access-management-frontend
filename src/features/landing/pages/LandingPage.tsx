import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Building2, KeyRound, Activity, LayoutGrid, Lock, Gauge, FileCheck2, Headset } from 'lucide-react'
import { Button } from '@/common/components/ui/Button'
import { Modal } from '@/common/components/ui/Modal'
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

const ENTERPRISE_POINTS = [
  {
    icon: ShieldCheck,
    title: 'Strict tenant isolation',
    description: 'Every realm — its users, roles, sessions, and settings — is walled off at the data layer, not just the UI.',
  },
  {
    icon: FileCheck2,
    title: 'Immutable audit history',
    description: 'Logins, permission grants, and every package change are logged append-only, so nothing gets rewritten after the fact.',
  },
  {
    icon: Gauge,
    title: 'Governed usage, not surprises',
    description: 'User and concurrent-session limits are enforced by the plan you’re on — upgrades and downgrades are explicit, reviewed actions.',
  },
  {
    icon: Headset,
    title: 'A human reviews every new tenant',
    description: 'Self-serve requests are provisioned disabled by default until an administrator approves them — no anonymous org springs to life unreviewed.',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Request access',
    description: 'Tell us your organization name and admin details. No card required, no realm is active yet.',
  },
  {
    step: '02',
    title: 'An administrator reviews it',
    description: 'Your request lands in the console’s review queue, disabled by default, until it’s approved or declined.',
  },
  {
    step: '03',
    title: 'Manage your realm',
    description: 'Once approved, sign in and start creating users, roles, and groups — upgrade your plan whenever you’re ready.',
  },
]

const FAQS = [
  {
    q: 'How long is the free trial?',
    a: 'Every new realm starts on a free Trial plan for one month — 10 users, 5 concurrent logins — with no card required.',
  },
  {
    q: 'How long does approval take?',
    a: 'Requests are reviewed by an administrator, not a bot. Most are reviewed promptly, but there’s no hard SLA on the free tier.',
  },
  {
    q: 'What happens if I go over my plan’s user limit?',
    a: 'You’ll be blocked from adding more users until you upgrade or deactivate existing ones — nothing is ever deleted automatically.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Yes. Upgrades and downgrades are requested from inside the console and reviewed before they take effect, with prorated pricing shown upfront.',
  },
  {
    q: 'Is my organization’s data isolated from others?',
    a: 'Yes — every realm is a fully separate boundary for users, roles, groups, sessions, and settings. Nothing is shared across realms.',
  },
]

export default function LandingPage() {
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const openRequestModal = () => setRequestModalOpen(true)

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
          <Button size="lg" onClick={openRequestModal}>
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

      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
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

      <section className="bg-surface-alt px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold text-text">Built for security-conscious teams</h2>
            <p className="mt-2 text-text-secondary">
              The safeguards below aren’t an add-on tier — they’re how every realm works from the moment it’s created.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {ENTERPRISE_POINTS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex gap-4 rounded-2xl border border-border bg-surface p-6"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <p.icon className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-text">{p.title}</p>
                  <p className="mt-1.5 text-sm text-text-secondary">{p.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PricingSection onRequestAccess={openRequestModal} />

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-text">How it works</h2>
          <p className="mt-2 text-text-secondary">From request to a fully managed realm, in three steps.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <p className="text-sm font-semibold text-primary">{s.step}</p>
              <p className="mt-2 font-semibold text-text">{s.title}</p>
              <p className="mt-1.5 text-sm text-text-secondary">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="faq" className="bg-surface-alt px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-text">Frequently asked questions</h2>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-xl border border-border bg-surface p-4">
                <summary className="cursor-pointer list-none font-medium text-text marker:content-none">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm text-text-secondary">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 rounded-3xl bg-gradient-to-br from-primary to-secondary px-6 py-14 text-center text-white">
          <h2 className="text-3xl font-semibold">Ready to bring order to your access control?</h2>
          <p className="max-w-xl text-white/85">
            Start free, request an Enterprise plan, or just take a look around — an administrator reviews every request personally.
          </p>
          <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10" onClick={openRequestModal}>
            Request access
          </Button>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-12 text-sm text-text-secondary">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 text-text">
              <ShieldCheck className="size-5 text-primary" />
              <span className="font-semibold">IAM Console</span>
            </div>
            <p className="mt-3">Multi-tenant identity &amp; access management — realms, roles, and audit logging in one console.</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="font-semibold text-text">Product</p>
              <ul className="mt-3 flex flex-col gap-2">
                <li>
                  <button
                    type="button"
                    className="hover:text-text"
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="hover:text-text"
                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="hover:text-text"
                    onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-text">Get started</p>
              <ul className="mt-3 flex flex-col gap-2">
                <li>
                  <button type="button" className="hover:text-text" onClick={openRequestModal}>
                    Request access
                  </button>
                </li>
                <li>
                  <Link to="/login" className="hover:text-text">
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-6xl border-t border-border pt-6 text-xs">
          © {new Date().getFullYear()} IAM Console — Identity &amp; Access Management.
        </div>
      </footer>

      <Modal open={requestModalOpen} onClose={() => setRequestModalOpen(false)} title="Start your free trial" size="md">
        <RequestRealmForm />
      </Modal>
    </div>
  )
}
