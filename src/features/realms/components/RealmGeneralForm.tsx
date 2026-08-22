import { useFormik } from 'formik'
import { updateRealmSchema, type UpdateRealmFormValues } from '@/features/realms/schemas/realm.schema'
import { useRealmMutations } from '@/features/realms/hooks/useRealmMutations'
import { Input } from '@/common/components/ui/Input'
import { Button } from '@/common/components/ui/Button'
import { confirm } from '@/common/utils/confirm'
import { useCan } from '@/common/hooks/usePermission'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import type { Realm } from '@/features/realms/realm.types'

export function RealmGeneralForm({ realm }: { realm: Realm }) {
  const {
    updateRealm,
    resetRateLimiters,
    resetAllRateLimiters,
    isUpdating,
    isResettingRateLimiters,
    isResettingAllRateLimiters,
  } = useRealmMutations()
  const { user, isMasterRealmUser } = useCurrentUser()
  const canUpdate = useCan(ResourceName.REALM, TypeAction.UPDATE)
  // isMasterRealmUser alone is the CURRENT USER's status, not "is THIS realm being
  // viewed the Master realm" — a Master admin can browse other realms' settings too.
  // Only true when the realm on screen is that admin's own (Master) realm.
  const isViewingMasterRealm = isMasterRealmUser && realm.realmId === user?.realmId
  // "Delete" a realm is really a soft-disable (enabled: false, same PUT the "Realm
  // enabled" checkbox above already uses) — never a hard delete, so any realm's own
  // admin can do it to their own realm, not just Master. Master itself can never be
  // deleted this way (no button shown at all), since disabling it would lock every
  // admin — including Master's own — out of the whole console.
  const canDelete = canUpdate && !isViewingMasterRealm

  const formik = useFormik<UpdateRealmFormValues>({
    initialValues: { name: realm.name, enabled: realm.enabled },
    validationSchema: updateRealmSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await updateRealm(realm.realmId, values)
      } finally {
        setSubmitting(false)
      }
    },
  })

  async function handleDelete() {
    const confirmed = await confirm({
      title: 'Delete realm',
      message: `Deleting "${realm.name}" disables it immediately — logins, registration, and API access for this realm stop working. Its users, data, and configuration are kept and this can be undone later by re-enabling the realm.`,
      confirmationText: realm.name,
      confirmLabel: 'Delete realm',
      danger: true,
    })
    if (!confirmed) return
    await updateRealm(realm.realmId, { enabled: false })
  }

  async function handleResetRateLimiters() {
    const confirmed = await confirm({
      title: 'Reset rate limiters',
      message: `Clears every login/register/email/reset-password rate-limit counter for "${realm.name}". Anyone currently blocked can retry immediately — only use this if someone is legitimately locked out.`,
      confirmLabel: 'Reset rate limiters',
    })
    if (!confirmed) return
    await resetRateLimiters(realm.realmId)
  }

  async function handleResetAllRateLimiters() {
    const confirmed = await confirm({
      title: 'Reset all rate limiters',
      message:
        "Clears login/register/email/reset-password rate-limit counters for EVERY realm, not just this one. Anyone currently blocked anywhere can retry immediately — only use this for a genuine platform-wide issue.",
      confirmLabel: 'Reset all rate limiters',
      danger: true,
    })
    if (!confirmed) return
    await resetAllRateLimiters()
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={formik.handleSubmit} className="flex max-w-lg flex-col gap-4">
        <Input
          label="Realm name"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled
          error={formik.touched.name ? formik.errors.name : undefined}
        />

        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            name="enabled"
            checked={formik.values.enabled}
            onChange={formik.handleChange}
            disabled={!canUpdate || isViewingMasterRealm}
            className="size-4 rounded border-border text-primary focus:ring-primary/30"
          />
          Realm enabled
        </label>

        {canUpdate && (
          <Button
            type="submit"
            size="sm"
            className="w-fit"
            loading={isUpdating || formik.isSubmitting}
            disabled={!formik.dirty}
          >
            Save changes
          </Button>
        )}
      </form>

      {canUpdate && (
        <div className="max-w-lg rounded-xl border border-border bg-surface-alt/50 p-4">
          <p className="text-sm font-medium text-text">Rate limiting</p>
          <p className="mt-1 text-sm text-text-secondary">
            Clears this realm's login/register/email/reset-password rate-limit counters. Use this if
            someone got legitimately locked out during testing.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              loading={isResettingRateLimiters}
              onClick={() => void handleResetRateLimiters()}
            >
              Reset rate limiters
            </Button>
            {isMasterRealmUser && (
              <Button
                variant="outline"
                size="sm"
                loading={isResettingAllRateLimiters}
                onClick={() => void handleResetAllRateLimiters()}
              >
                Reset all realms' rate limiters
              </Button>
            )}
          </div>
        </div>
      )}

      {canDelete && (
        <div className="max-w-lg rounded-xl border border-danger/30 bg-danger/5 p-4">
          <p className="text-sm font-medium text-danger">Danger zone</p>
          <p className="mt-1 text-sm text-text-secondary">
            Deleting a realm disables it — logins and API access stop immediately, but nothing is
            actually erased. Re-enable it above at any time to restore access.
          </p>
          <Button
            variant="danger"
            size="sm"
            className="mt-3"
            loading={isUpdating}
            onClick={() => void handleDelete()}
          >
            Delete realm
          </Button>
        </div>
      )}
    </div>
  )
}
