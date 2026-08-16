import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { UserCreateForm } from '@/features/users/components/UserCreateForm'

export default function UserCreatePage() {
  const { t } = useTranslation('users')
  return (
    <div>
      <PageHeader title={t('create.title')} description={t('create.description')} />
      <UserCreateForm />
    </div>
  )
}
