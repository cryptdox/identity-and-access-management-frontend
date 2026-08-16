import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetGroupQuery } from '@/api/endpoints/group.api'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { Tabs } from '@/common/components/ui/Tabs'
import { GroupGeneralTab } from '@/features/groups/components/GroupGeneralTab'
import { GroupRolesTab } from '@/features/groups/components/GroupRolesTab'
import { GroupMembersTab } from '@/features/groups/components/GroupMembersTab'

export default function GroupDetailPage() {
  const { t } = useTranslation('groups')
  const { groupId } = useParams<{ groupId: string }>()
  const { data, isLoading, isError } = useGetGroupQuery(groupId ?? '', { skip: !groupId })
  const group = data?.data

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full max-w-lg" />
      </div>
    )
  }

  if (isError || !group) return <EmptyState title="Group not found" />

  return (
    <div>
      <PageHeader
        title={group.name}
        description={group.parent ? `Nested under ${group.parent.name}` : t('topLevelGroup')}
      />
      <Tabs
        items={[
          { key: 'general', label: t('tabs.general'), content: <GroupGeneralTab group={group} /> },
          { key: 'roles', label: t('tabs.roles'), content: <GroupRolesTab groupId={group.groupId} /> },
          { key: 'members', label: t('tabs.members'), content: <GroupMembersTab groupId={group.groupId} /> },
        ]}
      />
    </div>
  )
}
