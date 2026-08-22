import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarRange } from 'lucide-react'
import { Button } from '@/common/components/ui/Button'
import { DateRangeModal } from '@/features/dashboard/components/DateRangeModal'
import type { DashboardGranularity, DashboardTimeRange } from '@/features/dashboard/dashboard.types'

type Preset = '24H' | '7D' | '30D' | '1Y' | 'CUSTOM'

const PRESET_LABELS: Record<Preset, string> = { '24H': '24h', '7D': '7d', '30D': '30d', '1Y': '1y', CUSTOM: 'Custom' }
const PRESET_DAYS: Record<Exclude<Preset, 'CUSTOM'>, number> = { '24H': 1, '7D': 7, '30D': 30, '1Y': 365 }

function granularityForSpanDays(days: number): DashboardGranularity {
  if (days <= 2) return 'HOURLY'
  if (days <= 60) return 'DAILY'
  if (days <= 180) return 'WEEKLY'
  return 'MONTHLY'
}

function formatRangeLabel(from: Date, to: Date, granularity: DashboardGranularity): string {
  const opts: Intl.DateTimeFormatOptions =
    granularity === 'HOURLY'
      ? { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
      : { year: 'numeric', month: 'short', day: 'numeric' }
  return `${from.toLocaleString(undefined, opts)} – ${to.toLocaleString(undefined, opts)}`
}

interface Resolved {
  range: DashboardTimeRange | null
  label: string
  error: string | null
}

function resolve(preset: Preset, offset: number, customFrom: Date | null, customTo: Date | null): Resolved {
  if (preset === 'CUSTOM') {
    if (!customFrom || !customTo) {
      return { range: null, label: 'Pick a date range', error: null }
    }
    if (customFrom >= customTo) {
      return { range: null, label: '', error: 'Start date must be before the end date.' }
    }
    const now = new Date()
    if (customTo > now) {
      return { range: null, label: '', error: 'End date can’t be in the future.' }
    }
    const days = (customTo.getTime() - customFrom.getTime()) / (1000 * 60 * 60 * 24)
    if (days > 5 * 365) {
      return { range: null, label: '', error: 'Custom range can’t span more than 5 years.' }
    }
    const granularity = granularityForSpanDays(days)
    return {
      range: { from: customFrom.toISOString(), to: customTo.toISOString(), granularity },
      label: formatRangeLabel(customFrom, customTo, granularity),
      error: null,
    }
  }

  const days = PRESET_DAYS[preset]
  const to = new Date(Date.now() - offset * days * 24 * 60 * 60 * 1000)
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000)
  const granularity = granularityForSpanDays(days)
  return { range: { from: from.toISOString(), to: to.toISOString(), granularity }, label: formatRangeLabel(from, to, granularity), error: null }
}

/** Shared control for every *_TIMESERIES view on the dashboard — one range applies
 * to all of them at once. Defaults to the last 1 year. Presets (24h/7d/30d/1y) can be
 * paged backward/forward with the arrow buttons (e.g. "the 7 days before that"); a
 * Custom range opens a single calendar to pick both the start and end date at once
 * (click once for the start, again for the end), validated before it's applied
 * (inverted/future/too-large ranges show an inline error and never fire onChange
 * with bad data). Granularity is derived from the resolved span rather than a
 * separate control. */
export function TimeRangePicker({ onChange }: { onChange: (range: DashboardTimeRange) => void }) {
  const [preset, setPreset] = useState<Preset>('1Y')
  const [offset, setOffset] = useState(0)
  const [customFrom, setCustomFrom] = useState<Date | null>(null)
  const [customTo, setCustomTo] = useState<Date | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const resolved = useMemo(() => resolve(preset, offset, customFrom, customTo), [preset, offset, customFrom, customTo])

  useEffect(() => {
    if (resolved.range) onChange(resolved.range)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved.range?.from, resolved.range?.to, resolved.range?.granularity])

  function selectPreset(p: Preset) {
    setPreset(p)
    setOffset(0)
    if (p === 'CUSTOM') setCalendarOpen(true)
  }

  return (
    <div className="mb-4 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {(['24H', '7D', '30D', '1Y', 'CUSTOM'] as Preset[]).map((p) => (
          <Button key={p} type="button" size="sm" variant={preset === p ? 'primary' : 'outline'} onClick={() => selectPreset(p)}>
            {PRESET_LABELS[p]}
          </Button>
        ))}

        {preset !== 'CUSTOM' && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setOffset((o) => o + 1)}
              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-alt"
              aria-label="Previous period"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setOffset((o) => Math.max(0, o - 1))}
              disabled={offset === 0}
              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-alt disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Next period"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}

        {preset === 'CUSTOM' && (
          <Button type="button" size="sm" variant="outline" onClick={() => setCalendarOpen(true)}>
            <CalendarRange className="size-4" />
            {customFrom && customTo ? resolved.label : 'Pick dates'}
          </Button>
        )}
      </div>

      {preset !== 'CUSTOM' && (resolved.error ? <p className="text-xs text-danger">{resolved.error}</p> : <p className="text-xs text-text-secondary">{resolved.label}</p>)}
      {preset === 'CUSTOM' && resolved.error && <p className="text-xs text-danger">{resolved.error}</p>}

      <DateRangeModal
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        initialFrom={customFrom ?? undefined}
        initialTo={customTo ?? undefined}
        onApply={({ from, to }) => {
          setCustomFrom(from)
          setCustomTo(to)
        }}
      />
    </div>
  )
}
