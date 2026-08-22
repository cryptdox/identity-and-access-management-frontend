import { useEffect, useState } from 'react'
import { Eye, EyeOff, RefreshCw } from 'lucide-react'
import { useGetRealmSettingKeysQuery, useGetRealmSettingsQuery } from '@/api/endpoints/realm.api'
import { useRealmMutations } from '@/features/realms/hooks/useRealmMutations'
import { Input } from '@/common/components/ui/Input'
import { Button } from '@/common/components/ui/Button'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { confirm } from '@/common/utils/confirm'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import type { RealmSettingKeyMeta } from '@/features/realms/realm.types'

function generateSecretHex(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/** One row per RealmSettingKey, entirely driven by its metadata (valueType +
 * sensitive) — adding a key on the backend needs no frontend change, it just
 * shows up here rendered with whichever input that valueType maps to. */
function RealmSettingField({
  meta,
  currentValue,
  canUpdate,
  onSave,
}: {
  meta: RealmSettingKeyMeta
  currentValue: unknown
  canUpdate: boolean
  onSave: (key: string, value: unknown) => Promise<unknown>
}) {
  const isBoolean = meta.valueType === 'BOOLEAN'
  const isNumber = meta.valueType === 'NUMBER'
  const isJson = meta.valueType === 'JSON'

  const toDraft = (value: unknown): string | boolean => {
    if (isBoolean) return Boolean(value)
    if (isJson) return JSON.stringify(value ?? {}, null, 2)
    return value === undefined || value === null ? '' : String(value)
  }

  const [draft, setDraft] = useState(toDraft(currentValue))
  const [revealed, setRevealed] = useState(!meta.sensitive)
  const [saving, setSaving] = useState(false)
  const [jsonError, setJsonError] = useState<string | null>(null)

  useEffect(() => {
    setDraft(toDraft(currentValue))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(currentValue)])

  const dirty = draft !== toDraft(currentValue)

  async function handleSave() {
    let value: unknown = draft
    if (isNumber) value = Number(draft)
    if (isJson) {
      try {
        value = JSON.parse(draft as string)
        setJsonError(null)
      } catch {
        setJsonError('Invalid JSON — fix the syntax before saving.')
        return
      }
    }
    setSaving(true)
    try {
      await onSave(meta.key, value)
    } finally {
      setSaving(false)
    }
  }

  function handleRegenerate() {
    setDraft(generateSecretHex())
  }

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium text-text">{meta.label}</h3>

      {isBoolean ? (
        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={draft as boolean}
            onChange={(e) => setDraft(e.target.checked)}
            disabled={!canUpdate}
            className="size-4 rounded border-border text-primary focus:ring-primary/30"
          />
          {meta.label}
        </label>
      ) : meta.sensitive && !revealed ? (
        <div className="grid grid-cols-[1fr_2.5rem] items-center gap-3">
          <code className="min-w-0 w-full truncate rounded-lg border border-border bg-surface-alt/50 px-3 py-2 font-mono text-sm text-text">
            {'•'.repeat(24)}
          </code>
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="justify-self-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-alt"
            aria-label="Show value"
          >
            <Eye className="size-4" />
          </button>
        </div>
      ) : isJson ? (
        <textarea
          value={draft as string}
          onChange={(e) => setDraft(e.target.value)}
          disabled={!canUpdate}
          spellCheck={false}
          rows={6}
          className="w-full rounded-lg border border-border bg-surface p-3 font-mono text-xs text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      ) : (
        <div className="grid grid-cols-[1fr_2.5rem] items-center gap-3">
          <Input
            type={isNumber ? 'number' : 'text'}
            value={draft as string}
            onChange={(e) => setDraft(e.target.value)}
            disabled={!canUpdate}
            className="w-full"
          />
          {meta.sensitive && (
            <button
              type="button"
              onClick={() => setRevealed(false)}
              className="justify-self-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-alt"
              aria-label="Hide value"
            >
              <EyeOff className="size-4" />
            </button>
          )}
        </div>
      )}

      {jsonError && <p className="text-xs text-danger">{jsonError}</p>}

      {canUpdate && (
        <div className="flex items-center gap-2">
          {dirty && (
            <Button size="sm" loading={saving} onClick={() => void handleSave()}>
              Save
            </Button>
          )}
          {meta.sensitive && meta.valueType === 'STRING' && (revealed || dirty) && (
            <Button variant="outline" size="sm" onClick={handleRegenerate}>
              <RefreshCw className="size-4" /> Regenerate
            </Button>
          )}
        </div>
      )}
    </section>
  )
}

export function RealmSettingsForm({ realmId }: { realmId: string }) {
  const { data: keysData, isLoading: isLoadingKeys } = useGetRealmSettingKeysQuery()
  const { data: settingsData, isLoading: isLoadingSettings, refetch } = useGetRealmSettingsQuery(realmId)
  const { updateRealmSettings } = useRealmMutations()
  const canUpdate = useCan(ResourceName.REALM, TypeAction.UPDATE)

  const keys = keysData?.data ?? []
  const settings = settingsData?.data ?? {}

  async function handleSave(key: string, value: unknown) {
    const result = await updateRealmSettings(realmId, { [key]: value })
    void refetch()
    return result
  }

  async function handleRotateSecretConfirm(): Promise<boolean> {
    return confirm({
      title: 'Rotate realm secret',
      message: 'This immediately invalidates every active session and token in this realm. Users will need to log in again.',
      confirmLabel: 'Rotate secret',
      danger: true,
    })
  }

  if (isLoadingKeys || isLoadingSettings) {
    return (
      <div className="max-w-2xl space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      {keys.map((meta) => (
        <RealmSettingField
          key={meta.key}
          meta={meta}
          currentValue={settings[meta.key]}
          canUpdate={canUpdate}
          onSave={async (key, value) => {
            if (key === 'SECRET') {
              const confirmed = await handleRotateSecretConfirm()
              if (!confirmed) return
            }
            return handleSave(key, value)
          }}
        />
      ))}
    </div>
  )
}
