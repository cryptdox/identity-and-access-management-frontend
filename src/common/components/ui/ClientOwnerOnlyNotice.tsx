import { Lock } from 'lucide-react'

/** Shown wherever a mutation is restricted to a client's owning realm — editing the
 * client itself, its roles, permission sets, or composite links. A realm merely USING
 * a shared client (e.g. every tenant logs in through iam-client, but only Master owns
 * it) can view but not change it. The mutation UI itself just silently disables in
 * that case; without this notice a non-owning realm's admin sees a read-only view
 * with no explanation, which reads as "the feature is missing" rather than "you don't
 * own this client." */
export function ClientOwnerOnlyNotice({ feature, clientName }: { feature: string; clientName?: string }) {
  return (
    <p className="mb-4 flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
      <Lock className="mt-0.5 size-4 shrink-0" />
      Only {clientName ? `"${clientName}"'s` : "this client's"} owning realm can {feature}. You can view it here, but not change it.
    </p>
  )
}
