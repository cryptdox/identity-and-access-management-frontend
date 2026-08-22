import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import {
  useGetClientRedirectUriKindsQuery,
  useGetClientRedirectUrisQuery,
  useUpdateClientRedirectUrisMutation,
} from '@/api/endpoints/client.api'
import { Input } from '@/common/components/ui/Input'
import { Button } from '@/common/components/ui/Button'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useCan } from '@/common/hooks/usePermission'
import { ClientOwnerOnlyNotice } from '@/common/components/ui/ClientOwnerOnlyNotice'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import type {
  Client,
  ClientRedirectUriKindData,
  ClientRedirectUriKindMeta,
  ClientRedirectUriParam,
  ClientRedirectUriParamType,
} from '@/features/clients/client.types'

const PARAM_TYPE_OPTIONS: ClientRedirectUriParamType[] = ['STRING', 'NUMBER', 'BOOLEAN']

/** Lowercases and collapses whitespace to hyphens — deliberately doesn't touch
 * `:`, `/`, `.` etc. so a real URL (e.g. LOGIN_CALLBACK's
 * "http://localhost:3000/callback") survives intact; only free-text path
 * variables actually get "compressed" into a slug. */
function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-')
}

/** One ClientRedirectUriKind's full editable state — its ordered value list
 * AND its admin-defined param schema (name/type pairs describing what each
 * value position holds) — own draft state, dirty check, and save call, same
 * shape as RealmSettingsForm's per-key fields. */
