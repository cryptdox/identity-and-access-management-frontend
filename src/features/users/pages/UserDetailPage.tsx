import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetUserQuery } from '@/api/endpoints/user.api'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { Tabs } from '@/common/components/ui/Tabs'
import { UserProfileTab } from '@/features/users/components/UserProfileTab'
import { UserAttributesTab } from '@/features/users/components/UserAttributesTab'
import { UserCredentialsTab } from '@/features/users/components/UserCredentialsTab'
import { UserSessionsTab } from '@/features/users/components/UserSessionsTab'
import { UserRolesTab } from '@/features/users/components/UserRolesTab'
import { UserGroupsTab } from '@/features/users/components/UserGroupsTab'

export default function UserDetailPage() {
  const { t } = useTranslation('users')
  const { userId } = useParams<{ userId: string }>()
  const { data, isLoading, isError } = useGetUserQuery(userId ?? '', { skip: !userId })
  const user = data?.data

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full max-w-lg" />
      </div>
    )
  }

  if (isError || !user) {
    return <EmptyState title="User not found" />
  }

  return (
    <div>
      <PageHeader title={user.username} description={user.email} />
      <Tabs
        items={[
          { key: 'profile', label: t('tabs.profile'), content: <UserProfileTab user={user} /> },
          { key: 'roles', label: t('tabs.roles'), content: <UserRolesTab userId={user.userId} /> },
          { key: 'groups', label: t('tabs.groups'), content: <UserGroupsTab userId={user.userId} /> },
          { key: 'attributes', label: t('tabs.attributes'), content: <UserAttributesTab userId={user.userId} /> },
          { key: 'credentials', label: t('tabs.credentials'), content: <UserCredentialsTab userId={user.userId} /> },
          { key: 'sessions', label: t('tabs.sessions'), content: <UserSessionsTab userId={user.userId} /> },
        ]}
      />
    </div>
  )
}
