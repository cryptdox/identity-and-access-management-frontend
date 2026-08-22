import { useTranslation } from 'react-i18next'
import { Select } from '@/common/components/ui/Select'
import { Input } from '@/common/components/ui/Input'
import { TypeEvent } from '@/api/types/enums.types'

export function EventFilterBar({
  type,
  onTypeChange,
  userId,
  onUserIdChange,
  hideUserFilter,
}: {
  type: string
  onTypeChange: (value: string) => void
  userId: string
  onUserIdChange: (value: string) => void
  // True when the backend is force-scoping this list to the caller's own events
  // (no EVENT:READ_ALL) — the userId filter would be a dead control in that case.
  hideUserFilter?: boolean
}) {
  const { t } = useTranslation('events')
  const typeOptions = [
    { value: '', label: t('filter.allTypes') },
    ...Object.values(TypeEvent).map((eventType) => ({ value: eventType, label: eventType })),
  ]

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <div className="w-56">
        <Select options={typeOptions} value={type} onChange={(e) => onTypeChange(e.target.value)} />
      </div>
      {!hideUserFilter && (
        <div className="w-64">
          <Input placeholder={t('filterByUser')} value={userId} onChange={(e) => onUserIdChange(e.target.value)} />
        </div>
      )}
    </div>
  )
}
