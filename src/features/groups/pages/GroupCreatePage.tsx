import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { GroupCreateForm } from '@/features/groups/components/GroupCreateForm'

export default function GroupCreatePage() {
  const { t } = useTranslation('groups')
  return (
    <div>
      <PageHeader title={t('create.title')} description={t('create.description')} />
      <GroupCreateForm />
    </div>
  )
}
