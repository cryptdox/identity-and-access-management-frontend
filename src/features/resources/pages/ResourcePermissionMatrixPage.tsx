import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { useGetClientQuery } from '@/api/endpoints/client.api'
import { useListResourcesQuery } from '@/api/endpoints/resource.api'
import { useListPermissionsQuery } from '@/api/endpoints/permission.api'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { Button } from '@/common/components/ui/Button'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { ResourceMatrixTable } from '@/features/resources/components/ResourceMatrixTable'
import { AddResourceModal } from '@/features/resources/components/AddResourceModal'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'

export default function ResourcePermissionMatrixPage() {
  const { t } = useTranslation('resources')
  const { clientIdInternal } = useParams<{ clientIdInternal: string }>()
  const canCreate = useCan(ResourceName.RESOURCE, TypeAction.CREATE)
  const [modalOpen, setModalOpen] = useState(false)

  const { data: clientData, isLoading: isClientLoading } = useGetClientQuery(clientIdInternal ?? '', {
    skip: !clientIdInternal,
  })
  const { data: resourcesData, isLoading: isResourcesLoading } = useListResourcesQuery(
    { clientIdInternal: clientIdInternal ?? '', limit: 200 },
    { skip: !clientIdInternal },
  )
  const { data: permissionsData, isLoading: isPermissionsLoading } = useListPermissionsQuery({ limit: 1000 })

  const rows = useMemo(() => {
    const resources = resourcesData?.data?.items ?? []
    const permissions = permissionsData?.data?.items ?? []
    return resources.map((resource) => {
      const permissionByAction = new Map(
        permissions.filter((p) => p.resourceId === resource.resourceId).map((p) => [p.action, p] as const),
      )
      return { resource, permissionByAction }
    })
  }, [resourcesData, permissionsData])

  const isLoading = isClientLoading || isResourcesLoading || isPermissionsLoading
  const client = clientData?.data

  if (!clientIdInternal) return null

  return (
    <div>
      <PageHeader
        title={t('title')}
        description={client ? t('description', { clientId: client.clientId }) : 'Loading…'}
        actions={
          canCreate &&
          client && (
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="size-4" /> {t('addResource')}
            </Button>
          )
        }
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full max-w-3xl" />
      ) : rows.length === 0 ? (
        <EmptyState title={t('empty')} description={t('emptyHint')} />
      ) : (
        <ResourceMatrixTable rows={rows} clientIdInternal={clientIdInternal} />
      )}

      {client?.clientId && (
        <AddResourceModal open={modalOpen} onClose={() => setModalOpen(false)} clientId={client.clientId} />
      )}
    </div>
  )
}
