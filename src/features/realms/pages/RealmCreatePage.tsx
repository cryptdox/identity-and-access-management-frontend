import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { RealmCreateForm } from '@/features/realms/components/RealmCreateForm'

export default function RealmCreatePage() {
  const { t } = useTranslation('realms')
  return (
    <div>
      <PageHeader title={t('create.title')} description={t('create.description')} />
      <RealmCreateForm />
    </div>
  )
}
