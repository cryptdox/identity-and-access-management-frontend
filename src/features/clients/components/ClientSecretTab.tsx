import { useState } from 'react'
import { Eye, EyeOff, Copy, RefreshCw } from 'lucide-react'
import { useClientMutations } from '@/features/clients/hooks/useClientMutations'
import { Button } from '@/common/components/ui/Button'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { confirm } from '@/common/utils/confirm'
import { useToast } from '@/common/hooks/useToast'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import type { Client } from '@/features/clients/client.types'

export function ClientSecretTab({ client }: { client: Client }) {
  const canManage = useCan(ResourceName.CLIENT, TypeAction.UPDATE)
  const { rotateSecret, isUpdating } = useClientMutations()
  const toast = useToast()
  const [revealed, setRevealed] = useState(false)
  const [secret, setSecret] = useState(client.secret ?? '')

  if (client.type !== 'CONFIDENTIAL') {
    return <EmptyState title="No secret for this client" description="Public clients authenticate without a secret." />
  }

  function copy() {
    void navigator.clipboard.writeText(secret)
    toast.success('Copied to clipboard')
  }

  async function handleRotate() {
    const confirmed = await confirm({
      title: 'Rotate secret',
      message: 'This immediately invalidates the current secret. Any app using it will need the new one.',
      confirmLabel: 'Rotate secret',
      danger: true,
    })
    if (!confirmed) return
    const updated = await rotateSecret(client.clientIdInternal)
    if (updated?.secret) {
      setSecret(updated.secret)
      setRevealed(true)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg border border-border bg-surface-alt/50 px-3 py-2 font-mono text-sm text-text">
          {revealed ? secret : '•'.repeat(32)}
        </code>
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-alt"
          aria-label={revealed ? 'Hide secret' : 'Show secret'}
        >
          {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
        <button
          type="button"
          onClick={copy}
          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-alt"
          aria-label="Copy secret"
        >
          <Copy className="size-4" />
        </button>
      </div>

      {canManage && (
        <Button variant="outline" size="sm" className="mt-4" loading={isUpdating} onClick={() => void handleRotate()}>
          <RefreshCw className="size-4" /> Rotate secret
        </Button>
      )}
    </div>
  )
}
