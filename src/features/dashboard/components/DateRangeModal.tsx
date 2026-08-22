import { useEffect, useState, type CSSProperties } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import 'react-day-picker/style.css'
import { Modal } from '@/common/components/ui/Modal'
import { Button } from '@/common/components/ui/Button'

// Matches the app's own primary token so the calendar's accent doesn't clash with
// the rest of the theme (light/dark both resolve --tk-primary correctly already).
// Day cells are also shrunk well below the 44px default — this is a small popup
// control, not a full-page calendar.
const RDP_THEME_VARS = {
  '--rdp-accent-color': 'var(--tk-primary)',
  '--rdp-day-width': '1.85rem',
  '--rdp-day-height': '1.85rem',
  '--rdp-day_button-width': '1.75rem',
  '--rdp-day_button-height': '1.75rem',
  '--rdp-nav-height': '2rem',
  '--rdp-nav_button-width': '1.75rem',
  '--rdp-nav_button-height': '1.75rem',
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

  // The modal never unmounts between opens (it's always rendered, just hidden), so
  // `range`'s useState initializer only ever ran once — without this, clicking
  // around and then closing without Apply left those abandoned clicks in place for
  // the next time the modal opens, instead of showing the last actually-applied
  // range.
  useEffect(() => {
    if (open) setRange(initialFrom ? { from: initialFrom, to: initialTo } : undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function handleApply() {
    if (range?.from && range?.to) {
      onApply({ from: range.from, to: range.to })
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Select date range" size="sm">
      <div className="max-h-[75vh] overflow-y-auto">
        <div style={RDP_THEME_VARS} className="flex justify-center text-xs">
          <DayPicker
            mode="range"
            numberOfMonths={1}
            selected={range}
            onSelect={setRange}
            disabled={{ after: new Date() }}
            defaultMonth={initialFrom}
          />
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
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
