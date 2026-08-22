import { useFormik } from 'formik'
import { useNavigate } from 'react-router-dom'
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
  const { updateRealm, deleteRealm, isUpdating, isDeleting } = useRealmMutations()
  const navigate = useNavigate()
  const { user, isMasterRealmUser } = useCurrentUser()
  const canUpdate = useCan(ResourceName.REALM, TypeAction.UPDATE)
  // Realm deletion is Master-only on the backend regardless of the REALM:DELETE
  // permission grant (which every tenant admin also has, since permissions here are
  // global, not realm-scoped) — see realm.middlewares.ts.
  const canDelete = useCan(ResourceName.REALM, TypeAction.DELETE) && isMasterRealmUser
  // isMasterRealmUser alone is the CURRENT USER's status, not "is THIS realm being
  // viewed the Master realm" — a Master admin can browse other realms' settings too.
  // Only true when the realm on screen is that admin's own (Master) realm.
  const isViewingMasterRealm = isMasterRealmUser && realm.realmId === user?.realmId

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
      message: `This permanently deletes "${realm.name}" and everything in it — users, groups, roles, clients. This cannot be undone.`,
      confirmLabel: 'Delete realm',
      danger: true,
    })
    if (!confirmed) return
    await deleteRealm(realm.realmId)
    navigate('/realms', { replace: true })
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

      {canDelete && (
        <div className="max-w-lg rounded-xl border border-danger/30 bg-danger/5 p-4">
          <p className="text-sm font-medium text-danger">Danger zone</p>
          <p className="mt-1 text-sm text-text-secondary">
            Deleting a realm removes all of its users, groups, roles, and clients.
          </p>
          <Button
            variant="danger"
            size="sm"
            className="mt-3"
            loading={isDeleting}
            onClick={() => void handleDelete()}
          >
            Delete realm
          </Button>
        </div>
      )}
    </div>
  )
}
