import { useState } from 'react'
import { useGetRealmSettingsQuery } from '@/api/endpoints/realm.api'
import { useRealmMutations } from '@/features/realms/hooks/useRealmMutations'
import { Button } from '@/common/components/ui/Button'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'

/** Free-form JSON editor for realm.settings (accessTokenTTL, refreshTokenTTL,
 * allowRegistration, passwordPolicy, ...) — the backend's own UpdateRealmSettings
 * body is `Record<string, unknown>` passed straight through with no fixed schema,
 * so a raw JSON textarea (validated client-side before submit) mirrors that. */
export function RealmSettingsJsonEditor({ realmId }: { realmId: string }) {
  const { data, isLoading, refetch } = useGetRealmSettingsQuery(realmId)
  const { updateRealmSettings, isUpdatingSettings } = useRealmMutations()
  const canUpdate = useCan(ResourceName.REALM, TypeAction.UPDATE)

  const [draft, setDraft] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-2">
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const savedJson = JSON.stringify(data?.data ?? {}, null, 2)
  const value = draft ?? savedJson

  async function handleSave() {
    try {
      const parsed = JSON.parse(value) as Record<string, unknown>
      setParseError(null)
      await updateRealmSettings(realmId, parsed)
      setDraft(null)
      void refetch()
    } catch {
      setParseError('Invalid JSON — fix the syntax before saving.')
    }
  }

  return (
    <div className="max-w-2xl">
      <textarea
        value={value}
        onChange={(e) => setDraft(e.target.value)}
        disabled={!canUpdate}
        spellCheck={false}
        rows={14}
        className="w-full rounded-lg border border-border bg-surface p-3 font-mono text-xs text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {parseError && <p className="mt-1 text-xs text-danger">{parseError}</p>}

      {canUpdate && (
        <div className="mt-3 flex gap-2">
          <Button size="sm" loading={isUpdatingSettings} onClick={() => void handleSave()} disabled={draft === null}>
            Save settings
          </Button>
          {draft !== null && (
            <Button size="sm" variant="outline" onClick={() => { setDraft(null); setParseError(null) }}>
              Discard changes
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
