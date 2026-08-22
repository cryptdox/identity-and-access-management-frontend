import { Copy } from 'lucide-react'
import { useToast } from '@/common/hooks/useToast'

export interface ClientIdentitySummary {
  clientIdInternal: string
  name?: string | null
  clientId: string
}

/** Same idea as UserIdentity — name ?? clientId instead of the raw internal
 * UUID, with a copy button for the business clientId (the identifier that's
 * actually useful to paste elsewhere, e.g. into an access-code config). */
export function ClientIdentity({ client, fallbackId }: { client?: ClientIdentitySummary; fallbackId: string }) {
  const toast = useToast()
  const label = client?.name ?? client?.clientId ?? fallbackId

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="truncate">{label}</span>
      {client?.clientId && (
        <button
          type="button"
          title="Copy client ID"
          aria-label="Copy client ID"
          onClick={(e) => {
            e.stopPropagation()
            void navigator.clipboard.writeText(client.clientId)
            toast.success('Client ID copied')
          }}
          className="shrink-0 rounded-md p-1 text-text-secondary transition-colors hover:bg-surface-alt hover:text-text"
        >
          <Copy className="size-3.5" />
        </button>
      )}
    </span>
  )
}
