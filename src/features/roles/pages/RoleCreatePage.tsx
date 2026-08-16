import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { RoleCreateForm } from '@/features/roles/components/RoleCreateForm'

export default function RoleCreatePage() {
  const { t } = useTranslation('roles')
  return (
    <div>
      <PageHeader title={t('create.title')} description={t('create.description')} />
      <RoleCreateForm />
    </div>
  )
}
