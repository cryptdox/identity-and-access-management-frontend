import { useTranslation } from 'react-i18next'
import { useGetRealmQuery } from '@/api/endpoints/realm.api'
import { useRealmId } from '@/common/hooks/useRealmId'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { Tabs } from '@/common/components/ui/Tabs'
import { RealmGeneralForm } from '@/features/realms/components/RealmGeneralForm'
import { RealmSettingsForm } from '@/features/realms/components/RealmSettingsForm'
import { RealmPackageTab } from '@/features/realms/components/RealmPackageTab'

export default function RealmSettingsPage() {
  const { t } = useTranslation('realms')
  const realmId = useRealmId()
  const { data, isLoading } = useGetRealmQuery(realmId)
  const realm = data?.data

  return (
    <div>
      <PageHeader title={t('settings.title')} description={t('settings.description')} />

      {isLoading || !realm ? (
        <div className="max-w-lg space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <Tabs
          items={[
            { key: 'general', label: t('settings.general'), content: <RealmGeneralForm realm={realm} /> },
            {
              key: 'advanced',
              label: t('settings.advanced'),
              content: <RealmSettingsForm realmId={realmId} />,
            },
            { key: 'package', label: 'Package', content: <RealmPackageTab realmId={realmId} /> },
          ]}
        />
      )}
    </div>
  )
}
