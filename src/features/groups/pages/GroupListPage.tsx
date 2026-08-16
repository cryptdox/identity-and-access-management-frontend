import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { useListGroupsQuery } from '@/api/endpoints/group.api'
import { useRealmId } from '@/common/hooks/useRealmId'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { Button } from '@/common/components/ui/Button'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { GroupTree } from '@/features/groups/components/GroupTree'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'

export default function GroupListPage() {
  const { t } = useTranslation('groups')
  const realmId = useRealmId()
  const navigate = useNavigate()
  const canCreate = useCan(ResourceName.GROUP, TypeAction.CREATE)
  const { data, isLoading } = useListGroupsQuery({ realmId, limit: 200 })
  const groups = data?.data?.items ?? []

  return (
    <div>
      <PageHeader
        title={t('list.title')}
        description={t('list.description')}
        actions={
          canCreate && (
            <Button size="sm" onClick={() => navigate(`/r/${realmId}/groups/new`)}>
              <Plus className="size-4" /> {t('new')}
            </Button>
          )
        }
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full max-w-lg" />
      ) : groups.length === 0 ? (
        <EmptyState title={t('list.empty')} />
      ) : (
        <GroupTree groups={groups} realmId={realmId} />
      )}
    </div>
  )
}
