import { useFormik } from 'formik'
import { useNavigate } from 'react-router-dom'
import { Copy } from 'lucide-react'
import { useClientMutations } from '@/features/clients/hooks/useClientMutations'
import { useRealmId } from '@/common/hooks/useRealmId'
import { Input } from '@/common/components/ui/Input'
import { Button } from '@/common/components/ui/Button'
import { confirm } from '@/common/utils/confirm'
import { useToast } from '@/common/hooks/useToast'
import { useCan } from '@/common/hooks/usePermission'
import { ClientOwnerOnlyNotice } from '@/common/components/ui/ClientOwnerOnlyNotice'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import type { Client } from '@/features/clients/client.types'

export function ClientGeneralTab({ client }: { client: Client }) {
  const realmId = useRealmId()
  const navigate = useNavigate()
  const toast = useToast()
  const { updateClient, deleteClient, isUpdating, isDeleting } = useClientMutations()
  // Editing/deleting a client is restricted server-side to its owning realm (client.isOwner
  // already folds in the Master bypass) — a realm merely using a shared client can't.
  const canUpdate = useCan(ResourceName.CLIENT, TypeAction.UPDATE) && Boolean(client.isOwner)
  const canDelete = useCan(ResourceName.CLIENT, TypeAction.DELETE) && Boolean(client.isOwner)

  const formik = useFormik({
    initialValues: {
      redirectUris: (client.redirectUris ?? []).join('\n'),
      accessTokenTTL: client.accessTokenTTL ?? 900,
      refreshTokenTTL: client.refreshTokenTTL ?? 604800,
      enabled: client.enabled ?? true,
    },
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await updateClient(client.clientIdInternal, {
          redirectUris: values.redirectUris
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          accessTokenTTL: Number(values.accessTokenTTL),
          refreshTokenTTL: Number(values.refreshTokenTTL),
          enabled: values.enabled,
        })
      } finally {
        setSubmitting(false)
      }
    },
  })

  async function handleDelete() {
    const confirmed = await confirm({
      title: 'Delete client',
      message: `Delete "${client.clientId}"? Any apps authenticating with it will stop working. This cannot be undone.`,
      confirmLabel: 'Delete client',
      danger: true,
    })
    if (!confirmed) return
    await deleteClient(client.clientIdInternal)
    navigate(`/r/${realmId}/clients`, { replace: true })
  }

  return (
    <div className="flex max-w-lg flex-col gap-8">
      {!client.isOwner && <ClientOwnerOnlyNotice feature="update or delete this client" clientName={client.clientId} />}
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-[120px_1fr] items-center gap-y-2 text-sm">
          <span className="text-text-secondary">Client ID</span>
          <span className="text-text">{client.clientId}</span>
          <span className="text-text-secondary">Type</span>
          <span className="text-text">{client.type}</span>
          {client.crAccessCode && (
            <>
              <span className="text-text-secondary">CR Access code</span>
              <span className="flex items-center gap-2">
                <code className="rounded-md border border-border bg-surface-alt/50 px-2 py-0.5 font-mono text-xs text-text">
                  {client.crAccessCode}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(client.crAccessCode!)
                    toast.success('Copied to clipboard')
                  }}
                  className="rounded-lg p-1 text-text-secondary transition-colors hover:bg-surface-alt"
                  aria-label="Copy access code"
                >
                  <Copy className="size-3.5" />
                </button>
              </span>
            </>
          )}
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-text">
          Redirect URIs (one per line)
          <textarea
            name="redirectUris"
            rows={3}
            value={formik.values.redirectUris}
            onChange={formik.handleChange}
            disabled={!canUpdate}
            className="rounded-lg border border-border bg-surface p-2 font-mono text-xs text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <Input
          label="Access token TTL (seconds)"
          name="accessTokenTTL"
          type="number"
          value={formik.values.accessTokenTTL}
          onChange={formik.handleChange}
          disabled={!canUpdate}
        />
        <Input
          label="Refresh token TTL (seconds)"
          name="refreshTokenTTL"
          type="number"
          value={formik.values.refreshTokenTTL}
          onChange={formik.handleChange}
          disabled={!canUpdate}
        />

        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            name="enabled"
            checked={formik.values.enabled}
            onChange={formik.handleChange}
            disabled={!canUpdate}
            className="size-4 rounded border-border text-primary focus:ring-primary/30"
          />
          Enabled
        </label>

        {canUpdate && (
          <Button type="submit" size="sm" className="w-fit" loading={isUpdating || formik.isSubmitting} disabled={!formik.dirty}>
            Save changes
          </Button>
        )}
      </form>

      {canDelete && (
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
          <p className="text-sm font-medium text-danger">Danger zone</p>
          <Button variant="danger" size="sm" className="mt-3" loading={isDeleting} onClick={() => void handleDelete()}>
            Delete client
          </Button>
        </div>
      )}
    </div>
  )
}
