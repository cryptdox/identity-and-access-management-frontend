import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { useRealmMutations } from '@/features/realms/hooks/useRealmMutations'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { Button } from '@/common/components/ui/Button'
import { confirm } from '@/common/utils/confirm'
import { RealmsListTab } from '@/features/realms/components/RealmsListTab'

export default function RealmListPage() {
  const { t } = useTranslation('realms')
  const navigate = useNavigate()
  const { isMasterRealmUser } = useCurrentUser()
  const { resetAllRateLimiters, isResettingAllRateLimiters } = useRealmMutations()

  async function handleResetAllRateLimiters() {
    const confirmed = await confirm({
      title: 'Reset all rate limiters',
      message:
        "Clears login/register/email/reset-password rate-limit counters for EVERY realm, not just one. Anyone currently blocked anywhere can retry immediately — only use this for a genuine platform-wide issue.",
      confirmLabel: 'Reset all rate limiters',
      danger: true,
    })
    if (!confirmed) return
    await resetAllRateLimiters()
  }

  return (
    <div>
      <PageHeader
        title={t('list.title')}
        description={t('list.description')}
        actions={
          <div className="flex items-center gap-2">
            {isMasterRealmUser && (
              <Button size="sm" variant="outline" loading={isResettingAllRateLimiters} onClick={() => void handleResetAllRateLimiters()}>
                Reset all rate limiters
              </Button>
            )}
            <Button size="sm" onClick={() => navigate('/realms/new')}>
              <Plus className="size-4" /> {t('new')}
            </Button>
          </div>
        }
      />

      <RealmsListTab />
    </div>
  )
}
