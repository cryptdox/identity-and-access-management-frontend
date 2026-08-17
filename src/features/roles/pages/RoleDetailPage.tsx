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
            content: <CompositeRoleEditor roleId={role.roleId} clientIdInternal={role.clientIdInternal} />,
          },
          { key: 'permissions', label: t('tabs.permissions'), content: <RolePermissionPanel role={role} /> },
        ]}
      />
    </div>
  )
}
