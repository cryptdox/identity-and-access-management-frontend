import { useState } from 'react'
import { CalendarRange, X } from 'lucide-react'
import { Button } from '@/common/components/ui/Button'
import { DateRangeModal } from '@/features/dashboard/components/DateRangeModal'

/** Same single-calendar range picker the dashboard's TimeRangePicker uses
 * (click once for the start, again for the end) — reused here as a plain
 * from/to filter, with no presets/granularity since this isn't chart data. */
export function DateRangeFilter({
  from,
  to,
  onChange,
}: {
  from: Date | null
  to: Date | null
  onChange: (range: { from: Date | null; to: Date | null }) => void
}) {
  const [open, setOpen] = useState(false)

  const label = from && to ? `${from.toLocaleDateString()} – ${to.toLocaleDateString()}` : 'Date range'

  return (
    <div className="flex items-center gap-1">
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        <CalendarRange className="size-4" />
        {label}
      </Button>
      {from && to && (
        <button
          type="button"
          onClick={() => onChange({ from: null, to: null })}
          aria-label="Clear date range"
          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-alt"
        >
          <X className="size-3.5" />
        </button>
      )}
      <DateRangeModal
        open={open}
        onClose={() => setOpen(false)}
        initialFrom={from ?? undefined}
        initialTo={to ?? undefined}
        onApply={({ from: f, to: t }) => onChange({ from: f, to: t })}
      />
    </div>
  )
}
