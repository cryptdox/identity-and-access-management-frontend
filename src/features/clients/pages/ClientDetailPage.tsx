import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Boxes } from 'lucide-react'
import { useGetClientQuery } from '@/api/endpoints/client.api'
import { useRealmId } from '@/common/hooks/useRealmId'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { Button } from '@/common/components/ui/Button'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { Tabs } from '@/common/components/ui/Tabs'
import { ClientGeneralTab } from '@/features/clients/components/ClientGeneralTab'
import { ClientSecretTab } from '@/features/clients/components/ClientSecretTab'
import { ClientRolesTab } from '@/features/clients/components/ClientRolesTab'
import { ClientRedirectUrisForm } from '@/features/clients/components/ClientRedirectUrisForm'
import { ClientDashboardViewsForm } from '@/features/dashboard/components/ClientDashboardViewsForm'

/** Dashboard views are an admin-console concept — every metric is computed from the
 * caller's own realm, never from a client's own business data — so the catalog only
 * makes sense for the client the admin console itself runs behind. */
const IAM_CLIENT_ID = (import.meta.env.VITE_IAM_CLIENT_ID as string | undefined) ?? ''

export default function ClientDetailPage() {
  const { t } = useTranslation('clients')
  const { clientIdInternal } = useParams<{ clientIdInternal: string }>()
  const realmId = useRealmId()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useGetClientQuery({ clientIdInternal: clientIdInternal ?? '', realmId }, { skip: !clientIdInternal })
  const client = data?.data

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full max-w-lg" />
      </div>
    )
  }

  if (isError || !client) return <EmptyState title="Client not found" />

  return (
    <div>
      <PageHeader
        title={client.clientId ?? client.clientIdInternal}
        description={client.name || 'No display name'}
        actions={
          <Button size="sm" variant="outline" onClick={() => navigate(`/r/${realmId}/clients/${client.clientIdInternal}/resources`)}>
            <Boxes className="size-4" /> {t('resourcesAndPermissions')}
          </Button>
        }
      />
      <Tabs
        items={[
          { key: 'general', label: t('tabs.general'), content: <ClientGeneralTab client={client} /> },
          {
            key: 'redirect-uris',
            label: 'Redirect URIs',
            content: <ClientRedirectUrisForm client={client} />,
          },
          ...(client.clientId === IAM_CLIENT_ID
            ? [
                {
                  key: 'dashboard-views',
                  label: 'Dashboard views',
                  content: <ClientDashboardViewsForm client={client} />,
                },
              ]
            : []),
          { key: 'secret', label: t('tabs.secret'), content: <ClientSecretTab client={client} /> },
          { key: 'roles', label: t('tabs.roles'), content: <ClientRolesTab clientIdInternal={client.clientIdInternal} /> },
        ]}
      />
    </div>
  )
}
