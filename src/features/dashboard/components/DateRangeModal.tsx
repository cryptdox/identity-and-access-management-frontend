import { useState, type CSSProperties } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import 'react-day-picker/style.css'
import { Modal } from '@/common/components/ui/Modal'
import { Button } from '@/common/components/ui/Button'

// Matches the app's own primary token so the calendar's accent doesn't clash with
// the rest of the theme (light/dark both resolve --tk-primary correctly already).
// Day cells are also shrunk from the 44px default — at default size, two months
// side by side overflowed the modal (and small screens) horizontally.
const RDP_THEME_VARS = {
  '--rdp-accent-color': 'var(--tk-primary)',
  '--rdp-day-width': '2.25rem',
  '--rdp-day-height': '2.25rem',
  '--rdp-day_button-width': '2.1rem',
  '--rdp-day_button-height': '2.1rem',
} as CSSProperties

/** A single calendar where both the start and end date are picked in one place —
 * click once for the start, click again for the end, with the days between
 * previewed as you hover. Replaces two separate native date inputs. */
export function DateRangeModal({
  open,
  onClose,
  initialFrom,
  initialTo,
  onApply,
}: {
  open: boolean
  onClose: () => void
  initialFrom?: Date
  initialTo?: Date
  onApply: (range: { from: Date; to: Date }) => void
}) {
  const [range, setRange] = useState<DateRange | undefined>(
    initialFrom ? { from: initialFrom, to: initialTo } : undefined,
  )

  function handleApply() {
    if (range?.from && range?.to) {
      onApply({ from: range.from, to: range.to })
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Select date range" size="lg">
      <div className="max-h-[75vh] overflow-y-auto">
        <div style={RDP_THEME_VARS} className="flex justify-center overflow-x-auto">
          <DayPicker
            mode="range"
            numberOfMonths={2}
            selected={range}
            onSelect={setRange}
            disabled={{ after: new Date() }}
            defaultMonth={initialFrom}
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" size="sm" disabled={!range?.from || !range?.to} onClick={handleApply}>
          Apply
        </Button>
      </div>
    </Modal>
  )
}
