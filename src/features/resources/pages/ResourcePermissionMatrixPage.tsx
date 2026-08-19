import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { useGetClientQuery } from '@/api/endpoints/client.api'
import { useListResourcesQuery } from '@/api/endpoints/resource.api'
import { useListPermissionsByClientQuery } from '@/api/endpoints/permission.api'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { Button } from '@/common/components/ui/Button'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { ResourceMatrixTable } from '@/features/resources/components/ResourceMatrixTable'
import { AddResourceModal } from '@/features/resources/components/AddResourceModal'
import { useCan } from '@/common/hooks/usePermission'
import { ClientOwnerOnlyNotice } from '@/common/components/ui/ClientOwnerOnlyNotice'
import { ResourceName, TypeAction } from '@/api/types/enums.types'

export default function ResourcePermissionMatrixPage() {
  const { t } = useTranslation('resources')
  const { clientIdInternal } = useParams<{ clientIdInternal: string }>()
  const [modalOpen, setModalOpen] = useState(false)

  const { data: clientData, isLoading: isClientLoading } = useGetClientQuery(clientIdInternal ?? '', {
    skip: !clientIdInternal,
  })
  const client = clientData?.data
  // Creating resources for a client is restricted server-side to its owning realm
  // (client.isOwner already folds in the Master bypass).
  const canCreate = useCan(ResourceName.RESOURCE, TypeAction.CREATE) && Boolean(client?.isOwner)
  const { data: resourcesData, isLoading: isResourcesLoading } = useListResourcesQuery(
    { clientIdInternal: clientIdInternal ?? '', limit: 200 },
    { skip: !clientIdInternal },
  )
  const { data: permissionsData, isLoading: isPermissionsLoading } = useListPermissionsByClientQuery({ clientIdInternal: clientIdInternal ?? '', limit: 1000 })

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

      {client && !client.isOwner && (
        <ClientOwnerOnlyNotice feature="create, update, or delete resources and permissions" clientName={client.clientId} />
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full max-w-3xl" />
      ) : rows.length === 0 ? (
        <EmptyState title={t('empty')} description={t('emptyHint')} />
      ) : (
        <ResourceMatrixTable rows={rows} clientIdInternal={clientIdInternal} isOwner={Boolean(client?.isOwner)} />
      )}

      {client?.clientId && (
        <AddResourceModal open={modalOpen} onClose={() => setModalOpen(false)} clientId={client.clientId} />
      )}
    </div>
  )
}
