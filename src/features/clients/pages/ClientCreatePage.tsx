import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { ClientCreateForm } from '@/features/clients/components/ClientCreateForm'

export default function ClientCreatePage() {
  const { t } = useTranslation('clients')
  return (
    <div>
      <PageHeader title={t('create.title')} description={t('create.description')} />
      <ClientCreateForm />
    </div>
  )
}