function useRedirectUriKindField(
  kind: string,
  serverData: ClientRedirectUriKindData,
  onSave: (kind: string, data: ClientRedirectUriKindData) => Promise<void>,
) {
  const initialValues = () => (serverData.values.length ? serverData.values : [''])
  const initialParam = () => serverData.param
  const [values, setValues] = useState<string[]>(initialValues)
  const [param, setParam] = useState<ClientRedirectUriParam[]>(initialParam)
  const [saving, setSaving] = useState(false)
  const dirty =
    JSON.stringify(values) !== JSON.stringify(initialValues()) || JSON.stringify(param) !== JSON.stringify(initialParam())

  useEffect(() => {
    setValues(initialValues())
    setParam(initialParam())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(serverData)])

  function updateAt(index: number, value: string) {
    setValues((prev) => prev.map((v, i) => (i === index ? value : v)))
  }
  function addRow() {
    setValues((prev) => [...prev, ''])
  }
  function removeRow(index: number) {
    setValues((prev) => prev.filter((_, i) => i !== index))
  }

  function addParamRow() {
    setParam((prev) => [...prev, { name: '', type: 'STRING' }])
  }
  function updateParamName(index: number, name: string) {
    setParam((prev) => prev.map((p, i) => (i === index ? { ...p, name } : p)))
  }
  function updateParamType(index: number, type: ClientRedirectUriParamType) {
    setParam((prev) => prev.map((p, i) => (i === index ? { ...p, type } : p)))
  }
  function removeParamRow(index: number) {
    setParam((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setSaving(true)
    try {
      // Ordering is preserved by construction — map/filter never reorder.
      const cleanValues = values.map(slugify).filter(Boolean)
      const cleanParam = param.map((p) => ({ ...p, name: p.name.trim() })).filter((p) => p.name.length > 0)
      await onSave(kind, { values: cleanValues, param: cleanParam })
    } finally {
      setSaving(false)
    }
  }

  return {
    values,
    updateAt,
    addRow,
    removeRow,
    param,
    addParamRow,
    updateParamName,
    updateParamType,
    removeParamRow,
    dirty,
    saving,
    handleSave,
  }
}

function ClientRedirectUriKindField({
  meta,
  serverData,
  canUpdate,
  onSave,
}: {
  meta: ClientRedirectUriKindMeta
  serverData: ClientRedirectUriKindData
  canUpdate: boolean
  onSave: (kind: string, data: ClientRedirectUriKindData) => Promise<void>
}) {
  const {
    values,
    updateAt,
    addRow,
    removeRow,
    param,
    addParamRow,
    updateParamName,
    updateParamType,
    removeParamRow,
    dirty,
    saving,
    handleSave,
  } = useRedirectUriKindField(meta.kind, serverData, onSave)

  return (
    <section className="space-y-5 rounded-xl border border-border p-4">
      <h3 className="text-sm font-medium text-text">{meta.label}</h3>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Values</p>
        <div className="space-y-2">
          {values.map((value, i) => (
            <div key={i} className="grid grid-cols-[1fr_2.5rem] items-center gap-3">
              <Input
                value={value}
                onChange={(e) => updateAt(i, e.target.value)}
                disabled={!canUpdate}
                placeholder={param[i]?.name || `Value ${i + 1}`}
                className="w-full"
              />
              {canUpdate && values.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="justify-self-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label="Remove"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {canUpdate && (
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="size-4" /> Add value
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Expected path variables</p>
        <div className="space-y-2">
          {param.map((p, i) => (
            <div key={i} className="grid grid-cols-[1fr_8rem_2.5rem] items-center gap-3">
              <Input
                value={p.name}
                onChange={(e) => updateParamName(i, e.target.value)}
                disabled={!canUpdate}
                placeholder="Name"
                className="w-full"
              />
              <select
                value={p.type}
                onChange={(e) => updateParamType(i, e.target.value as ClientRedirectUriParamType)}
                disabled={!canUpdate}
                className="h-9 w-full rounded-lg border border-border bg-surface px-2 text-sm text-text disabled:opacity-60"
              >
                {PARAM_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {canUpdate && (
                <button
                  type="button"
                  onClick={() => removeParamRow(i)}
                  className="justify-self-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label="Remove param"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          ))}
          {param.length === 0 && <p className="text-xs text-text-secondary">No expected path variables defined.</p>}
        </div>
        {canUpdate && (
          <Button type="button" variant="outline" size="sm" onClick={addParamRow}>
            <Plus className="size-4" /> Add param
          </Button>
        )}
      </div>

      {canUpdate && dirty && (
        <Button size="sm" loading={saving} onClick={() => void handleSave()}>
          Save
        </Button>
      )}
    </section>
  )
}

export function ClientRedirectUrisForm({ client }: { client: Client }) {
  const clientIdInternal = client.clientIdInternal
  const { data: kindsData, isLoading: isLoadingKinds } = useGetClientRedirectUriKindsQuery()
  const { data: urisData, isLoading: isLoadingUris, refetch } = useGetClientRedirectUrisQuery(clientIdInternal)
  const [updateMutation] = useUpdateClientRedirectUrisMutation()
  // Editing is restricted server-side to this client's owning realm (clientMiddleware's
  // PUT branch) — a realm merely using a shared client (e.g. every tenant via
  // iam-client) can view but not change it, same rule as ClientGeneralTab/ClientSecretTab.
  const canUpdate = useCan(ResourceName.CLIENT, TypeAction.UPDATE) && Boolean(client.isOwner)
  const toast = useToast()

  const kinds = kindsData?.data ?? []
  const uriMap = urisData?.data ?? {}

  async function save(kind: string, data: ClientRedirectUriKindData) {
    try {
      await updateMutation({ clientIdInternal, body: { [kind]: data } }).unwrap()
      toast.success('Redirect URIs updated')
      void refetch()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update redirect URIs'))
    }
  }

  if (isLoadingKinds || isLoadingUris) {
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
      {!client.isOwner && (
        <ClientOwnerOnlyNotice feature="edit redirect URIs" clientName={client.clientId ?? undefined} />
      )}
      {kinds.map((meta) => (
        <ClientRedirectUriKindField
          key={meta.kind}
          meta={meta}
          serverData={uriMap[meta.kind] ?? { values: [], param: meta.param }}
          canUpdate={canUpdate}
          onSave={save}
        />
      ))}
    </div>
  )
}
