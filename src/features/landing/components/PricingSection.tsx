import { useState } from 'react'
import { Check } from 'lucide-react'
import { useListPackageDefinitionsQuery } from '@/api/endpoints/realm.api'
import { Button } from '@/common/components/ui/Button'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { cn } from '@/common/utils/cn'
import type { BillingCycle, PackageTier } from '@/features/realms/realmPackage.types'

const TIER_ORDER: PackageTier[] = ['STARTER', 'GROWTH', 'BUSINESS', 'PRO', 'SCALE', 'ENTERPRISE']
const FEATURED_TIER: PackageTier = 'GROWTH'

export function PricingSection({ onRequestAccess }: { onRequestAccess: () => void }) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('MONTHLY')
  const { data, isLoading } = useListPackageDefinitionsQuery()

  const definitions = data?.data?.items ?? []
  const cards = TIER_ORDER.map((tier) => definitions.find((d) => d.tier === tier && d.billingCycle === billingCycle)).filter(
    Boolean,
  )

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-text">Simple, transparent pricing</h2>
        <p className="mt-2 text-text-secondary">Start free for 30 days. Upgrade, downgrade, or cancel anytime.</p>

        <div className="mt-6 inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1">
          {(['MONTHLY', 'YEARLY'] as const).map((cycle) => (
            <button
              key={cycle}
              type="button"
              onClick={() => setBillingCycle(cycle)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                billingCycle === cycle ? 'bg-primary text-white' : 'text-text-secondary hover:text-text',
              )}
            >
              {cycle === 'MONTHLY' ? 'Monthly' : 'Yearly'}
              {cycle === 'YEARLY' && <span className="ml-1 text-xs opacity-80">(2 months free)</span>}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((def) => {
            if (!def) return null
            const featured = def.tier === FEATURED_TIER
            return (
              <div
                key={def.packageDefinitionId}
                className={cn(
                  'flex flex-col rounded-2xl border p-6',
                  featured ? 'border-primary bg-primary/5 shadow-lg' : 'border-border bg-surface',
                )}
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">{def.tier}</p>
                <p className="mt-2 text-3xl font-bold text-text">
                  {def.price == null ? 'Contact us' : `$${def.price}`}
                  {def.price != null && <span className="text-sm font-normal text-text-secondary">/{billingCycle === 'YEARLY' ? 'yr' : 'mo'}</span>}
                </p>
                <ul className="mt-4 flex flex-col gap-2 text-sm text-text-secondary">
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-success" />
                    {def.userLimit == null ? 'Unlimited users' : `Up to ${def.userLimit} users`}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-success" />
                    {def.concurrentLoginLimit == null ? 'Unlimited concurrent logins' : `${def.concurrentLoginLimit} concurrent logins`}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-4 text-success" />
                    Multi-tenant realms, RBAC, audit log
                  </li>
                </ul>
                <Button variant={featured ? 'primary' : 'outline'} size="sm" className="mt-6" onClick={onRequestAccess}>
                  {def.price == null ? 'Talk to sales' : 'Start free trial'}
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
