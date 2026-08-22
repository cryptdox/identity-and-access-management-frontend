import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetRoleQuery } from '@/api/endpoints/role.api'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { Badge } from '@/common/components/ui/Badge'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { Tabs } from '@/common/components/ui/Tabs'
import { RoleGeneralTab } from '@/features/roles/components/RoleGeneralTab'
import { CompositeRoleEditor } from '@/features/roles/components/CompositeRoleEditor'
import { RolePermissionPanel } from '@/features/roles/components/RolePermissionPanel'
import { RoleUsersTab } from '@/features/roles/components/RoleUsersTab'
import { RoleDashboardViewsTab } from '@/features/dashboard/components/RoleDashboardViewsTab'

/** Dashboard views only exist for the admin console's own client (see
 * ClientDetailPage.tsx) — a role belonging to any other client has an empty catalog
 * by design, so there's nothing to show here for it. */
const IAM_CLIENT_ID = (import.meta.env.VITE_IAM_CLIENT_ID as string | undefined) ?? ''

export default function RoleDetailPage() {
  const { t } = useTranslation('roles')
  const { roleId } = useParams<{ roleId: string }>()
  const { data, isLoading, isError } = useGetRoleQuery(roleId ?? '', { skip: !roleId })
  const role = data?.data

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full max-w-lg" />
      </div>
    )
  }

  if (isError || !role) return <EmptyState title="Role not found" />

  return (
    <div>
      <PageHeader
        title={role.name}
        description={role.description || 'No description'}
        actions={<Badge tone="info">Client: {role.client?.clientId ?? role.clientIdInternal}</Badge>}
      />
      <Tabs
        items={[
          { key: 'general', label: t('tabs.general'), content: <RoleGeneralTab role={role} /> },
          {
            key: 'composite',
            label: t('tabs.composite'),
            content: (
              <CompositeRoleEditor
                roleId={role.roleId}
                clientIdInternal={role.clientIdInternal}
                isOwner={Boolean(role.client?.isOwner)}
                clientName={role.client?.clientId}
              />
            ),
          },
          { key: 'permissions', label: t('tabs.permissions'), content: <RolePermissionPanel role={role} /> },
          { key: 'users', label: t('tabs.users'), content: <RoleUsersTab roleId={role.roleId} /> },
          ...(role.client?.clientId === IAM_CLIENT_ID
            ? [{ key: 'dashboard-views', label: 'Dashboard', content: <RoleDashboardViewsTab role={role} /> }]
            : []),
        ]}
      />
    </div>
  )
}
